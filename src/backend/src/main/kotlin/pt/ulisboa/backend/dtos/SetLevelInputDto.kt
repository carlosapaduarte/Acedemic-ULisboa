package pt.ulisboa.backend.dtos

data class SetLevelInputDto(val id: Int, val level: Int)
data class SetShareProgressPreferenceDto(val id: Int, val shareProgress: Boolean)
data class NewUserNoteDto(val id: Int, val name: String, val date: Long)
data class GoalCompletedDto(val id: Int, val goalName: String, val date: Long)