from datetime import datetime


class UserNote:
    def __init__(self, name: str, created: datetime) -> None:
        self.name = name
        self.created = created


class Challenge:
    def __init__(self, id: int, completion_date: datetime | None) -> None:
        self.id = id
        self.completion_date = completion_date


class BatchDay:
    def __init__(self, id: int, challenges: list[Challenge], notes: str) -> None:
        self.id = id
        self.challenges = challenges
        self.notes = notes


class Batch:
    def __init__(self, id: int, start_date: datetime, level: int, batch_days: list[BatchDay]) -> None:
        self.id = id
        self.start_date = start_date
        self.level = level
        self.batch_days = batch_days


class User:
    def __init__(
            self,
            id: int,
            username: str,
            hashed_password: str,
            avatar_filename: str | None,
            share_progress: bool | None,
            batches: list[Batch]
    ) -> None:
        self.id = id
        self.username = username
        self.hashed_password = hashed_password
        self.avatar_filename = avatar_filename
        self.share_progress = share_progress
        self.batches = batches
