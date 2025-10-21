import os
import sys
from pathlib import Path
from logging.config import fileConfig
from sqlmodel import SQLModel
from src.repository.sql.models import models
from sqlalchemy import create_engine, pool
from alembic import context
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

dotenv_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=dotenv_path)

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

DATABASE_URL = os.getenv("SQLALCHEMY_DATABASE_URL")
if not DATABASE_URL:
    raise Exception(f"ERRO: Variável SQLALCHEMY_DATABASE_URL não encontrada em {dotenv_path}")

target_metadata = SQLModel.metadata


def run_migrations_offline():
    """Execução de migrações sem ligação à BD (gera SQL)."""
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Execução de migrações com ligação real à BD."""
    connectable = create_engine(DATABASE_URL, poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()