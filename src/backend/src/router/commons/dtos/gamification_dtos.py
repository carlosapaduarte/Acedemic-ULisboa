from pydantic import BaseModel, model_validator, ConfigDict
from typing import Any, Dict, Optional, List, Set
from datetime import datetime
from pydantic_core.core_schema import ValidationInfo

class LeagueResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    description: Optional[str] = None
    rank: int
    badge_icon_url: Optional[str] = None
    rewards_json: Optional[dict] = None

class BadgeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    title: str
    description: str
    icon_url: Optional[str] = None
    app_scope: str
    is_active: bool
    league_id: Optional[int] = None
    league: Optional[LeagueResponse] = None
    

class UserBadgesStatusDto(BadgeResponse):
    has_earned: bool

    @model_validator(mode='before')
    @classmethod
    def calculate_has_earned(cls, data: Any, info: ValidationInfo) -> Any:
        badge_object = data
        badge_data = {}

        if not isinstance(data, dict):
            badge_data = {
                'id': badge_object.id,
                'code': badge_object.code,
                'title': badge_object.title,
                'description': badge_object.description,
                'icon_url': badge_object.icon_url,
                'app_scope': badge_object.app_scope,
                'is_active': badge_object.is_active,
                'league_id': badge_object.league_id,
                'league': badge_object.league 
            }
        else:
            badge_data = data
        earned_badge_ids = set()
        if info.context:
            earned_badge_ids = info.context.get('earned_badge_ids', set())
        
        badge_data['has_earned'] = badge_data['id'] in earned_badge_ids
        return badge_data

class UserLeagueResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    league_id: int
    joined_at: datetime
    league: LeagueResponse
    current_level_progress: Optional[int] = None

class UserMetricsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    login_streak: int
    last_login_at: Optional[datetime] = None
    completed_challenges: List[str]
    completed_challenges_count: int
    challenge_completion_streak: int
    current_challenge_level: Optional[int] = None
    challenges_completed_in_current_level: int
    study_sessions_completed: int
    total_points: int

class GamificationProfileResponse(BaseModel):
    badges_status: List[UserBadgesStatusDto]
    current_challenge_level: Optional[int] = None
    completed_level_ranks: List[int] = []
    
class AwardedBadgeHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    awarded_at: datetime
    badge: BadgeResponse
    
class ChallengeCompletionResponse(BaseModel):
    newly_awarded_badges: List[BadgeResponse]
    completed_level_rank: Optional[int] = None
