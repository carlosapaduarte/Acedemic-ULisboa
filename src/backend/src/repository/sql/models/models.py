from datetime import date
from datetime import datetime
from typing import Optional

from sqlalchemy import ForeignKeyConstraint
from sqlmodel import Field, Relationship, SQLModel


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

    # Composite foreign key constraint
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

    # Composite foreign key constraint
    __table_args__ = (
        ForeignKeyConstraint(
            ['batch_day_id', 'batch_id', 'user_id'],
            ['batch_day.id', 'batch_day.batch_id', 'batch_day.user_id']
        ),
    )


""" 
    Each user could be connected to multiple instances of this type.
    This type has an id, where each id should correspond to one of these possibilities:
    - Melhorar as minhas notas/classificações
    - Acompanhar o meu progresso
    - Preparar-me para exames específicos
    - Personalizar o meu plano de estudo
    - Cumprir prazos e entregas
    - Gerir os estudos com as outras áreas da minha vida
"""


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


class STEventModel(SQLModel, table=True):
    __tablename__ = "st_event"

    id: int = Field(default=None, primary_key=True)
    start_date: datetime
    end_date: datetime
    title: str
    every_week: bool

    tags: list["STEventTagModel"] = Relationship(back_populates="event")

    user_id: int = Field(foreign_key="user.id", primary_key=True)
    user: UserModel = Relationship(back_populates="st_events")


class STEventTagModel(SQLModel, table=True):
    __tablename__ = "st_event_tag"

    # Primary key: Tag
    tag: str = Field(primary_key=True)

    # Foreign key: Composite key referencing st_event
    event_id: int = Field(primary_key=True)
    user_id: int = Field(primary_key=True)

    # Composite foreign key constraint
    __table_args__ = (
        ForeignKeyConstraint(
            ['event_id', 'user_id'],
            ['st_event.id', 'st_event.user_id']
        ),
    )

    # Relationship with STTaskModel
    event: "STEventModel" = Relationship(back_populates="tags")


class STScheduleBlockNotAvailableModel(SQLModel, table=True):
    __tablename__ = "st_schedule_block_not_available"

    week_day: int = Field(primary_key=True)
    start_hour: int = Field(primary_key=True)
    duration: int = Field(primary_key=True)

    user_id: int = Field(foreign_key="user.id", primary_key=True)
    user: UserModel = Relationship(back_populates="schedule_unavailable_blocks")


class STTaskModel(SQLModel, table=True):
    __tablename__ = "st_task"

    # Composite primary key
    id: int = Field(primary_key=True, default=None)
    user_id: int = Field(foreign_key="user.id", primary_key=True)

    # Task details
    title: str
    description: str
    deadline: datetime | None
    priority: str
    status: str

    # Relationship with User
    user: "UserModel" = Relationship(back_populates="st_tasks")

    # Tags (assuming another table/model exists for tags)
    tags: list["STTaskTagModel"] = Relationship(back_populates="task")

    # Self-referencing foreign key to handle subtasks
    parent_task_id: Optional[int] = Field(
        default=None,
        nullable=True
    )
    parent_user_id: Optional[int] = Field(
        default=None,
        nullable=True
    )

    # Composite foreign key constraint for parent task
    __table_args__ = (
        ForeignKeyConstraint(
            ['parent_task_id', 'parent_user_id'],
            ['st_task.id', 'st_task.user_id']
        ),
    )

    # Parent task relationship (many-to-one)
    parent_task: Optional["STTaskModel"] = Relationship(
        back_populates="subtasks",
        sa_relationship_kwargs=dict(
            remote_side='STTaskModel.id'
        )
    )

    # Maybe, this model should have as well a sub-task-id that could be null.
    # This allows to use new IDs for the sub tasks, and not compete against the IDs of the tasks.

    subtasks: list["STTaskModel"] = Relationship(back_populates="parent_task")


class STTaskTagModel(SQLModel, table=True):
    __tablename__ = "st_task_tag"

    # Primary key: Tag
    tag: str = Field(primary_key=True)

    # Foreign key: Composite key referencing st_task
    task_id: int = Field(primary_key=True)
    user_id: int = Field(primary_key=True)

    # Composite foreign key constraint
    __table_args__ = (
        ForeignKeyConstraint(
            ['task_id', 'user_id'],
            ['st_task.id', 'st_task.user_id']
        ),
    )

    # Relationship with STTaskModel
    task: "STTaskModel" = Relationship(back_populates="tags")


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

    # Foreign key: Composite key referencing st_task
    archive_name: str = Field(primary_key=True)
    user_id: int = Field(primary_key=True)

    # Composite foreign key constraint
    __table_args__ = (
        ForeignKeyConstraint(
            ['archive_name', 'user_id'],
            ['st_archive.name', 'st_archive.user_id']
        ),
    )

    # Relationship with STTaskModel
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

    # Foreign key: Composite key referencing st_task
    curricular_unit_name: str = Field(primary_key=True)
    user_id: int = Field(primary_key=True)

    # Composite foreign key constraint
    __table_args__ = (
        ForeignKeyConstraint(
            ['curricular_unit_name', 'user_id'],
            ['st_curricular_unit.name', 'st_curricular_unit.user_id']
        ),
    )

    # Relationship with STTaskModel
    curricular_unit: "STCurricularUnitModel" = Relationship(back_populates="grades")


class DailyEnergyStatusModel(SQLModel, table=True):
    __tablename__ = "daily_energy_status"

    date_: date = Field(primary_key=True, default=None)
    time_of_day: str
    level: int

    user_id: int = Field(foreign_key="user.id", primary_key=True)
    user: UserModel = Relationship(back_populates="daily_energy_status")

class DailyTagModel(SQLModel, table=True):
    __tablename__ = "daily_tag"

    date_: date = Field(primary_key=True, default=None)
    tag: str = Field(primary_key=True, default=None)

    user_id: int = Field(foreign_key="user.id")
    user: UserModel = Relationship(back_populates="daily_tag")

class WeekStudyTimeModel(SQLModel, table=True):
    __tablename__ = "week_study_time"

    year: int = Field(primary_key=True, default=None)
    week: int = Field(primary_key=True, default=None)
    total: int
    average_by_session: float
    n_of_sessions: int

    user_id: int = Field(foreign_key="user.id", primary_key=True)
    user: UserModel = Relationship(back_populates="week_study_time")
