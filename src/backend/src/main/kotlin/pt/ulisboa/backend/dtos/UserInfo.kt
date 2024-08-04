package pt.ulisboa.backend.dtos

import pt.ulisboa.backend.repository.domain.UserGoal

// TODO: level should be an Enum type
data class UserInfo(
    val id: Int,
    val username: String,
    val level: Int?,
    val currentDay: Int?,
    val shareProgress: Boolean,
    val userGoals: List<UserGoal>
)