package pt.ulisboa.backend.http.exceptions

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class ExceptionHandler {

    data class ErrorResponseBody(val status: Int, val error: String, val message: String?)

    /**
     * Handles Bad Request Exceptions.
     *
     * @param e the exception
     * @return a Problem with the status Bad Request
     */
    @ExceptionHandler(
        value = [InvalidArgumentException::class]
    )
    fun handleBadRequestException(e: Exception): ResponseEntity<ErrorResponseBody> {
        return ResponseEntity.badRequest().body(ErrorResponseBody(400, "Bad Request", e.message))
    }

    /**
     * Handles Not Found Exceptions.
     *
     * @param e the exception
     * @return a Problem with the status Bad Request
     */
    @ExceptionHandler(
        value = [NotFoundException::class]
    )
    fun handleNotFoundException(e: Exception): ResponseEntity<ErrorResponseBody> {
        return ResponseEntity.badRequest().body(ErrorResponseBody(404, "Not Found", e.message))
    }
}