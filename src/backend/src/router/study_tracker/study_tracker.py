from datetime import datetime
from fastapi import APIRouter, Response
from router.study_tracker.dtos.input_dtos import CreateNewStudyTrackerTaskInputDto, SetStudyTrackerAppUseGoalsInputDto, UpdateStudyTrackerReceiveNotificationsPrefInputDto, UpdateStudyTrackerWeekPlanningDayInputDto
from service import common as common_service
from service import study_tracker as study_tracker_service


router = APIRouter(
    prefix="/study-tracker",
)

@router.post("/users/{user_id}/tasks")
def create_new_task(user_id: int, input_dto: CreateNewStudyTrackerTaskInputDto) -> Response:
    study_tracker_service.create_new_study_tracker_task(
        user_id, 
        input_dto.title, 
        datetime.fromtimestamp(input_dto.start_date),
        datetime.fromtimestamp(input_dto.end_date),
        input_dto.tags
    )
    return Response()
    
@router.put("/users/{user_id}/use-goals")
def update_app_use_goals(user_id: int, input_dto: SetStudyTrackerAppUseGoalsInputDto):
    study_tracker_service.update_user_study_tracker_use_goals(user_id, input_dto.uses)

@router.put("/users/{user_id}/receive-notifications-pref")
def update_receive_notifications_pref(user_id: int, input_dto: UpdateStudyTrackerReceiveNotificationsPrefInputDto):
    study_tracker_service.update_receive_notifications_pref(user_id, input_dto.receive)

@router.put("/users/{user_id}/week-planning-day")
def update_week_planning_day(user_id: int, input_dto: UpdateStudyTrackerWeekPlanningDayInputDto):
    study_tracker_service.update_study_tracker_app_planning_day(user_id, input_dto.day, input_dto.hour)

@router.get("/users/{user_id}/tasks")
def get_study_tasks(user_id: int, today: bool):
    #print(datetime.fromtimestamp(service.get_user_info(user_id).batches[0].startDate))
    if today:
        return study_tracker_service.get_study_tracker_today_tasks(user_id)
    else:
        return study_tracker_service.get_study_tracker_tasks(user_id)