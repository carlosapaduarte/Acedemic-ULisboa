import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlmodel import SQLModel, Session, select #
from repository.sql.models import models

load_dotenv()

engine = create_engine(os.environ["SQLALCHEMY_DATABASE_URL"], echo=False)

def create_db_and_tables_and_seed_global_tags():
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        predefined_tags_data = [
            {"name": "fun"},
            {"name": "work"},
            {"name": "personal"},
            {"name": "study"},
        ]
        for tag_data in predefined_tags_data:
            tag_name = tag_data["name"]
            existing_tag = session.exec(
                select(models.TagModel).where(models.TagModel.name == tag_name)
            ).first()

            if not existing_tag:
                new_tag = models.TagModel(name=tag_name)
                session.add(new_tag)
            else:
                print({tag_name}," já existe.")
        
        session.commit()

create_db_and_tables_and_seed_global_tags()

POSTGRES_MAX_INTEGER_VALUE = 2147483647

def get_engine():
    return engine

def get_session():
    with Session(engine) as session:
        yield session