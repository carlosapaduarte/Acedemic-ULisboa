import datetime

from repository.sql.models.models import StudyTrackerTaskModel


class StudyTrackerTask():
    def __init__(
        self,
        start_date: datetime, 
        end_date: datetime, 
        title: str, 
        tag: bool,
        ) -> None:
            self.start_date = start_date
            self.end_date = end_date
            self.title = title
            self.tag = tag

    def from_StudyTrackerTaskModel(tasks: StudyTrackerTaskModel):
        today_tasks: list[StudyTrackerTask] = []
        for task_result in tasks:
            today_tasks.append(
                StudyTrackerTask(
                    start_date=task_result.start_date,
                    end_date=task_result.end_date,
                    title=task_result.title,
                    tag=task_result.tag
                )
            )
        return today_tasks

          