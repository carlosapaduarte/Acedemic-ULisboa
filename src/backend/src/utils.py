from datetime import datetime, date


def get_datetime_utc(datetime: datetime) -> int:
    return int(datetime.timestamp())

def get_datetime_utc_from_date(date: date) -> int:
    tmp = datetime(date.year, date.month, date.day)
    return get_datetime_utc(tmp)