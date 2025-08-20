from sqlmodel import Session, select, and_
from datetime import datetime, timedelta, timezone # Adicionado timezone
from typing import List, Dict, Any, Optional
import logging
from sqlalchemy.orm import selectinload
from repository.sql.models.models import Badge, UserBadge, UserMetric, UserModel, League, UserLeague

from service.gamification.badge_evaluators import create_badge_criteria_evaluator

logger = logging.getLogger(__name__)

def get_all_badges_for_app_scope(db: Session, app_scope: str) -> List[Badge]:
    """Obtém todas as definições de medalhas ativas para um dado scope de aplicação."""
    query = select(Badge).options(selectinload(Badge.league))
    
    if app_scope and app_scope != "all":
        if app_scope == "common":
            query = query.where(Badge.app_scope == "common")
        else:
            query = query.where(
                (Badge.app_scope == "common") | (Badge.app_scope == app_scope)
            )

    badges = db.exec(query).all()
    return badges

def get_user_earned_badges(db: Session, user_id: int) -> List[Badge]:
    """Obtém as medalhas conquistadas por um utilizador específico."""
    statement = (
        select(UserBadge)
        .where(UserBadge.user_id == user_id)
        .options(selectinload(UserBadge.badge).selectinload(Badge.league)) # Carrega UserBadge -> Badge -> League
    )
    user_badge_associations = db.exec(statement).all()
    return [ub.badge for ub in user_badge_associations if ub.badge] # Retorna a lista de objetos Badge

def get_all_leagues(db: Session) -> List[League]:
    """Obtém todas as definições de ligas, ordenadas por rank."""
    result = db.execute(  
        select(League).order_by(League.rank)
    )
    return result.scalars().all()

def get_user_current_league(db: Session, user_id: int) -> Optional[League]:
    """Obtém a liga mais alta do utilizador."""
    result = db.execute(  
        select(League)
        .join(UserLeague, UserLeague.league_id == League.id)
        .where(UserLeague.user_id == user_id)
        .order_by(League.rank.desc()) # A liga de maior rank é a atual
    )
    return result.scalars().first()

def _get_or_create_user_metrics(db: Session, user_id: int) -> UserMetric:
    """Helper para obter ou criar o registo de métricas do utilizador."""
    result = db.execute(  
        select(UserMetric).where(UserMetric.user_id == user_id)
    )
    user_metrics = result.scalar_one_or_none()
    if not user_metrics:
        user_metrics = UserMetric(user_id=user_id)
        db.add(user_metrics)
        db.commit() 
        db.refresh(user_metrics) 
        logger.info(f"Criado novo registo de métricas para o utilizador {user_id}")
    return user_metrics

def evaluate_and_award_badges(db: Session, user_id: int, context: Dict[str, Any] = None):
    """
    Avalia e atribui medalhas a um utilizador com base nas suas métricas atuais.
    """
    user_metrics = _get_or_create_user_metrics(db, user_id) 
    
    # Converter UserMetric para um dicionário para os avaliadores
    user_metrics_dict = user_metrics.model_dump() # SQLModel tem model_dump() para converter para dict
    if user_metrics_dict.get('last_login_at'):
        user_metrics_dict['last_login_at'] = user_metrics_dict['last_login_at'].date() # Apenas a data para streaks

    # Obter IDs das medalhas que o utilizador já tem
    earned_badge_ids_result = db.execute(  
        select(UserBadge.badge_id).where(UserBadge.user_id == user_id)
    )
    earned_badge_ids = {id_ for id_ in earned_badge_ids_result.scalars().all()} # Set para lookup rápido

    # Obter todas as medalhas ativas
    all_active_badges_result = db.execute(  
        select(Badge).where(Badge.is_active == True)
    )
    all_active_badges: List[Badge] = all_active_badges_result.all()

    newly_awarded_badges = []
    for badge in all_active_badges:
        # Só avalia se a medalha ainda não foi ganha e se tem critérios definidos
        if badge.id not in earned_badge_ids and badge.criteria_json:
            evaluator = create_badge_criteria_evaluator(badge.criteria_json)
            if evaluator and evaluator.evaluate(user_metrics_dict, context):
                new_user_badge = UserBadge(
                    user_id=user_id,
                    badge_id=badge.id,
                    awarded_at=datetime.now(timezone.utc)
                )
                db.add(new_user_badge)
                newly_awarded_badges.append(badge)
                logger.info(f"Medalha '{badge.title}' (ID: {badge.id}) atribuída a {user_id}!")

    if newly_awarded_badges:
        db.commit() 
        for badge in newly_awarded_badges:
            db.refresh(badge) 

    return newly_awarded_badges

def evaluate_and_promote_leagues(db: Session, user_id: int):
    """
    Avalia a promoção de ligas para um utilizador.
    """
    user_metrics = _get_or_create_user_metrics(db, user_id) 
    user_metrics_dict = user_metrics.model_dump()

    # Obter as ligas em ordem de rank
    leagues = get_all_leagues(db) 
    
    # Obter as ligas que o utilizador já pertence
    user_leagues_result = db.execute( 
        select(UserLeague).where(UserLeague.user_id == user_id)
    )
    user_current_league_memberships = {ul.league_id: ul for ul in user_leagues_result.all()}
    
    # Obter as medalhas que o utilizador já ganhou para avaliação de critérios
    earned_badge_codes_result = db.execute( 
        select(Badge.code)
        .join(UserBadge, UserBadge.badge_id == Badge.id)
        .where(UserBadge.user_id == user_id)
    )
    earned_badge_codes = set(earned_badge_codes_result.scalars().all())

    # Iterar pelas ligas para tentar promover
    for league in leagues:
        if league.id not in user_current_league_memberships: # Se o utilizador ainda não estiver nesta liga
            if league.promotion_criteria_json:
                criteria = league.promotion_criteria_json
                
                # --- Lógica de Avaliação de Ligas ---
                is_promoted = False
                if criteria.get("type") == "badge_completion_percentage":
                    target_league_code = criteria.get("target_league_code")
                    percentage_required = criteria.get("percentage", 1.0) # Default 100%
                    
                    if target_league_code:
                        target_league_badges_result = db.execute( 
                            select(Badge.code).where(
                                and_(Badge.app_scope == target_league_code, Badge.is_active == True) # Assumindo app_scope para ligar badges a ligas, ou outro campo
                            )
                        )
                        target_league_badge_codes = set(target_league_badges_result.scalars().all())
                        
                        if target_league_badge_codes:
                            earned_in_target_league = len(earned_badge_codes.intersection(target_league_badge_codes))
                            if (earned_in_target_league / len(target_league_badge_codes)) >= percentage_required:
                                is_promoted = True
                    
                elif criteria.get("type") == "required_badges":
                    required_badge_codes = set(criteria.get("badges", []))
                    min_count = criteria.get("min_count", len(required_badge_codes))
                    if len(earned_badge_codes.intersection(required_badge_codes)) >= min_count:
                        is_promoted = True
                
                elif criteria.get("type") == "user_in_challenge": 
                    challenge_code = criteria.get("challenge_code")
                    if challenge_code in user_metrics_dict.get("completed_challenges", []):
                        is_promoted = True

                if is_promoted:
                    new_user_league = UserLeague(
                        user_id=user_id,
                        league_id=league.id,
                        joined_at=datetime.now(timezone.utc)
                    )
                    db.add(new_user_league)
                    logger.info(f"Utilizador {user_id} promovido para a Liga '{league.name}' (ID: {league.id})!")
                    db.commit() 
                    db.refresh(new_user_league) 
                    db.refresh(league) 

                    if league.code.startswith("self_efficacy_"):
                        pass # Implementar lógica de nível aqui

    db.commit() 
    logger.info(f"Avaliação de ligas concluída para o utilizador {user_id}.")

def update_login_streak(db: Session, user_id: int):
    """Atualiza a sequência de login do utilizador e avalia as medalhas/ligas."""
    user_metrics = _get_or_create_user_metrics(db, user_id) 

    today = datetime.now(timezone.utc).date()
    if user_metrics.last_login_at:
        last_login_date = user_metrics.last_login_at.date()
        if last_login_date == today:
            return 
        elif last_login_date == today - timedelta(days=1):
            user_metrics.login_streak += 1
        else:
            user_metrics.login_streak = 1
    else:
        user_metrics.login_streak = 1

    user_metrics.last_login_at = datetime.now(timezone.utc)
    db.add(user_metrics) 
    db.commit() 
    db.refresh(user_metrics) 

    logger.info(f"Métricas de login atualizadas para o utilizador {user_id}: streak {user_metrics.login_streak}")
    # Avaliar e atribuir medalhas/ligas após a atualização das métricas
    evaluate_and_award_badges(db, user_id, context={"action": "login"}) 
    evaluate_and_promote_leagues(db, user_id) 

def add_completed_challenge(db: Session, user_id: int, challenge_code: str):
    """Adiciona um desafio completo às métricas do utilizador e avalia as medalhas/ligas."""
    user_metrics = _get_or_create_user_metrics(db, user_id) 

    if challenge_code not in user_metrics.completed_challenges:
        user_metrics.completed_challenges.append(challenge_code)
        db.add(user_metrics)
        db.commit() 
        db.refresh(user_metrics) 

        logger.info(f"Desafio '{challenge_code}' adicionado para o utilizador {user_id}")
        evaluate_and_award_badges(db, user_id, context={"action": "challenge_complete", "challenge_id": challenge_code}) 
        evaluate_and_promote_leagues(db, user_id) 

def add_pomodoro_cycle(db: Session, user_id: int):
    """Incrementa o contador de ciclos Pomodoro completos e avalia as medalhas/ligas."""
    user_metrics = _get_or_create_user_metrics(db, user_id) 
    user_metrics.total_pomodoro_cycles += 1
    db.add(user_metrics)
    db.commit() 
    db.refresh(user_metrics) 

    logger.info(f"Ciclo Pomodoro incrementado para o utilizador {user_id}. Total: {user_metrics.total_pomodoro_cycles}")
    evaluate_and_award_badges(db, user_id, context={"action": "pomodoro_cycle"}) 
    evaluate_and_promote_leagues(db, user_id) 

def add_completed_task(db: Session, user_id: int):
    """Incrementa o contador de tarefas completas e avalia as medalhas/ligas."""
    user_metrics = _get_or_create_user_metrics(db, user_id) 
    user_metrics.total_tasks_completed += 1
    db.add(user_metrics)
    db.commit() 
    db.refresh(user_metrics) 

    logger.info(f"Tarefa completada para o utilizador {user_id}. Total: {user_metrics.total_tasks_completed}")
    evaluate_and_award_badges(db, user_id, context={"action": "task_complete"}) 
    evaluate_and_promote_leagues(db, user_id) 

def add_notepad_entry(db: Session, user_id: int):
    """Incrementa o contador de registos no bloco de notas e avalia as medalhas/ligas."""
    user_metrics = _get_or_create_user_metrics(db, user_id) 
    user_metrics.total_notepad_entries += 1
    db.add(user_metrics)
    db.commit() 
    db.refresh(user_metrics) 

    logger.info(f"Registo no bloco de notas adicionado para o utilizador {user_id}. Total: {user_metrics.total_notepad_entries}")
    evaluate_and_award_badges(db, user_id, context={"action": "notepad_entry"}) 
    evaluate_and_promote_leagues(db, user_id) 

def add_forum_question(db: Session, user_id: int):
    """Incrementa o contador de perguntas no fórum e avalia as medalhas/ligas."""
    user_metrics = _get_or_create_user_metrics(db, user_id) 
    user_metrics.total_forum_questions += 1
    db.add(user_metrics)
    db.commit() 
    db.refresh(user_metrics) 

    logger.info(f"Pergunta no fórum adicionada para o utilizador {user_id}. Total: {user_metrics.total_forum_questions}")
    evaluate_and_award_badges(db, user_id, context={"action": "forum_question"}) 
    evaluate_and_promote_leagues(db, user_id) 

def add_forum_answer(db: Session, user_id: int):
    """Incrementa o contador de respostas no fórum e avalia as medalhas/ligas."""
    user_metrics = _get_or_create_user_metrics(db, user_id) 
    user_metrics.total_forum_answers += 1
    db.add(user_metrics)
    db.commit() 
    db.refresh(user_metrics) 

    logger.info(f"Resposta no fórum adicionada para o utilizador {user_id}. Total: {user_metrics.total_forum_answers}")
    evaluate_and_award_badges(db, user_id, context={"action": "forum_answer"}) 
    evaluate_and_promote_leagues(db, user_id) 

def add_event_to_calendar(db: Session, user_id: int):
    """Incrementa o contador de eventos adicionados ao calendário e avalia as medalhas/ligas."""
    user_metrics = _get_or_create_user_metrics(db, user_id) 
    if not hasattr(user_metrics, 'total_events_added'):
        user_metrics.total_events_added = 0 # Inicializa se não existir no modelo
    user_metrics.total_events_added += 1
    db.add(user_metrics)
    db.commit() 
    db.refresh(user_metrics) 

    logger.info(f"Evento adicionado ao calendário para o utilizador {user_id}. Total: {user_metrics.total_events_added}")
    evaluate_and_award_badges(db, user_id, context={"action": "add_event"}) 
    evaluate_and_promote_leagues(db, user_id) 

def update_simultaneous_tool_uses(db: Session, user_id: int, current_count: int):
    """Atualiza o máximo de ferramentas usadas em simultâneo e avalia as medalhas/ligas."""
    user_metrics = _get_or_create_user_metrics(db, user_id) 
    if current_count > user_metrics.simultaneous_tool_uses:
        user_metrics.simultaneous_tool_uses = current_count
        db.add(user_metrics)
        db.commit() 
        db.refresh(user_metrics) 

        logger.info(f"Ferramentas simultâneas atualizadas para o utilizador {user_id}. Max: {user_metrics.simultaneous_tool_uses}")
        evaluate_and_award_badges(db, user_id, context={"action": "simultaneous_tools"}) 
        evaluate_and_promote_leagues(db, user_id) 
