package pt.ulisboa.backend.service

import org.springframework.stereotype.Service
import pt.ulisboa.backend.dtos.UserNoteDto
import pt.ulisboa.backend.dtos.UserInfo
import pt.ulisboa.backend.repository.UsersRepository
import java.util.Date

@Service
class Service(val usersRepository: UsersRepository) {

    enum class LoginResult {
        SUCCESS,
        CREATED_USER
    }

    fun login(id: Int): LoginResult {
        if (usersRepository.existsUser(id)) {
            return LoginResult.SUCCESS
        }
        usersRepository.createUser(id = id, username = "User$id")
        return LoginResult.CREATED_USER
    }

    fun setLevel(id: Int, level: Int) {
        usersRepository.updateUserLevel(id, level)
    }

    fun getUserInfo(id: Int): UserInfo {
        val user = usersRepository.getUser(id)
        return UserInfo(
            id = id,
            username = user.username,
            level = user.level,
            startDate = user.startDate.time,
            shareProgress = user.shareProgress,
            userNotes = user.userNotes.map { userGoal -> UserNoteDto(name = userGoal.name, date = userGoal.date.time) }
        )
    }

    fun setShareProgressPreference(id: Int, shareProgress: Boolean) {
        usersRepository.updateShareProgressPreference(id, shareProgress)
    }

    fun createNewUserNote(userId: Int, name: String, date: Date) {
        usersRepository.addNewUserNote(userId, name, date)
    }
}