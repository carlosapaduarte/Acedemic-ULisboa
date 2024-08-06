package pt.ulisboa.backend.dtos

data class SetLevelInputDto(val id: Int, val level: Int)
data class SetShareProgressPreferenceDto(val id: Int, val shareProgress: Boolean)
data class NewUserGoalDto(val id: Int, val name: String)