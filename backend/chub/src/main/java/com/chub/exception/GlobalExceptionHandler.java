package com.chub.exception;

import com.chub.common.CommonApiResponse;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    record ValidationError(String field, String message) {}

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<CommonApiResponse<Void>> handleMissingParams(MissingServletRequestParameterException ex) {
        String message = ex.getParameterName() + " parameter is missing";
        log.warn("Missing parameter: {}", ex.getParameterName());
        return ResponseEntity.badRequest().body(
                CommonApiResponse.error("MISSING_PARAMETER", message, HttpStatus.BAD_REQUEST));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<CommonApiResponse<Void>> handleBadRequest(IllegalArgumentException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(
                CommonApiResponse.error("BAD_REQUEST", ex.getMessage(), HttpStatus.BAD_REQUEST));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<CommonApiResponse<Void>> handleServerError(Exception ex) {
        log.error("Internal server error", ex);
        return ResponseEntity.internalServerError()
                .body(CommonApiResponse.error("INTERNAL_SERVER_ERROR", "Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<CommonApiResponse<Void>> handleRuntime(RuntimeException ex) {
        log.error("Runtime exception: {}", ex.getMessage(), ex);
        return ResponseEntity.internalServerError()
                .body(CommonApiResponse.error("RUNTIME_ERROR", ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
    }

    @ExceptionHandler(CustomRuntimeException.class)
    public ResponseEntity<CommonApiResponse<Void>> handleCustomRuntimeException(CustomRuntimeException e) {
        log.warn("{} - {}", e.getExceptionCode().name(), e.getMessage());
        return ResponseEntity.status(e.getStatus())
                .body(CommonApiResponse.error(e));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonApiResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
        List<ValidationError> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> new ValidationError(error.getField(), error.getDefaultMessage()))
                .collect(Collectors.toList());

        log.warn("Validation failed with {} errors", errors.size());

        return ResponseEntity.badRequest()
                .body(CommonApiResponse.error("VALIDATION_FAILED", "입력 검증 실패", errors, HttpStatus.BAD_REQUEST));
    }

}
