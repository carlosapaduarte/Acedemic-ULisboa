from datetime import datetime

class UserNote:
    def __init__(self, name: str, created: datetime) -> None:
        self.name = name
        self.created = created

class CompletedGoal:
    def __init__(self, goal_day: datetime, name: str, conclusion_date: datetime) -> None:    
        self.goal_day = goal_day
        self.name = name
        self.conclusion_date = conclusion_date

class Batch:
    def __init__(self, start_date: datetime, level: int, completed: list[CompletedGoal]) -> None:
        self.start_date = start_date
        self.level = level
        self.completed = completed

class User:
    def __init__(
            self,
            id: int, 
            username: str, 
            avatar_filename: str, 
            share_progress: bool,
            user_notes: list[UserNote],
            batches: list[Batch]
    ) -> None:
        self.id = id
        self.username = username
        self.avatar_filename = avatar_filename
        self.share_progress = share_progress
        self.user_notes = user_notes
        self.batches = batches