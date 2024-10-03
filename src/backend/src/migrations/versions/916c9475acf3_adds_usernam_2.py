import sqlmodel

"""Adds usernam 2

Revision ID: 916c9475acf3
Revises: e4bda7837c4f
Create Date: 2024-10-02 17:18:38.632804

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '916c9475acf3'
down_revision: Union[str, None] = 'e4bda7837c4f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column('username2', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', 'username2')
    # ### end Alembic commands ###
