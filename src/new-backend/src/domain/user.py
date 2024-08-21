import datetime

class UserNote:
    def __init__(self, name: str, created: datetime) -> None:
        self.name = name
        self.created = created

class Goal:
    def __init__(self, name: str, concluded: datetime) -> None:
        self.name = name
        self.concluded = concluded

class User:
    def __init__(
            self,
            id: int, 
            username: str, 
            level: int, 
            avatar_filename: str, 
            start_date: datetime,
            share_progress: bool,
            user_notes: list[UserNote],
            completed_goals: list[Goal]
    ) -> None:
        self.id = id
        self.username = username
        self.level = level
        self.avatar_filename = avatar_filename
        self.start_date = start_date
        self.share_progress = share_progress
        self.user_notes = user_notes
        self.completed_goals = completed_goals