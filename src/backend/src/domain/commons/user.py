from datetime import datetime

class UserNote:
    def __init__(self, name: str, created: datetime) -> None:
        self.name = name
        self.created = created

class CompletedGoal:
    def __init__(self, goal_day: int, id: int, conclusion_date: datetime) -> None:
        self.goal_day = goal_day
        self.id = id
        self.conclusion_date = conclusion_date

class Batch:
    def __init__(self, id: int, start_date: datetime, level: int, completed: list[CompletedGoal]) -> None:
        self.id = id
        self.start_date = start_date
        self.level = level
        self.completed = completed

class User:
    def __init__(
            self,
            id: int, 
            username: str,
            hashed_password: str,
            avatar_filename: str | None, 
            share_progress: bool | None,
            user_notes: list[UserNote],
            batches: list[Batch]
    ) -> None:
        self.id = id
        self.username = username
        self.hashed_password = hashed_password
        self.avatar_filename = avatar_filename
        self.share_progress = share_progress
        self.user_notes = user_notes
        self.batches = batches