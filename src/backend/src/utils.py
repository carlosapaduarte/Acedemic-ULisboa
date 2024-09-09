from datetime import datetime


def get_datetime_utc(datetime: datetime) -> int:
    return int(datetime.timestamp())