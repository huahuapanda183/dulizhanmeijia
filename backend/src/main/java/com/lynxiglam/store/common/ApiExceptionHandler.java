package com.lynxiglam.store.common;

import com.lynxiglam.store.common.dto.Dtos.ApiError;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(NotFoundException.class)
    ResponseEntity<ApiError> notFound(NotFoundException exception) {
        return response(HttpStatus.NOT_FOUND, "not_found", exception.getMessage(), Map.of());
    }

    @ExceptionHandler(ConflictException.class)
    ResponseEntity<ApiError> conflict(ConflictException exception) {
        return response(HttpStatus.CONFLICT, "conflict", exception.getMessage(), Map.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validation(MethodArgumentNotValidException exception) {
        Map<String, String> fields = new LinkedHashMap<>();
        for (FieldError error : exception.getBindingResult().getFieldErrors()) {
            fields.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        return response(HttpStatus.BAD_REQUEST, "validation_failed", "Request validation failed.", fields);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<ApiError> badRequest(IllegalArgumentException exception) {
        return response(HttpStatus.BAD_REQUEST, "bad_request", exception.getMessage(), Map.of());
    }

    /**
     * Out-of-range numeric input is the caller's fault, not a server fault.
     * Money.toCents/percentage/tax use intValueExact(), so an absurd query value
     * (e.g. ?subtotal=99999999999) or an overflowing order total would otherwise
     * fall through to the catch-all below and be reported as a 500.
     * The message is deliberately generic — never echo the offending value back.
     */
    @ExceptionHandler(ArithmeticException.class)
    ResponseEntity<ApiError> outOfRange(ArithmeticException exception) {
        return response(HttpStatus.BAD_REQUEST, "bad_request", "A numeric value is out of range.", Map.of());
    }

    /**
     * Controllers (e.g. wishlist without a session) raise ResponseStatusException.
     * Map it onto the same ApiError envelope so clients always receive our JSON
     * shape and can branch on the HTTP status (e.g. 401 vs 500).
     */
    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ApiError> statusException(ResponseStatusException exception) {
        HttpStatusCode status = exception.getStatusCode();
        String reason = exception.getReason() != null ? exception.getReason() : "Request failed.";
        return ResponseEntity.status(status).body(new ApiError(codeFor(status), reason, Map.of(), Instant.now()));
    }

    /**
     * Last-resort handler: never leak stack traces or a servlet-container HTML
     * error page to the client. Log the detail server-side, return an opaque 500.
     */
    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> internal(Exception exception) {
        log.error("Unhandled exception serving request", exception);
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "internal_error", "Something went wrong.", Map.of());
    }

    private ResponseEntity<ApiError> response(
            HttpStatus status,
            String code,
            String message,
            Map<String, String> fields
    ) {
        return ResponseEntity.status(status).body(new ApiError(code, message, fields, Instant.now()));
    }

    private static String codeFor(HttpStatusCode status) {
        return switch (status.value()) {
            case 400 -> "bad_request";
            case 401 -> "unauthorized";
            case 403 -> "forbidden";
            case 404 -> "not_found";
            case 409 -> "conflict";
            default -> status.is5xxServerError() ? "internal_error" : "error";
        };
    }
}
