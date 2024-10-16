from pydantic import BaseModel

from domain.study_tracker import Archive, CurricularUnit, DailyEnergyStatus, Event, File, Grade, Task, WeekTimeStudy
from utils import get_datetime_utc, get_datetime_utc_from_date

class DailyTasksProgress(BaseModel):
    progress: float

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
    
class FileOutputDto(BaseModel):
    name: str
    text: str
    
    @staticmethod
    def from_files(files: list[File]) -> list['FileOutputDto']:
        file_output_dtos: list['FileOutputDto'] = []
        
        for file in files:
            file_output_dtos.append(FileOutputDto(
                name=file.name,
                text=file.text
            ))
            
        return file_output_dtos
    
class ArchiveOutputDto(BaseModel):
    name: str
    files: list[FileOutputDto]
    
    @staticmethod
    def from_archives(archives: list[Archive]) -> list['ArchiveOutputDto']:
        archive_output_dtos: list['ArchiveOutputDto'] = []
        
        for archive in archives:
            archive_output_dtos.append(ArchiveOutputDto(
                name=archive.name,
                files=FileOutputDto.from_files(archive.files)
            ))
            
        return archive_output_dtos
    
class GradeOutputDto(BaseModel):
    value: float
    weight: float
    
    @staticmethod
    def from_grades(grades: list[Grade]) -> list['GradeOutputDto']:
        grade_output_dtos: list['GradeOutputDto'] = []
        
        for grade in grades:
            grade_output_dtos.append(GradeOutputDto(
                value=grade.value,
                weight=grade.weight
            ))
            
        return grade_output_dtos
    
class CurricularUnitOutputDto(BaseModel):
    name: str
    grades: list[GradeOutputDto]
    
    @staticmethod
    def from_curricular_units(curricular_units: list[CurricularUnit]) -> list['CurricularUnitOutputDto']:
        cu_output_dtos: list['CurricularUnitOutputDto'] = []
        
        for cu in curricular_units:
            cu_output_dtos.append(CurricularUnitOutputDto(
                name=cu.name,
                grades=GradeOutputDto.from_grades(cu.grades)
            ))
            
        return cu_output_dtos
    
class DailyEnergyStatusOutputDto(BaseModel):
    date: float
    level: int
    
    @staticmethod
    def from_domain(daily_energy_status_history: list[DailyEnergyStatus]) -> list["DailyEnergyStatusOutputDto"]:
        dtos: list[DailyEnergyStatusOutputDto] = []
        for status in daily_energy_status_history:
            dtos.append(
                DailyEnergyStatusOutputDto(
                    date=get_datetime_utc_from_date(status.date_),
                    level=status.level
                )
            )
        return dtos
    
class WeekTimeStudyOutputDto(BaseModel):
    year: int
    week: int
    total: int
    averageBySession: float
    
    @staticmethod
    def from_domain(domain: list[WeekTimeStudy]) -> list["WeekTimeStudyOutputDto"]:
        dtos: list[WeekTimeStudyOutputDto] = []
        for record in domain:
            dtos.append(
                WeekTimeStudyOutputDto(
                    year=record.week_and_year.year,
                    week=record.week_and_year.week,    
                    total=record.total,
                    averageBySession=record.average_by_session
                )
            )
        return dtos