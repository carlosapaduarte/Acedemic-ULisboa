from sqlmodel import Session, select

from domain.study_tracker.task import StudyTrackerTask
from repository.sql.models import database
from repository.sql.models.models import StudyTrackerAppUseModel, StudyTrackerTaskModel, StudyTrackerWeekDayPlanningModel, UserModel
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

    def create_new_study_tracker_task(self, user_id: int, title: str, start_date: datetime, end_date: datetime, tag: str):
        with Session(engine) as session:
            statement = select(UserModel).where(UserModel.id == user_id)
            result = session.exec(statement)

            user_model: UserModel = result.one()

            user_model.study_tracker_tasks.append(
                StudyTrackerTaskModel(
                    title=title,
                    start_date=start_date,
                    end_date=end_date,
                    tag=tag,
                    user_id=user_id,
                    user=user_model
                )
            )

            session.add(user_model)
            session.commit()
            session.refresh(user_model)

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
            session.refresh(user_model)