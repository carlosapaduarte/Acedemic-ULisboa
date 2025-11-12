import sqlmodel

"""Change st_file.text from string to JSONB

Revision ID: db50935257fe
Revises: 4e9937303b19
Create Date: 2025-11-12 04:40:49.561265

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'db50935257fe'
down_revision: Union[str, None] = '4e9937303b19'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
