from pydantic import BaseModel

from domain.study_tracker import Event, Task
from utils import get_datetime_utc

class UserTaskOutputDto(BaseModel):
    id: int
    title: str
    description: str
    deadline: int
    priority: str
    tags: list[str]
    status: str
    subTasks: list['UserTaskOutputDto']
    
    @staticmethod
    def from_Tasks(tasks: list[Task]) -> list['UserTaskOutputDto']:
        task_dtos: list['UserTaskOutputDto'] = []
        for task in tasks:
            task_dtos.append(UserTaskOutputDto.from_Task(task))
        return task_dtos
        
    @staticmethod
    def from_Task(task: Task) -> 'UserTaskOutputDto':
        task_id = task.id
        if task_id is None:
            raise

        sub_tasks_output_dto: list[UserTaskOutputDto] = []
        for sub_task in task.sub_tasks:
            sub_tasks_output_dto.append(UserTaskOutputDto.from_Task(sub_task))
            
        return UserTaskOutputDto(
            id=task_id,
            title=task.title,
            description=task.description,
            deadline=get_datetime_utc(task.deadline),
            priority=task.priority,
            tags=task.tags,
            status=task.status,
            subTasks=sub_tasks_output_dto
        )
        
class TaskCreatedOutputDto(BaseModel):
    task_id: int

class EventOutputDto(BaseModel):
    startDate: int
    endDate: int
    title: str
    tags: list[str]
    everyWeek: bool

    @staticmethod
    def from_events(events: list[Event]) -> list['EventOutputDto']:
        output_dtos_events: list[EventOutputDto] = []
        for event in events:
            output_dtos_events.append(
                EventOutputDto(
                    startDate=get_datetime_utc(event.date.start_date),
                    endDate=get_datetime_utc(event.date.end_date),
                    title=event.title,
                    tags=event.tags,
                    everyWeek=event.every_week
                )
            )

        return output_dtos_events