package pt.ulisboa.backend.repository.domain

import java.util.*

data class UserGoal(
    val name: String,
    val startDay: Date
)

data class User(
    val id: Int,
    val username: String,
    val level: Int?,
    val startDate: Date,
    val shareProgress: Boolean,
    val userGoals: List<UserGoal> = emptyList()
)