from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class LeagueResponse(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str] = None
    rank: int
    badge_icon_url: Optional[str] = None
    rewards_json: Optional[dict] = None

    class Config:
        from_attributes = True

class BadgeResponse(BaseModel):
    id: int
    code: str
    title: str
    description: str
    icon_url: Optional[str] = None
    app_scope: str
    is_active: bool
    league_id: Optional[int] = None
    league: Optional[LeagueResponse] = None 
    
    class Config:
        from_attributes = True

# Este DTO UserBadgesStatusDto agora herdará league_id e league de BadgeResponse
class UserBadgesStatusDto(BadgeResponse):
    has_earned: bool
    metadata_json: Optional[dict] = None #É necessário?
    
class UserLeagueResponse(BaseModel):
    user_id: int
    league_id: int
    joined_at: datetime
    league: LeagueResponse
    current_level_progress: Optional[int] = None

    class Config:
        from_attributes = True

class UserMetricsResponse(BaseModel):
    user_id: int
    login_streak: int
    last_login_at: Optional[datetime] = None
    completed_challenges: List[str]
    study_sessions_completed: int
    total_pomodoro_cycles: int
    total_tasks_completed: int
    total_notepad_entries: int
    total_forum_questions: int
    total_forum_answers: int
    simultaneous_tool_uses: int
    total_points: int

    class Config:
        from_attributes = True