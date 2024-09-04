from sqlmodel import Session, select

from domain.study_tracker import StudyTrackerTask, UnavailableScheduleBlock
from repository.sql.models import database
from repository.sql.models.models import StudyTrackerAppUseModel, StudyTrackerScheduleNotAvailableBlockModel, StudyTrackerTaskModel, StudyTrackerTaskTagModel, StudyTrackerWeekDayPlanningModel, UserModel
from datetime import datetime
from repository.sql.study_tracker.repo import StudyTrackerRepo

engine = database.get_engine()

class StudyTrackerSqlRepo(StudyTrackerRepo):
    
    def update_user_study_tracker_use_goals(self, user_id: int, use_goals: set):
        with Session(engine) as session:
            statement = select(UserModel).where(UserModel.id == user_id)
            result = session.exec(statement)
            
            user_model: UserModel = result.one()

            new_user_study_tracker_app_uses = []
            for use_goal in use_goals:
                new_user_study_tracker_app_uses.append(
                    StudyTrackerAppUseModel(
                        id=use_goal,
                        user_id=user_id,
                        user=user_model
                    )
                )

            user_model.user_study_tracker_app_uses = new_user_study_tracker_app_uses
            session.add(user_model)
            session.commit()
            session.refresh(user_model)

    def update_study_tracker_app_planning_day(self, user_id: int, day: int, hour: int):
        with Session(engine) as session:
            statement = select(UserModel).where(UserModel.id == user_id)
            result = session.exec(statement)
            
            user_model: UserModel = result.one()

            user_model.study_tracker_planning_day = StudyTrackerWeekDayPlanningModel(
                week_planning_day=day,
                hour=hour,
                user_id=user_id,
                user=user_model
            )

            session.add(user_model)
            session.commit()
            session.refresh(user_model)

    def create_new_study_tracker_task(self, user_id: int, title: str, start_date: datetime, end_date: datetime, tags: list[str]):
        with Session(engine) as session:
            statement = select(UserModel).where(UserModel.id == user_id)
            result = session.exec(statement)

            user_model: UserModel = result.one()

            new_task_model = StudyTrackerTaskModel(
                    title=title,
                    start_date=start_date,
                    end_date=end_date,
                    user_id=user_id,
                    user=user_model,
                    tags=[] # tags added next
                )

            user_model.study_tracker_tasks.append(
                new_task_model
            )

            session.add(user_model)
            session.commit()
            session.refresh(new_task_model)

            tags_model: list[StudyTrackerTaskTagModel] = []
            for tag in tags:
                tags_model.append(StudyTrackerTaskTagModel(
                    tag=tag,
                    task_id=new_task_model.id,
                    task=new_task_model
                ))

            for tag_model in tags_model:
                session.add(tag_model)
                session.commit()

    def is_today(date_1: datetime) -> bool:
        today = datetime.today()
        return date_1.year == today.year and date_1.month == today.month and date_1.day == today.day

    def get_study_tracker_today_tasks(self, user_id: int) -> list[StudyTrackerTask]:
        with Session(engine) as session:
            statement = select(StudyTrackerTaskModel).where(StudyTrackerTaskModel.user_id == user_id)
            results = session.exec(statement)

            # Ideally, we would use another where statement. Yet, this was not working for me...
            today_tasks: list[StudyTrackerTaskModel] = []
            for task in results:
                if (StudyTrackerSqlRepo.is_today(task.start_date)):
                    today_tasks.append(task)
            
            return StudyTrackerTask.from_StudyTrackerTaskModel(today_tasks)

    def get_study_tracker_tasks(self, user_id: int) -> list[StudyTrackerTask]:
        with Session(engine) as session:
            statement = select(StudyTrackerTaskModel).where(StudyTrackerTaskModel.user_id == user_id)
            results = session.exec(statement)

            return StudyTrackerTask.from_StudyTrackerTaskModel(results)
        
    def update_receive_notifications_pref(self, user_id: int, receive: bool):
        with Session(engine) as session:
            statement = select(UserModel).where(UserModel.id == user_id)
            result = session.exec(statement)
            
            user_model: UserModel = result.one()
            user_model.receive_study_tracker_app_notifications = receive            

            session.add(user_model)
            session.commit()

    def create_not_available_schedule_block(self, user_id: int, info: UnavailableScheduleBlock):
        with Session(engine) as session:
            statement = select(UserModel).where(UserModel.id == user_id)
            result = session.exec(statement)
            
            user_model: UserModel = result.one()
            user_model.schedule_unavailable_blocks.append(StudyTrackerScheduleNotAvailableBlockModel(
                week_day=info.week_day,
                start_hour=info.start_hour,
                duration=info.duration
            ))

            session.add(user_model)
            session.commit()

    def get_not_available_schedule_blocks(self, user_id: int) -> list[UnavailableScheduleBlock]:
         with Session(engine) as session:
            statement = select(StudyTrackerScheduleNotAvailableBlockModel).where(StudyTrackerScheduleNotAvailableBlockModel.user_id == user_id)
            results = session.exec(statement)
        
            blocks: list[StudyTrackerScheduleNotAvailableBlockModel] = []
            for block_model in results:
                blocks.append(UnavailableScheduleBlock(
                    week_day=block_model.week_day,
                    start_hour=block_model.start_hour,
                    duration=block_model.duration
                ))
            return blocks