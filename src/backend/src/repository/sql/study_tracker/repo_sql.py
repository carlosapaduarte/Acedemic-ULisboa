from sqlmodel import Session, select

from domain.study_tracker import Event, SubTask, Task, UnavailableScheduleBlock
from repository.sql.commons.repo_sql import CommonsSqlRepo
from repository.sql.models import database
from repository.sql.models.models import STAppUseModel, STScheduleBlockNotAvailableModel, STEventModel, STEventTagModel, STSubTaskModel, STTaskModel, STTaskTagModel, STWeekDayPlanningModel, UserModel
from datetime import datetime
from repository.sql.study_tracker.repo import StudyTrackerRepo

engine = database.get_engine()

class StudyTrackerSqlRepo(StudyTrackerRepo):    
    def update_user_study_tracker_use_goals(self, user_id: int, use_goals: set):
        with Session(engine) as session:
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(user_id, session)

            new_user_study_tracker_app_uses = []
            for use_goal in use_goals:
                new_user_study_tracker_app_uses.append(
                    STAppUseModel(
                        id=use_goal,
                        user_id=user_id,
                        user=user_model
                    )
                )

            user_model.user_st_app_uses = new_user_study_tracker_app_uses
            session.add(user_model)
            session.commit()
            session.refresh(user_model)

    def update_study_tracker_app_planning_day(self, user_id: int, day: int, hour: int):
        with Session(engine) as session:
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(user_id, session)

            user_model.st_planning_day = STWeekDayPlanningModel(
                week_planning_day=day,
                hour=hour,
                user_id=user_id,
                user=user_model
            )

            session.add(user_model)
            session.commit()
            session.refresh(user_model)

    def create_event(self, user_id: int, event: Event):
        with Session(engine) as session:
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(user_id, session)

            new_event_model = STEventModel(
                    title=event.title,
                    start_date=event.date.start_date,
                    end_date=event.date.end_date,
                    user_id=user_id,
                    user=user_model,
                    tags=[] # tags added next
                )

            user_model.st_events.append(
                new_event_model
            )

            session.add(user_model)
            session.commit()
            session.refresh(new_event_model)

            tags_model: list[STEventTagModel] = []
            for tag in event.tags:
                tags_model.append(STEventTagModel(
                    tag=tag,
                    event_id=new_event_model.id,
                    event=new_event_model
                ))

            for tag_model in tags_model:
                session.add(tag_model)
                session.commit()

    def is_today(date_1: datetime) -> bool:
        today = datetime.today()
        return date_1.year == today.year and date_1.month == today.month and date_1.day == today.day

    def get_events(self, user_id: int) -> list[Event]:
        with Session(engine) as session:
            statement = select(STEventModel).where(STEventModel.user_id == user_id)
            results = session.exec(statement)

            # Ideally, we would use another where statement. Yet, this was not working for me...
            today_events: list[STEventModel] = []
            for event in results:
                if (StudyTrackerSqlRepo.is_today(event.start_date)):
                    today_events.append(event)
            
            return Event.from_STEventModel(today_events)

    def get_events(self, user_id: int) -> list[Event]:
        with Session(engine) as session:
            statement = select(STEventModel).where(STEventModel.user_id == user_id)
            results = session.exec(statement)

            return Event.from_STEventModel(results)
        
    def update_receive_notifications_pref(self, user_id: int, receive: bool):
        with Session(engine) as session:
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(user_id, session)
            user_model.receive_st_app_notifications = receive            

            session.add(user_model)
            session.commit()

    def create_not_available_schedule_block(self, user_id: int, info: UnavailableScheduleBlock):
        with Session(engine) as session:
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(user_id, session)
            user_model.schedule_unavailable_blocks.append(STScheduleBlockNotAvailableModel(
                week_day=info.week_day,
                start_hour=info.start_hour,
                duration=info.duration
            ))

            session.add(user_model)
            session.commit()

    def get_not_available_schedule_blocks(self, user_id: int) -> list[UnavailableScheduleBlock]:
         with Session(engine) as session:
            statement = select(STScheduleBlockNotAvailableModel).where(STScheduleBlockNotAvailableModel.user_id == user_id)
            results = session.exec(statement)
        
            blocks: list[STScheduleBlockNotAvailableModel] = []
            for block_model in results:
                blocks.append(UnavailableScheduleBlock(
                    week_day=block_model.week_day,
                    start_hour=block_model.start_hour,
                    duration=block_model.duration
                ))
            return blocks
        
    def get_tasks(self, user_id: int, order_by_deadline_and_priority: bool) -> list[Task]:
        with Session(engine) as session:
            statement = select(STTaskModel).where(STTaskModel.user_id == user_id)
            result = session.exec(statement)
            
            task_models: list[STTaskModel] = result.all()
            
            # Retrieve Tasks
            tasks: list[Task] = []
            for task_model in task_models:
                
                # Retrieve Task Tags
                tags: list[str] = []
                for tag_model in task_model.tags:
                    tags.append(tag_model.tag)
                    
                # Retrieve Task Sub-Tasks
                sub_tasks: list[SubTask] = []
                for sub_task in task_model.st_sub_tasks:
                    sub_tasks.append(SubTask(
                        title=sub_task.title,
                        status=sub_task.status
                    ))

                tasks.append(Task(
                    title=task_model.title,
                    description=task_model.description,
                    deadline=task_model.deadline,
                    priority=task_model.priority,
                    tags=tags,
                    status=task_model.status,
                    sub_tasks=sub_tasks
                ))
                
            # TODO: do this using SQL Model!
            # Right now, he is just sorting based on the task.deadline plus the priority string size
            if order_by_deadline_and_priority:
                tasks.sort(key=lambda task: (task.deadline, task.priority))
                
            return tasks
         
    def create_task(self, user_id: int, task: Task) -> int:
        with Session(engine) as session:
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(user_id, session)

            # Create new Task
            new_task_model = STTaskModel(
                    title=task.title,
                    description=task.description,
                    deadline=task.deadline,
                    priority=task.priority,
                    status=task.status,
                    user_id=user_id,
                    user=user_model,
                    tags=[] # tags added next
                )

            user_model.st_tasks.append(
                new_task_model
            )

            session.add(user_model)
            session.commit()
            session.refresh(new_task_model)

            # Create associated tags
            tags_model: list[STTaskTagModel] = []
            for tag in task.tags:
                tags_model.append(STTaskTagModel(
                    tag=tag,
                    task_id=new_task_model.id,
                    task=new_task_model
                ))

            for tag_model in tags_model:
                session.add(tag_model)
                session.commit()
                
            # Create associated sub-tags
            for sub_task in task.sub_tasks:
                sub_task_model = STSubTaskModel(
                    title=sub_task.title,
                    status=sub_task.status,
                    task_id=new_task_model.id,
                    task=new_task_model
                )
                session.add(sub_task_model)
                session.commit()

            return new_task_model.id

    def update_task_status(self, user_id: int, task_id: int, new_status: str):
        with Session(engine) as session:
            statement = select(STTaskModel).where(STTaskModel.user_id == user_id).where(STTaskModel.id == task_id)
            result = session.exec(statement)
            
            task_model: STTaskModel = result.one()
            task_model.status = new_status

            session.add(task_model)
            session.commit()