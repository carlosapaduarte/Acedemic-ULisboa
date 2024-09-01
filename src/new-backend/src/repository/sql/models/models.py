from sqlmodel import Field, Relationship, SQLModel
from datetime import datetime

class UserModel(SQLModel, table=True):
    id: int = Field(primary_key=True)
    username: str
    avatar_filename: str | None
    share_progress: bool | None
    receive_study_tracker_app_notifications: bool | None
    
    user_notes: list["NoteModel"] = Relationship(back_populates="user")
    user_batches: list["BatchModel"] = Relationship(back_populates="user")
    user_study_tracker_app_uses: list["StudyTrackerAppUseModel"] = Relationship(back_populates="user")
    study_tracker_planning_day: "StudyTrackerWeekDayPlanningModel" = Relationship(back_populates="user")
    study_tracker_tasks: list["StudyTrackerTaskModel"] = Relationship(back_populates="user")

class NoteModel(SQLModel, table=True):
    id: int = Field(primary_key=True)
    text: str
    date: datetime

    user_id: int = Field(foreign_key="usermodel.id")    
    user: UserModel = Relationship(back_populates="user_notes")

class BatchModel(SQLModel, table=True):
    id: int = Field(primary_key=True)
    start_date: datetime
    level: int

    user_id: int = Field(foreign_key="usermodel.id")
    user: UserModel = Relationship(back_populates="user_batches")

    completed_goals: list["GoalModel"] = Relationship(back_populates="batch")

class GoalModel(SQLModel, table=True):
    goal_day: int = Field(primary_key=True)
    id: int = Field(primary_key=True)
    conclusion_date: datetime

    user_id: int = Field(foreign_key="usermodel.id", primary_key=True)  # Assuming this should be foreign_key="usermodel.id"
    
    batch_id: int = Field(foreign_key="batchmodel.id", primary_key=True)
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
class StudyTrackerAppUseModel(SQLModel, table=True):
    id: int = Field(primary_key=True)
    
    user_id: int = Field(foreign_key="usermodel.id", primary_key=True)  # Assuming this should be foreign_key="usermodel.id"
    user: UserModel = Relationship(back_populates="user_study_tracker_app_uses")

class StudyTrackerWeekDayPlanningModel(SQLModel, table=True):
    week_planning_day: int | None
    hour: int | None
    
    user_id: int = Field(foreign_key="usermodel.id", primary_key=True)  # Assuming this should be foreign_key="usermodel.id"
    user: UserModel = Relationship(back_populates="study_tracker_planning_day")

class StudyTrackerTaskModel(SQLModel, table=True):
    id: int = Field(primary_key=True)
    start_date: datetime
    end_date: datetime
    title: str
    tag: str

    user_id: int = Field(foreign_key="usermodel.id")    
    user: UserModel = Relationship(back_populates="study_tracker_tasks")