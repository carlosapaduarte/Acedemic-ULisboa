package pt.ulisboa.backend.dtos

import pt.ulisboa.backend.repository.domain.Goal

// For now, only difference from UserNote is date
data class UserNoteDto(
    val name: String,
    val date: Long
)

// For now, only difference from Goal is date
data class GoalDto(
    val name: String,
    val date: Long
)

// TODO: level should be an Enum type
data class UserInfo(
    val id: Int,
    val username: String,
    val level: Int?,
    val startDate: Long,
    val shareProgress: Boolean,
    val userNotes: List<UserNoteDto>,
    val completedGoals: Set<GoalDto>
)