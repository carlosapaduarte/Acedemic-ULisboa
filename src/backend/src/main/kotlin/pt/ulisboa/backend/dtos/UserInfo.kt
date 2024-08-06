package pt.ulisboa.backend.dtos

// TODO: level should be an Enum type
data class UserInfo(
    val id: Int,
    val username: String,
    val level: Int?,
    val startDate: Long,
    val shareProgress: Boolean,
    val userGoals: List<UserGoalDto>
)

// For now, only difference from UserGoal is date
data class UserGoalDto(
    val name: String,
    val date: Long
)