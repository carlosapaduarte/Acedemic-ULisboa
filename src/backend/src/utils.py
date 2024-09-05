from datetime import datetime, timezone


def get_datetime_utc(datetime: datetime) -> int:
    return int(datetime.replace(tzinfo=timezone.utc).timestamp())