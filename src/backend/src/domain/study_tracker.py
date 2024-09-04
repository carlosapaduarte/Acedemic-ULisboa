import datetime

from repository.sql.models.models import StudyTrackerTaskModel

class UnavailableScheduleBlock():
    def __init__(self, week_day: int, start_hour: int, duration: int):
        self.week_day=week_day
        self.start_hour=start_hour
        self.duration=duration 

class StudyTrackerTask():
    def __init__(
        self,
        start_date: datetime, 
        end_date: datetime, 
        title: str, 
        tags: list[str],
        ) -> None:
            self.start_date = start_date
            self.end_date = end_date
            self.title = title
            self.tags = tags

    def from_StudyTrackerTaskModel(tasks: list[StudyTrackerTaskModel]):
        today_tasks: list[StudyTrackerTask] = []
        for task_result in tasks:

            # Obtain Tags first
            tags: list[str] = []
            for tag_model in task_result.tags:
                 tags.append(tag_model.tag)

            today_tasks.append(
                StudyTrackerTask(
                    start_date=task_result.start_date,
                    end_date=task_result.end_date,
                    title=task_result.title,
                    tags=tags
                )
            )
        return today_tasks

          