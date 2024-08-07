package pt.ulisboa.backend.dtos

// TODO: level should be an Enum type
data class UserInfo(
    val id: Int,
    val username: String,
    val level: Int?,
    val startDate: Long,
    val shareProgress: Boolean,
    val userNotes: List<UserNoteDto>
)

// For now, only difference from UserNote is date
data class UserNoteDto(
    val name: String,
    val date: Long
)