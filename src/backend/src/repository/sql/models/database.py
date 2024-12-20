import os

from sqlalchemy import create_engine
from sqlmodel import SQLModel
from repository.sql.models import models

# Create just once and use everywhere!
# Echo=True to print executed SQL statements
engine = create_engine(os.environ["SQLALCHEMY_DATABASE_URL"], echo=False)

SQLModel.metadata.create_all(engine)

POSTGRES_MAX_INTEGER_VALUE = 2147483647

def get_engine():
    return engine