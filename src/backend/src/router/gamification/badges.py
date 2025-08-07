from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session
import logging

from repository.sql.models.database import get_session as get_db_session
from router.commons.common import get_current_user_id
from router.commons.dtos.gamification_dtos import BadgeResponse
from router.commons.dtos.gamification_dtos import (
    BadgeResponse,
    LeagueResponse,
    UserLeagueResponse,
    UserMetricsResponse,
    UserBadgesStatusDto
)
from repository.sql.commons.repo_badge import BadgeRepo
from service.gamification import core as gamification_service

router = APIRouter(prefix="/gamification", tags=["Gamification"])

logger = logging.getLogger(__name__)

@router.get( "/badges",response_model=List[BadgeResponse],summary="Obter todas as definições de medalhas",description="Retorna todas as medalhas disponíveis, filtradas pelo scope da aplicação.")
def get_all_badges(
    app_scope: Optional[str] = Query(None, description="Filtrar medalhas por scope da aplicação (ex: 'academic_challenge', 'study_tracker', 'all'). Se omitido, retorna todas as comuns."),
    db: Session = Depends(get_db_session)
):
    scope = app_scope if app_scope else "common"
    badges = gamification_service.get_all_badges_for_app_scope(db, scope)
    return badges

@router.get("/badges/me",response_model=List[BadgeResponse],summary="Obter as medalhas conquistadas pelo utilizador atual",description="Retorna a lista de medalhas que o utilizador autenticado já conquistou.")
def get_my_earned_badges(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db_session)
):
    earned_badges =  gamification_service.get_user_earned_badges(db, user_id)
    return earned_badges

@router.get("/badges/status",response_model=List[UserBadgesStatusDto],summary="Obter todas as medalhas com o status de conquista do utilizador atual",description="Retorna todas as medalhas disponíveis, indicando quais o utilizador autenticado já conquistou.")
def get_all_badges_with_user_status(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db_session),
    app_scope: Optional[str] = Query(None, description="Filtrar medalhas por scope da aplicação. Se omitido, retorna todas as comuns.")
) -> List[UserBadgesStatusDto]:

    try:
        scope = app_scope if app_scope else "common"

        all_badges =  gamification_service.get_all_badges_for_app_scope(db, scope)

        earned_badges =  gamification_service.get_user_earned_badges(db, user_id)

        earned_badge_ids: Set[int] = {badge.id for badge in earned_badges}

        response_badges = []
        for badge in all_badges:
            response_badges.append(
                UserBadgesStatusDto(
                    id=badge.id,
                    code=badge.code,
                    title=badge.title,
                    description=badge.description,
                    icon_url=badge.icon_url,
                    app_scope=badge.app_scope,
                    is_active=badge.is_active,
                    has_earned=badge.id in earned_badge_ids
                )
            )
        return response_badges

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno no servidor ao obter medalhas: {e}")


@router.get(
    "/leagues",
    response_model=List[LeagueResponse],
    summary="Obter todas as definições de ligas",
    description="Retorna todas as ligas disponíveis."
)
def get_all_leagues(
    db: Session = Depends(get_db_session)
):
    leagues =  gamification_service.get_all_leagues(db)
    return leagues

@router.get(
    "/leagues/me",
    response_model=Optional[UserLeagueResponse],
    summary="Obter a liga atual do utilizador autenticado",
    description="Retorna a liga mais alta que o utilizador autenticado pertence."
)
def get_my_current_league(
    user_id: int = Depends(get_current_user_id), 
    db: Session = Depends(get_db_session)
):
    user_league_membership =  gamification_service.get_user_current_league_membership(db, user_id)
    if user_league_membership:
        return UserLeagueResponse.model_validate(user_league_membership)
    return None

@router.get(
    "/metrics/me",
    response_model=UserMetricsResponse,
    summary="Obter as métricas de gamificação do utilizador atual",
    description="Retorna as métricas de gamificação do utilizador autenticado, como sequência de login, desafios concluídos, etc."
)
def get_my_metrics(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db_session)
):
    user_metrics =  gamification_service._get_or_create_user_metrics(db, user_id)
    return UserMetricsResponse.model_validate(user_metrics)

@router.post(
    "/evaluate/badges",
    status_code=status.HTTP_200_OK,
    summary="Desencadear avaliação de medalhas para o utilizador atual (uso interno)",
    description="Este endpoint destina-se a ser chamado internamente ou por jobs para re-avaliar as medalhas de um utilizador. Não deve ser exposto a clientes externos diretamente."
)
def trigger_badge_evaluation(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db_session)
):
    gamification_service.evaluate_and_award_badges(db, user_id)
    return {"message": "Avaliação de medalhas concluída."}

@router.post(
    "/evaluate/leagues",
    status_code=status.HTTP_200_OK,
    summary="Desencadear avaliação de ligas para o utilizador atual (uso interno)",
    description="Este endpoint destina-se a ser chamado internamente ou por jobs para re-avaliar a promoção de ligas de um utilizador. Não deve ser exposto a clientes externos diretamente."
)
def trigger_league_evaluation(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db_session)
):
    return {"message": "Avaliação de ligas concluída."}