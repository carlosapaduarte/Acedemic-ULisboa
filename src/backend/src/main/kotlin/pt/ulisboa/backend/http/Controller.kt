package pt.ulisboa.backend.http

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import pt.ulisboa.backend.dtos.*
import pt.ulisboa.backend.service.Service
import java.util.Date


@RestController
class Controller(val service: Service) {

    @PostMapping("/login")
    fun login(
        @RequestBody inputDto: LoginInputDto
    ): ResponseEntity<String> {
        when (service.login(inputDto.id)) {
            Service.LoginResult.SUCCESS -> return ResponseEntity.ok().build()
            Service.LoginResult.CREATED_USER -> {
                val location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{id}")
                    .buildAndExpand(inputDto.id)
                    .toUri()
                return ResponseEntity.created(location).build()
            }
        }
    }

    @PostMapping("/set-level")
    fun setLevel(
        @RequestBody inputDto: SetLevelInputDto
    ) {
        service.setLevel(inputDto.id, inputDto.level)
    }

    @PostMapping("/set-publish-state-preference")
    fun setShareProgressPreference(
        @RequestBody inputDto: SetShareProgressPreferenceDto
    ) {
        service.setShareProgressPreference(inputDto.id, inputDto.shareProgress)
    }

    @GetMapping("/users/{id}")
    fun getUserInfo(
        @PathVariable("id") userId: Int
    ): UserInfo = service.getUserInfo(userId)

    @GetMapping("/ping")
    fun ping() = "pong"
    
    @PostMapping("users/{id}/notes")
    fun createNewUserGoal(
        @RequestBody inputDto: NewUserGoalDto
    ) {
        println(Date(inputDto.date).time)
        service.createNewUserNote(inputDto.id, inputDto.name, Date(inputDto.date))
    }
}