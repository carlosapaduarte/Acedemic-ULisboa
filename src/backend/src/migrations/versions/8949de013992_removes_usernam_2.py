import sqlmodel

"""Removes usernam 2

Revision ID: 8949de013992
Revises: 916c9475acf3
Create Date: 2024-10-02 17:19:08.369785

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8949de013992'
down_revision: Union[str, None] = '916c9475acf3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', 'username2')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column('username2', sa.VARCHAR(), autoincrement=False, nullable=True))
    # ### end Alembic commands ###
