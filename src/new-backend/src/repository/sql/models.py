from sqlmodel import Field, Relationship, SQLModel
from datetime import datetime

class UserModel(SQLModel, table=True):
    id: int = Field(primary_key=True)
    username: str
    avatar_filename: str | None
    share_progress: bool | None
    
    user_notes: list["NoteModel"] = Relationship(back_populates="user")
    user_batches: list["BatchModel"] = Relationship(back_populates="user")

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
    name: str = Field(primary_key=True)
    conclusion_date: datetime

    user_id: int = Field(foreign_key="usermodel.id", primary_key=True)  # Assuming this should be foreign_key="usermodel.id"
    
    batch_id: int = Field(foreign_key="batchmodel.id", primary_key=True)
    batch: BatchModel = Relationship(back_populates="completed_goals")