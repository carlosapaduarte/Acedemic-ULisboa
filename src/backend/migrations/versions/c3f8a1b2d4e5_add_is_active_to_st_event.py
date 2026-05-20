"""Add is_active to st_event for soft-delete of task-linked slots

Revision ID: c3f8a1b2d4e5
Revises: b709a72fc97a
Create Date: 2026-05-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c3f8a1b2d4e5"
down_revision: Union[str, None] = "b709a72fc97a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "st_event",
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
    )


def downgrade() -> None:
    op.drop_column("st_event", "is_active")
