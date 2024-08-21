class UserNoteDto:
    def __init__(self, name: str, created: int) -> None:
        self.name = name
        self.date = created

class GoalDto:
    def __init__(self, name: str, concluded: int) -> None:
        self.name = name
        self.date = concluded

class UserInfo:
    def __init__(
        self,
        id: int,
        username: str,
        level: int,
        avatar_filename: str,
        start_date: int,
        share_progress: bool,
        user_notes: list[UserNoteDto],
        completed_goals: list[GoalDto]
    ) -> None:
        self.id = id
        self.username = username
        self.level = level
        self.avatarFilename = avatar_filename
        self.startDate = start_date
        self.shareProgress = share_progress
        self.userNotes = user_notes
        self.completedGoals = completed_goals