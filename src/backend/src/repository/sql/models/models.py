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

    id: int = Field(primary_key=True)
    text: str
    date: datetime

    user_id: int = Field(foreign_key="user.id")    
    user: UserModel = Relationship(back_populates="user_notes")

class BatchModel(SQLModel, table=True):
    __tablename__ = "batch"

    id: int = Field(primary_key=True)
    start_date: datetime
    level: int

    user_id: int = Field(foreign_key="user.id")
    user: UserModel = Relationship(back_populates="user_batches")

    completed_goals: list["GoalModel"] = Relationship(back_populates="batch")

class GoalModel(SQLModel, table=True):
    __tablename__ = "goal"

    goal_day: int = Field(primary_key=True)
    id: int = Field(primary_key=True)
    conclusion_date: datetime

    user_id: int = Field(foreign_key="user.id", primary_key=True)  # Assuming this should be foreign_key="usermodel.id"
    
    batch_id: int = Field(foreign_key="batch.id", primary_key=True)
    batch: BatchModel = Relationship(back_populates="completed_goals")

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
    
    user_id: int = Field(foreign_key="user.id", primary_key=True)  # Assuming this should be foreign_key="usermodel.id"
    user: UserModel = Relationship(back_populates="user_st_app_uses")

class STWeekDayPlanningModel(SQLModel, table=True):
    __tablename__ = "st_week_day_planning"

    week_planning_day: int | None
    hour: int | None
    
    user_id: int = Field(foreign_key="user.id", primary_key=True)  # Assuming this should be foreign_key="usermodel.id"
    user: UserModel = Relationship(back_populates="st_planning_day")

class STEventModel(SQLModel, table=True):
    __tablename__ = "st_event"

    id: int = Field(primary_key=True, default=None)
    start_date: datetime
    end_date: datetime
    title: str
    
    tags: list["STEventTagModel"] = Relationship(back_populates="event")

    user_id: int = Field(foreign_key="user.id")
    user: UserModel = Relationship(back_populates="st_events")

class STEventTagModel(SQLModel, table=True):
    __tablename__ = "st_event_tag"

    tag: str = Field(primary_key=True)

    event_id: int = Field(foreign_key="st_event.id", primary_key=True)
    event: STEventModel = Relationship(back_populates="tags")

class STScheduleBlockNotAvailableModel(SQLModel, table=True):
    __tablename__ = "st_schedule_block_not_available"

    week_day: int = Field(primary_key=True)
    start_hour: int = Field(primary_key=True)
    duration: int = Field(primary_key=True)

    user_id: int = Field(foreign_key="user.id", primary_key=True)  # Assuming this should be foreign_key="usermodel.id"
    user: UserModel = Relationship(back_populates="schedule_unavailable_blocks")

class STTaskModel(SQLModel, table=True):
    __tablename__ = "st_task"

    id: int = Field(primary_key=True, default=None)
    title: str
    description: str
    deadline: datetime
    priority: str
    status: str
    
    tags: list["STTaskTagModel"] = Relationship(back_populates="task")
    
    st_sub_tasks: list["STSubTaskModel"] = Relationship(back_populates="task")

    user_id: int = Field(foreign_key="user.id")
    user: UserModel = Relationship(back_populates="st_tasks")

class STTaskTagModel(SQLModel, table=True):
    __tablename__ = "st_task_tag"

    tag: str = Field(primary_key=True)

    task_id: int = Field(foreign_key="st_task.id", primary_key=True)
    task: STTaskModel = Relationship(back_populates="tags")
    
class STSubTaskModel(SQLModel, table=True):
    __tablename__ = "st_sub_task"

    title: str = Field(primary_key=True)
    status: str

    task_id: int = Field(foreign_key="st_task.id", primary_key=True)
    task: STTaskModel = Relationship(back_populates="st_sub_tasks")