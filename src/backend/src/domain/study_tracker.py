from datetime import datetime

from repository.sql.models.models import STEventModel
from router.study_tracker.dtos.input_dtos import CreateTaskInputDto

class SubTask():
    def __init__(
        self, 
        title: str,
        status: str="Tarefa não iniciada" # Default value
    ) -> None:
        self.title=title
        self.status=status
        
class Task():
    def __init__(
            self, 
            title: str, 
            description: str, 
            deadline: datetime, 
            priority: str, 
            tags: list[str], 
            sub_tasks: list[SubTask],
            status: str="Tarefa não iniciada", # Default value
    ) -> None:
        self.title=title
        self.description=description
        self.deadline=deadline
        self.priority=priority
        self.tags=tags
        self.sub_tasks=sub_tasks
        self.status=status
        
    @staticmethod
    def fromCreateTaskInputDto(task_dto: CreateTaskInputDto) -> 'Task':
        sub_tasks: list[SubTask] = []
        for sub_task in task_dto.subTasks:
            sub_tasks.append(SubTask(
                title=sub_task.title,
                status=sub_task.status
            ))
        return Task(
            title=task_dto.title,
            description=task_dto.description,
            deadline=datetime.fromtimestamp(task_dto.deadline),
            priority=task_dto.priority,
            tags=task_dto.tags,
            status=task_dto.status,
            sub_tasks=sub_tasks
        )
        

class UnavailableScheduleBlock():
    def __init__(self, week_day: int, start_hour: int, duration: int):
        self.week_day=week_day
        self.start_hour=start_hour
        self.duration=duration 

class EventDate():
    def __init__(self, start_date: datetime, end_date: datetime): 
         self.start_date=start_date
         self.end_date=end_date

    def collides_with_unavailable_block(self, block: UnavailableScheduleBlock):
        block_start_hour = block.start_hour
        block_end_hour = block.start_hour + block.duration
        event_start_hour = self.start_date.time().hour
        event_end_hour = self.end_date.time().hour

        if event_start_hour < block_start_hour:
            if event_end_hour <= block_start_hour:
                return False
            return True
        if  event_start_hour == block_start_hour:
            return True
        if event_start_hour > block_start_hour and event_start_hour < block_end_hour:
            return True
        
        return False

class Event():
    def __init__(self, title: str, date: EventDate, tags: list[str]):
        self.title=title
        self.date=date
        self.tags=tags

    def from_STEventModel(events: list[STEventModel]):
        today_events: list[Event] = []
        for event_result in events:

            # Obtain Tags first
            tags: list[str] = []
            for tag_model in event_result.tags:
                tags.append(tag_model.tag)

            today_events.append(
                Event(
                    title=event_result.title,
                    date=EventDate(
                        start_date=event_result.start_date,
                        end_date=event_result.end_date
                    ),
                    tags=tags
                )
            )
        return today_events