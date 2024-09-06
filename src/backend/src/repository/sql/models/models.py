from typing import Optional
from sqlalchemy import ForeignKeyConstraint
from sqlmodel import Field, Relationship, SQLModel
from datetime import datetime

class UserModel(SQLModel, table=True):
    __tablename__ = "user"
        
    id: int = Field(primary_key=True)
    username: str
    avatar_filename: str | None
    share_progress: bool | None
    receive_st_app_notifications: bool | None
    
    user_notes: list["NoteModel"] = Relationship(back_populates="user")
    user_batches: list["BatchModel"] = Relationship(back_populates="user")
    user_st_app_uses: list["STAppUseModel"] = Relationship(back_populates="user")
    st_planning_day: "STWeekDayPlanningModel" = Relationship(back_populates="user")
    st_events: list["STEventModel"] = Relationship(back_populates="user")
    schedule_unavailable_blocks: list["STScheduleBlockNotAvailableModel"] = Relationship(back_populates="user")
    st_tasks: list["STTaskModel"] = Relationship(back_populates="user")

class NoteModel(SQLModel, table=True):
    __tablename__ = "note"

    id: int = Field(primary_key=True, default=None)
    text: str
    date: datetime

    user_id: int = Field(foreign_key="user.id")    
    user: UserModel = Relationship(back_populates="user_notes")

class BatchModel(SQLModel, table=True):
    __tablename__ = "batch"

    id: int = Field(primary_key=True, default=None)
    start_date: datetime
    level: int

    user_id: int = Field(foreign_key="user.id", primary_key=True)
    user: UserModel = Relationship(back_populates="user_batches")

    completed_goals: list["CompletedGoalModel"] = Relationship(back_populates="batch")

class CompletedGoalModel(SQLModel, table=True):
    __tablename__ = "completed_goal"

    id: int = Field(primary_key=True)
    goal_day: int = Field(primary_key=True)
    conclusion_date: datetime

    user_id: int = Field(primary_key=True)  # Assuming this should be foreign_key="usermodel.id"
    
    batch_id: int = Field(primary_key=True)
    batch: BatchModel = Relationship(back_populates="completed_goals")
    
    # Composite foreign key constraint
    __table_args__ = (
        ForeignKeyConstraint(
            ['batch_id', 'user_id'],
            ['batch.id', 'batch.user_id']
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

    id: int = Field(primary_key=True, default=None)
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

    # Foreign key: Composite key referencing st_task
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
    deadline: datetime
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
