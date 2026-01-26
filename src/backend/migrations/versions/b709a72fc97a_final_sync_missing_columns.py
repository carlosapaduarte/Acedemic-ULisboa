def upgrade() -> None:
    # 1. Colunas na tabela tags
    op.add_column('tags', sa.Column('is_uc', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('tags', sa.Column('is_global', sa.Boolean(), nullable=True, server_default='false'))
    
    # 2. Colunas na tabela user (utilizamos "user" entre aspas por ser palavra reservada)
    op.add_column('user', sa.Column('custom_colors', sa.JSON(), nullable=True))
    op.add_column('user', sa.Column('study_session_time', sa.Integer(), nullable=True, server_default='0'))
    
    # 3. Colunas na tabela st_event
    op.add_column('st_event', sa.Column('recurrence_start', sa.DateTime(), nullable=True))
    op.add_column('st_event', sa.Column('recurrence_end', sa.DateTime(), nullable=True))
    
    # 4. Colunas na tabela st_task
    op.add_column('st_task', sa.Column('completed_at', sa.DateTime(), nullable=True))
    op.add_column('st_task', sa.Column('parent_task_id', sa.Integer(), nullable=True))
    op.add_column('st_task', sa.Column('parent_user_id', sa.Integer(), nullable=True))

    # 5. Constraints que o alembic gerou (comentadas para evitar erros se já existirem)
    # op.create_unique_constraint('_user_badge_uc', 'user_badges', ['user_id', 'badge_id'])
    # op.create_unique_constraint('_user_league_uc', 'user_leagues', ['user_id', 'league_id'])

def downgrade() -> None:
    op.drop_column('st_task', 'parent_user_id')
    op.drop_column('st_task', 'parent_task_id')
    op.drop_column('st_task', 'completed_at')
    op.drop_column('st_event', 'recurrence_end')
    op.drop_column('st_event', 'recurrence_start')
    op.drop_column('user', 'study_session_time')
    op.drop_column('user', 'custom_colors')
    op.drop_column('tags', 'is_global')
    op.drop_column('tags', 'is_uc')