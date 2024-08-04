package pt.ulisboa.backend.dtos

// TODO: level should be an Enum type
data class UserInfo(val id: Int, val username: String, val level: Int?, val currentDay: Int?, val shareProgress: Boolean)