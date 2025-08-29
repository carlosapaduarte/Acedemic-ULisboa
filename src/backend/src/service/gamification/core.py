# Em src/backend/src/service/gamification/core.py

from operator import or_
from sqlmodel import Session, select
from datetime import datetime, timezone, timedelta, date
from typing import List, Dict, Any, Optional, Set, Tuple
import logging
from sqlalchemy.orm import selectinload, joinedload 
from repository.sql.models.models import Badge, UserBadge, UserMetric, League, UserLeague
from service.gamification.badge_evaluators import create_badge_criteria_evaluator

logger = logging.getLogger(__name__)

# --- FUNÇÕES ORQUESTRADORAS (Coordenam as ações) ---

def update_login_streak(db: Session, user_id: int) -> List[Badge]: # Adicionado o tipo de retorno
    """Atualiza a sequência de login, avalia medalhas/ligas e DEVOLVE as medalhas ganhas."""
    # Removemos os prints de debug para limpar o código
    user_metrics = _get_or_create_user_metrics(db, user_id)
    today = datetime.now(timezone.utc).date()
    last_login_date = user_metrics.last_login_at.date() if user_metrics.last_login_at else None
    
    user_metrics.last_login_at = datetime.now(timezone.utc)
    
    if last_login_date == today:
        db.add(user_metrics); db.commit(); 
        return [] # Retorna lista vazia se for login no mesmo dia

    if last_login_date and last_login_date == today - timedelta(days=1):
        user_metrics.login_streak += 1
    else:
        user_metrics.login_streak = 1

    db.add(user_metrics); db.commit(); db.refresh(user_metrics)
    
    newly_awarded, all_earned_codes = evaluate_and_award_badges(db, user_id, context={"action": "login"})
    
    if newly_awarded: # Só avalia ligas se ganhou medalhas novas
        evaluate_and_promote_leagues(db, user_id, all_earned_codes)
        
    return newly_awarded # <-- DEVOLVE as medalhas recém-ganhas

  
def update_challenge_completion_metrics(db: Session, user_id: int) -> List[Badge]:
    """Incrementa métricas de desafio, avalia tudo, e DEVOLVE as medalhas ganhas."""
    user_metrics = _get_or_create_user_metrics(db, user_id)
    today = date.today()
    user_metrics.completed_challenges_count += 1
    
    user_metrics.challenges_completed_in_current_level += 1

    last_completion = user_metrics.last_challenge_completion_date
    if not last_completion or last_completion != today - timedelta(days=1):
        user_metrics.challenge_completion_streak = 1
    elif last_completion == today - timedelta(days=1):
        user_metrics.challenge_completion_streak += 1
    
    user_metrics.last_challenge_completion_date = today
    db.add(user_metrics); db.commit(); db.refresh(user_metrics)

    # 1. Avalia as medalhas e obtém a lista COMPLETA de códigos de medalhas ganhas
    newly_awarded, all_earned_codes = evaluate_and_award_badges(db, user_id)
    
    # 2. A promoção só é verificada se medalhas novas foram ganhas
    if newly_awarded:
        evaluate_and_promote_leagues(db, user_id, all_earned_codes)
        
    return newly_awarded

# --- FUNÇÕES DE LÓGICA (Executam as tarefas) ---

def evaluate_and_award_badges(db: Session, user_id: int, context: Dict[str, Any] = None) -> (List[Badge], Set[str]):
    """Avalia e atribui medalhas. Devolve as medalhas novas E o conjunto completo de códigos de medalhas ganhas."""
    if context is None: context = {}
    
    user_metrics = _get_or_create_user_metrics(db, user_id)
    user_metrics_dict = user_metrics.model_dump()

    user_earned_badges_associations = get_user_earned_badges(db, user_id)
    earned_badge_ids = {ub.badge_id for ub in user_earned_badges_associations}
    earned_badge_codes = {ub.badge.code for ub in user_earned_badges_associations if ub.badge}
    context["earned_badge_codes"] = earned_badge_codes

    current_level = user_metrics.current_challenge_level

    # --- CORREÇÃO DO TypeError ---
    where_conditions = [
        Badge.is_active == True,
        Badge.app_scope == "academic_challenge"
    ]

    level_conditions = [League.rank == 0]
    if current_level is not None:
        level_conditions.append(League.rank == current_level)
    
    # Só usa `or_` se houver mais de uma condição, senão adiciona a condição única diretamente
    if len(level_conditions) > 1:
        where_conditions.append(or_(*level_conditions))
    elif level_conditions:
        where_conditions.append(level_conditions[0])
    # --- FIM DA CORREÇÃO ---

    statement = (
        select(Badge)
        .join(League, Badge.league_id == League.id)
        .where(*where_conditions)
    )
    
    all_relevant_badges = db.exec(statement).all()
    all_relevant_badges.sort(key=lambda b: b.criteria_json.get("type") == "required_badges", reverse=True)
    
    newly_awarded_badges = []
    for badge in all_relevant_badges:
        if badge.id not in earned_badge_ids and badge.criteria_json:
            evaluator = create_badge_criteria_evaluator(badge.criteria_json)
            if evaluator and evaluator.evaluate(user_metrics_dict, context):
                new_user_badge = UserBadge(user_id=user_id, badge_id=badge.id) # awarded_at tem default
                db.add(new_user_badge)
                newly_awarded_badges.append(badge)
                print("="*50); print(f"🏆 MEDALHA ATRIBUÍDA: '{badge.title}' ao utilizador ID: {user_id}"); print("="*50)
                earned_badge_ids.add(badge.id)
                earned_badge_codes.add(badge.code)
                context["earned_badge_codes"] = earned_badge_codes
    
    if newly_awarded_badges:
        db.commit()

    # Devolve o set completo de códigos de medalhas após a atribuição
    final_earned_codes = {ub.badge.code for ub in get_user_earned_badges(db, user_id) if ub.badge}
    return newly_awarded_badges, final_earned_codes

def evaluate_and_promote_leagues(db: Session, user_id: int, earned_badge_codes: Set[str]):
    """Avalia a promoção de Níveis/Ligas usando a lista de códigos de medalhas fornecida."""
    logger.info(f"A verificar promoções de nível para o utilizador {user_id}...")
    all_leagues = get_all_leagues(db)
    user_leagues_memberships = db.exec(select(UserLeague).where(UserLeague.user_id == user_id)).all()
    user_league_ids = {membership.league_id for membership in user_leagues_memberships}
    
    for league in all_leagues:
        if league.id in user_league_ids: continue
        criteria = league.promotion_criteria_json
        if not criteria: continue
        promoted = False
        if criteria.get("type") == "required_badges":
            required_codes = set(criteria.get("badges", []))
            min_count = criteria.get("min_count", len(required_codes))
            if len(earned_badge_codes.intersection(required_codes)) >= min_count:
                promoted = True
        
        if promoted:
            new_membership = UserLeague(user_id=user_id, league_id=league.id)
            db.add(new_membership); db.commit()
            print("="*50); print(f"🚀 UTILIZADOR PROMOVIDO para o Nível '{league.name}'!"); print("="*50)
            logger.info(f"Utilizador {user_id} promovido para a Liga '{league.name}'")

# --- FUNÇÕES DE APOIO (Buscam dados) ---
def get_all_badges_for_app_scope(db: Session, app_scope: str) -> List[Tuple[Badge, League]]:
    """
    Busca todas as medalhas ativas, retornando um par (Badge, League) para cada resultado.
    Esta é a forma mais robusta de garantir que a relação é carregada.
    """
    query = (
        select(Badge, League)
        .join(League, Badge.league_id == League.id)
        .order_by(Badge.display_order)
    )
    
    if app_scope and app_scope != "all":
        query = query.where((Badge.app_scope == "common") | (Badge.app_scope == app_scope))
        
    results = db.exec(query).all()
    return results

def get_user_earned_badges(db: Session, user_id: int) -> List[UserBadge]:
    statement = (select(UserBadge).where(UserBadge.user_id == user_id).options(selectinload(UserBadge.badge).selectinload(Badge.league)))
    return db.exec(statement).all()

def get_all_leagues(db: Session) -> List[League]:
    return db.exec(select(League).order_by(League.rank)).all()

def get_user_current_league_membership(db: Session, user_id: int) -> Optional[UserLeague]:
    statement = (select(UserLeague).join(League).where(UserLeague.user_id == user_id).order_by(League.rank.desc()).options(selectinload(UserLeague.league)))
    return db.exec(statement).first()

def _get_or_create_user_metrics(db: Session, user_id: int) -> UserMetric:
    user_metrics = db.exec(select(UserMetric).where(UserMetric.user_id == user_id)).first()
    if not user_metrics:
        user_metrics = UserMetric(user_id=user_id)
        db.add(user_metrics); db.commit(); db.refresh(user_metrics)
    return user_metrics

def set_user_challenge_level(db: Session, user_id: int, level: int):
    """Define o nível de desafio ativo para um utilizador."""
    user_metrics = _get_or_create_user_metrics(db, user_id)
    user_metrics.current_challenge_level = level
    
    # Reinicia o contador de desafios para o novo nível
    user_metrics.challenges_completed_in_current_level = 0
    
    db.add(user_metrics)
    db.commit()
    logger.info(f"Nível de desafio do utilizador {user_id} definido para {level}.")
    
def get_user_badge_history(db: Session, user_id: int) -> List[UserBadge]:
    """Busca todas as medalhas que um utilizador ganhou, com as suas datas."""
    statement = (
        select(UserBadge)
        .where(UserBadge.user_id == user_id)
        .options(selectinload(UserBadge.badge).selectinload(Badge.league)) # Carrega badge e league
        .order_by(UserBadge.awarded_at.desc())
    )
    return db.exec(statement).all()