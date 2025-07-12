from sqlmodel import Session, select
from repository.sql.models.database import get_engine
from repository.sql.models.models import Badge

badges = [
    Badge(code="FIRST_LOGIN", title="Primeiro Login", description="Fez login pela primeira vez", icon_url="/icons/first.png"),
    Badge(code="FIVE_CHALLENGES", title="5 Desafios", description="Completou 5 desafios", icon_url="/icons/5challenges.png")
]

with Session(get_engine()) as session:
    for b in badges:
        if not session.exec(select(Badge).where(Badge.code == b.code)).first():
            session.add(b)
    session.commit()