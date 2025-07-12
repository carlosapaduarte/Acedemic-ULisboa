# router/badges/badges.py

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel import Session, select
from datetime import datetime, timezone

from repository.sql.models import database
from repository.sql.models.models import Badge, UserBadge
from router.commons.common import get_current_user_id

engine = database.get_engine()

router = APIRouter(prefix="/badges", tags=["Badges"])

@router.get("/", response_model=list[Badge])
def get_all_badges():
    return Badge.list_all()

@router.get("/users/me", response_model=list[Badge])
def get_my_badges(user_id: Annotated[int, Depends(get_current_user_id)]):
    return Badge.list_user(user_id)

@router.post("/users/me/{badge_code}")
def give_badge_to_me(user_id: Annotated[int, Depends(get_current_user_id)], badge_code: str):
    Badge.assign(user_id, badge_code)
    return {"status": "assigned"}