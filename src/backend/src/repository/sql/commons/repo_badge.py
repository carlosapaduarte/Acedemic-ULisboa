from sqlmodel import Session, select
from repository.sql.models.database import get_engine
from repository.sql.models.models import Badge, UserBadge

class BadgeRepo:
    def __init__(self):
        self.engine = get_engine()

    def list_all(self) -> list[Badge]:
        with Session(self.engine) as session:
            return session.exec(select(Badge)).all()

    def list_user(self, user_id: int) -> list[Badge]:
        with Session(self.engine) as session:
            stmt = select(Badge).join(UserBadge).where(UserBadge.user_id == user_id)
            return session.exec(stmt).all()

    def assign(self, user_id: int, badge_code: str):
        with Session(self.engine) as session:
            badge = session.exec(select(Badge).where(Badge.code == badge_code)).first()
            if not badge:
                return
            exists = session.get(UserBadge, (user_id, badge.id))
            if not exists:
                user_badge = UserBadge(user_id=user_id, badge_id=badge.id)
                session.add(user_badge)
                session.commit()