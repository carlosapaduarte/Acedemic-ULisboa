from pydantic import BaseModel

from domain.study_tracker import Event, Task
from service.common import get_datetime_utc

class UserSubTaskDto(BaseModel):
    title: str
    status: str

class UserTaskOutputDto(BaseModel):
    title: str
    description: str
    deadline: float
    priority: str
    tags: list[str]
    status: str
    subTasks: list[UserSubTaskDto]
    
    @staticmethod
    def from_Tasks(tasks: list[Task]) -> list['UserTaskOutputDto']:
        task_dtos: list['UserTaskOutputDto'] = []
        for task in tasks:
            task_dtos.append(UserTaskOutputDto.from_Task(task))
        return task_dtos
        
    @staticmethod
    def from_Task(task: Task) -> 'UserTaskOutputDto':
        sub_tasks_output_dto: list[UserSubTaskDto] = []
        for sub_task in task.sub_tasks:
            sub_tasks_output_dto.append(UserSubTaskDto(
                title=sub_task.title,
                status=sub_task.status
            ))
        
        return UserTaskOutputDto(
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

class StudyTrackerEventOutputDto(BaseModel):
    start_date: float
    end_date: float
    title: str
    tag: list[str]

    def from_events(events: list[Event]):
        output_dtos_events: list[StudyTrackerEventOutputDto] = []
        for event in events:
            output_dtos_events.append(
                StudyTrackerEventOutputDto(
                    start_date=get_datetime_utc(event.date.start_date),
                    end_date=get_datetime_utc(event.date.end_date),
                    title=event.title,
                    tag=event.tags
                )
            )

        return output_dtos_events