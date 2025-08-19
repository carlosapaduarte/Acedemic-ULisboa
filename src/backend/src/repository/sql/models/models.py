from datetime import date, timezone, datetime
from typing import Optional, List # Importar List
from uuid import UUID

from sqlalchemy import ForeignKeyConstraint, UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

from sqlalchemy import Column as SAColumn
from sqlalchemy.dialects.postgresql import JSON, ARRAY as pg_ARRAY 
from sqlalchemy import String

class UserModel(SQLModel, table=True):
    __tablename__ = "user"

    id: int = Field(primary_key=True)
    username: str
    hashed_password: str
    avatar_filename: str | None
    share_progress: bool | None
    receive_st_app_notifications: bool | None

    study_session_time: datetime | None

    user_batches: list["BatchModel"] = Relationship(back_populates="user")
    user_st_app_uses: list["STAppUseModel"] = Relationship(back_populates="user")
    st_planning_day: "STWeekDayPlanningModel" = Relationship(back_populates="user")
    st_events: list["STEventModel"] = Relationship(back_populates="user")
    schedule_unavailable_blocks: list["STScheduleBlockNotAvailableModel"] = Relationship(back_populates="user")
    st_tasks: list["STTaskModel"] = Relationship(back_populates="user")
    st_archives: list["STArchiveModel"] = Relationship(back_populates="user")
    st_curricular_units: list["STCurricularUnitModel"] = Relationship(back_populates="user")

    daily_energy_status: list["DailyEnergyStatusModel"] = Relationship(back_populates="user")
    daily_tag: list["DailyTagModel"] = Relationship(back_populates="user")

    week_study_time: list["WeekStudyTimeModel"] = Relationship(back_populates="user")

    user_tags: List["UserTagLink"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    
    earned_badges: List["UserBadge"] = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    metrics: Optional["UserMetric"] = Relationship(back_populates="user", sa_relationship_kwargs={"uselist": False})
    league_memberships: List["UserLeague"] = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class TagModel(SQLModel, table=True):
    __tablename__ = "tags"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)

    user_links: List["UserTagLink"] = Relationship(
        back_populates="tag",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    event_links: List["STEventTagModel"] = Relationship(back_populates="tag_ref")
    task_links: List["STTaskTagModel"] = Relationship(back_populates="tag_ref")
    daily_tag_links: List["DailyTagModel"] = Relationship(back_populates="tag")

class UserTagLink(SQLModel, table=True):
    __tablename__ = "user_tag_link"

    user_id: int = Field(foreign_key="user.id", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)
    is_custom: bool = Field(default=False, nullable=False)
    
    user: UserModel = Relationship(back_populates="user_tags")
    tag: TagModel = Relationship(back_populates="user_links")

class STEventTagModel(SQLModel, table=True):
    __tablename__ = "st_event_tag"

    tag_id: int = Field(foreign_key="tags.id", primary_key=True)
    event_id: int = Field(primary_key=True)
    user_id: int

    event: "STEventModel" = Relationship(back_populates="tags_associations")
    tag_ref: TagModel = Relationship(back_populates="event_links")

    __table_args__ = (
        ForeignKeyConstraint(
            ['event_id', 'user_id'],
            ['st_event.id', 'st_event.user_id'],
            name="fk_st_event_tag_event_composite"
        ),
        UniqueConstraint('event_id', 'tag_id', name='uq_st_event_tag'),
    )

class STTaskTagModel(SQLModel, table=True):
    __tablename__ = "st_task_tag"

    tag_id: int = Field(foreign_key="tags.id", primary_key=True)
    task_id: int = Field(primary_key=True)
    user_id: int

    task: "STTaskModel" = Relationship(back_populates="tags_associations")
    tag_ref: TagModel = Relationship(back_populates="task_links")

    __table_args__ = (
        ForeignKeyConstraint(
            ['task_id', 'user_id'],
            ['st_task.id', 'st_task.user_id'],
            name="fk_st_task_tag_task_composite"
        ),
        UniqueConstraint('task_id', 'tag_id', name='uq_st_task_tag'),
    )

class STEventModel(SQLModel, table=True):
    __tablename__ = "st_event"

    id: int = Field(default=None, primary_key=True)
    start_date: datetime
    end_date: datetime
    title: str
    every_week: bool
    every_day: bool = Field(default=False)
    notes: str = Field(default="", nullable=False)
    color: str = Field(nullable=False)
    
    tags_associations: List["STEventTagModel"] = Relationship(back_populates="event",sa_relationship_kwargs={"cascade": "all, delete-orphan"})

    user_id: int = Field(foreign_key="user.id", primary_key=True)
    user: UserModel = Relationship(back_populates="st_events")
    
    @property
    def tags(self) -> List[str]:
        """Retorna uma lista de nomes de tags associadas a este evento."""
        if not self.tags_associations:
            return []
        return [association.tag_ref.name for association in self.tags_associations if association.tag_ref]

class STTaskModel(SQLModel, table=True):
    __tablename__ = "st_task"

    id: int = Field(primary_key=True, default=None)
    user_id: int = Field(foreign_key="user.id", primary_key=True)

    title: str
    description: str
    deadline: datetime | None
    priority: str
    status: str
    

    user: "UserModel" = Relationship(back_populates="st_tasks")

    tags_associations: List["STTaskTagModel"] = Relationship(back_populates="task")

    parent_task_id: Optional[int] = Field(default=None, nullable=True)
    parent_user_id: Optional[int] = Field(default=None, nullable=True)

    __table_args__ = (
        ForeignKeyConstraint(
            ['parent_task_id', 'parent_user_id'],
            ['st_task.id', 'st_task.user_id']
        ),
    )

    parent_task: Optional["STTaskModel"] = Relationship(
        back_populates="subtasks",
        sa_relationship_kwargs=dict(
            remote_side='STTaskModel.id'
        )
    )

    subtasks: list["STTaskModel"] = Relationship(back_populates="parent_task")

class DailyTagModel(SQLModel, table=True):
    __tablename__ = "daily_tag"

    date_: date = Field(primary_key=True, default=None)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)

    user_id: int = Field(foreign_key="user.id")
    user: UserModel = Relationship(back_populates="daily_tag")
    tag: TagModel = Relationship(back_populates="daily_tag_links")

class BatchModel(SQLModel, table=True):
    __tablename__ = "batch"
    id: int = Field(primary_key=True, default=None)
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    start_date: datetime
    level: int
    user: UserModel = Relationship(back_populates="user_batches")
    batch_days: list["BatchDayModel"] = Relationship(back_populates="batch")

class BatchDayModel(SQLModel, table=True):
    __tablename__ = "batch_day"
    id: int = Field(primary_key=True)
    batch_id: int = Field(primary_key=True)
    user_id: int = Field(primary_key=True)
    notes: str
    batch: BatchModel = Relationship(back_populates="batch_days")
    challenges: list["ChallengeModel"] = Relationship(back_populates="batch_day")
    __table_args__ = (
        ForeignKeyConstraint(
            ['batch_id', 'user_id'],
            ['batch.id', 'batch.user_id']
        ),
    )

class ChallengeModel(SQLModel, table=True):
    __tablename__ = "challenge"
    id: int = Field(primary_key=True)
    batch_day_id: int = Field(primary_key=True)
    batch_id: int = Field(primary_key=True)
    user_id: int = Field(primary_key=True)
    completion_date: datetime | None
    batch_day: BatchDayModel = Relationship(back_populates="challenges")
    __table_args__ = (
        ForeignKeyConstraint(
            ['batch_day_id', 'batch_id', 'user_id'],
            ['batch_day.id', 'batch_day.batch_id', 'batch_day.user_id']
        ),
    )

class STAppUseModel(SQLModel, table=True):
    __tablename__ = "st_app_use_model"
    id: int = Field(primary_key=True)
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    user: UserModel = Relationship(back_populates="user_st_app_uses")

class STWeekDayPlanningModel(SQLModel, table=True):
    __tablename__ = "st_week_day_planning"
    week_planning_day: int | None
    hour: int | None
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    user: UserModel = Relationship(back_populates="st_planning_day")

class STScheduleBlockNotAvailableModel(SQLModel, table=True):
    __tablename__ = "st_schedule_block_not_available"
    week_day: int = Field(primary_key=True)
    start_hour: int = Field(primary_key=True)
    duration: int = Field(primary_key=True)
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    user: UserModel = Relationship(back_populates="schedule_unavailable_blocks")

class STArchiveModel(SQLModel, table=True):
    __tablename__ = "st_archive"
    name: str = Field(primary_key=True, default=None)
    files: list["STFileModel"] = Relationship(back_populates="archive")
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    user: UserModel = Relationship(back_populates="st_archives")

class STFileModel(SQLModel, table=True):
    __tablename__ = "st_file"
    name: str = Field(primary_key=True)
    text: str
    archive_name: str = Field(primary_key=True)
    user_id: int = Field(primary_key=True)
    __table_args__ = (
        ForeignKeyConstraint(
            ['archive_name', 'user_id'],
            ['st_archive.name', 'st_archive.user_id']
        ),
    )
    archive: "STArchiveModel" = Relationship(back_populates="files")

class STCurricularUnitModel(SQLModel, table=True):
    __tablename__ = "st_curricular_unit"
    name: str = Field(primary_key=True, default=None)
    grades: list["STGradeModel"] = Relationship(back_populates="curricular_unit")
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    user: UserModel = Relationship(back_populates="st_curricular_units")

class STGradeModel(SQLModel, table=True):
    __tablename__ = "st_grade"
    id: int = Field(primary_key=True)
    value: float
    weight: float
    curricular_unit_name: str = Field(primary_key=True)
    user_id: int = Field(primary_key=True)
    __table_args__ = (
        ForeignKeyConstraint(
            ['curricular_unit_name', 'user_id'],
            ['st_curricular_unit.name', 'st_curricular_unit.user_id']
        ),
    )
    curricular_unit: "STCurricularUnitModel" = Relationship(back_populates="grades")

class DailyEnergyStatusModel(SQLModel, table=True):
    __tablename__ = "daily_energy_status"
    date_: date = Field(primary_key=True, default=None)
    time_of_day: str
    level: int
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    user: UserModel = Relationship(back_populates="daily_energy_status")

class WeekStudyTimeModel(SQLModel, table=True):
    __tablename__ = "week_study_time"
    year: int = Field(primary_key=True, default=None)
    week: int = Field(primary_key=True, default=None)
    total: int
    average_by_session: float
    n_of_sessions: int
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    user: UserModel = Relationship(back_populates="week_study_time")

class UserBadge(SQLModel, table=True):
    __tablename__ = "user_badges"
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    badge_id: int = Field(foreign_key="badges.id", primary_key=True)
    awarded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Para metadata_json
    metadata_json: Optional[dict] = Field(
        default=None,
        sa_column=SAColumn(JSON, nullable=True)
    )

    user: UserModel = Relationship(back_populates="earned_badges")
    badge: "Badge" = Relationship(back_populates="user_badges")
    
    __table_args__ = (
        UniqueConstraint('user_id', 'badge_id', name='_user_badge_uc'),
    )

class League(SQLModel, table=True):
    __tablename__ = "leagues"

    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(index=True, unique=True, nullable=False)
    name: str = Field(nullable=False) # Ex: "Liga Bronze", "Liga Prata"
    description: Optional[str] = Field(default=None)
    rank: int = Field(unique=True, nullable=False) # 1 para Bronze, 2 para Prata, etc.
    badge_icon_url: Optional[str] = Field(default=None)
    
    #Critérios para ENTRAR nesta liga
    promotion_criteria_json: Optional[dict] = Field(
        default=None,
        sa_column=SAColumn(JSON, nullable=True)
    )

    #Recompensas associadas a esta liga: badges visíveis, personalização de avatar, etc.
    rewards_json: Optional[dict] = Field(
        default=None,
        sa_column=SAColumn(JSON, nullable=True) # Ex: {"badge_visibility": "silver", "avatar_customization": ["hair", "accessories"], "exclusive_themes": ["blue_theme"]}
    )

    badges: List["Badge"] = Relationship(back_populates="league")

    user_league_memberships: List["UserLeague"] = Relationship(back_populates="league")

class Badge(SQLModel, table=True):
    __tablename__ = "badges"
    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(index=True, unique=True, nullable=False)
    title: str = Field(nullable=False)
    description: str = Field(nullable=False)
    icon_url: Optional[str] = Field(default=None)
    app_scope: str = Field(default="common", nullable=False) # 'common', 'academic_challenge', 'study_tracker', 'all'
    is_active: bool = Field(default=True, nullable=False) # Para ativar/desativar medalhas
    criteria_json: Optional[dict] = Field(default=None, sa_column=SAColumn(JSON, nullable=True))

    user_badges: List["UserBadge"] = Relationship(back_populates="badge")
    league_id: Optional[int] = Field(default=None, foreign_key="leagues.id")
    league: Optional[League] = Relationship(back_populates="badges")

class UserMetric(SQLModel, table=True):
    __tablename__ = "user_metrics"
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    
    login_streak: int = Field(default=0, nullable=False)
    last_login_at: Optional[datetime] = Field(default=None) 
    
    completed_challenges: List[str] = Field(
        default_factory=list, # Default é uma lista vazia
        sa_column=SAColumn(pg_ARRAY(String), nullable=False)
    )
    
    completed_challenges_count: int = Field(default=0, nullable=False)
    
    challenge_completion_streak: int = Field(default=0, nullable=False)
    last_challenge_completion_date: Optional[date] = Field(default=None)
    
    study_sessions_completed: int = Field(default=0, nullable=False)
    total_points: int = Field(default=0, nullable=False)

    user: UserModel = Relationship(back_populates="metrics")
    
class UserLeague(SQLModel, table=True):
    __tablename__ = "user_leagues"

    user_id: int = Field(foreign_key="user.id", primary_key=True)
    league_id: int = Field(foreign_key="leagues.id", primary_key=True)
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    current_level_progress: Optional[int] = Field(default=0) #Para ligas com níveis
    
    user: UserModel = Relationship(back_populates="league_memberships")
    league: League = Relationship(back_populates="user_league_memberships")

    __table_args__ = (
        UniqueConstraint('user_id', 'league_id', name='_user_league_uc'),
    )
