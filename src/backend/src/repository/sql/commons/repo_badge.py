from sqlmodel import Session, select
from repository.sql.models.database import get_engine
from repository.sql.models.models import Badge, UserBadge
from datetime import datetime, timezone

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
            try:
                badge = session.exec(select(Badge).where(Badge.code == badge_code)).first()
                if not badge:
                    print(f"[BadgeRepo] ERRO: Medalha com código '{badge_code}' não encontrada.")
                    return
                
                existing_user_badge = session.exec(
                    select(UserBadge).where(
                        UserBadge.user_id == user_id,
                        UserBadge.badge_id == badge.id
                    )
                ).first()

                if existing_user_badge:
                    print(f"[BadgeRepo] INFO: Utilizador {user_id} já possui a medalha '{badge_code}'.")
                    return

                metadata = {}
                if badge_code == "primeiro_passo":
                    metadata = {
                        "awarded_context": "first_user_login",
                        "event_timestamp_utc": datetime.now(timezone.utc).isoformat()
                    }
                
                user_badge = UserBadge(user_id=user_id, badge_id=badge.id, metadata_json=metadata)
                session.add(user_badge)
                session.commit()
                session.refresh(user_badge)
                print(f"[BadgeRepo] SUCESSO: Medalha '{badge_code}' (ID: {badge.id}) atribuída ao utilizador {user_id} em {user_badge.awarded_at.isoformat()}.")
            except Exception as e:
                session.rollback()
                print(f"[BadgeRepo] ERRO FATAL ao atribuir medalha '{badge_code}' ao utilizador {user_id}: {e}")
                raise