from pydantic import BaseModel

from domain.study_tracker.task import StudyTrackerTask
from service.common import get_datetime_utc


class StudyTrackerTaskOutputDto(BaseModel):
    start_date: float
    end_date: float
    title: str
    tag: str

    def from_study_tracker_tasks(tasks: list[StudyTrackerTask]):
        output_dtos_tasks: list[StudyTrackerTaskOutputDto] = []
        for task in tasks:
            output_dtos_tasks.append(
                StudyTrackerTaskOutputDto(
                    start_date=get_datetime_utc(task.start_date),
                    end_date=get_datetime_utc(task.end_date),
                    title=task.title,
                    tag=task.tag
                )
            )

        return output_dtos_tasks