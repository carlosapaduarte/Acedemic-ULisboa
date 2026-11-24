"""Remove unused access logging and objective preferences.

Revision ID: d4a9f6b2c813
Revises: a2b84e7273d3, c3f8a1b2d4e5
Create Date: 2026-11-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d4a9f6b2c813"
down_revision: Union[str, Sequence[str], None] = (
    "a2b84e7273d3",
    "c3f8a1b2d4e5",
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_table("access_log")
    op.drop_table("st_app_use_model")


def downgrade() -> None:
    op.create_table(
        "st_app_use_model",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id", "user_id"),
    )
    op.create_table(
        "access_log",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("timestamp", sa.DateTime(), nullable=False),
        sa.Column("app_targeted", sa.String(), nullable=False),
        sa.Column("user_agent", sa.String(), nullable=False),
        sa.Column("action_type", sa.String(), nullable=False),
        sa.Column("action_detail", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_access_log_user_id"),
        "access_log",
        ["user_id"],
        unique=False,
    )