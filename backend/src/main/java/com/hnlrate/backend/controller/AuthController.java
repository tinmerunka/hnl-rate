package com.hnlrate.backend.controller;

import com.hnlrate.backend.dto.AuthResponseDTO;
import com.hnlrate.backend.dto.LoginDTO;
import com.hnlrate.backend.dto.RefreshTokenRequestDTO;
import com.hnlrate.backend.dto.RegisterDTO;
import com.hnlrate.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Arrays;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String REFRESH_COOKIE = "refreshToken";

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody RegisterDTO dto) {
        authService.register(dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginDTO dto, HttpServletResponse response) {
        AuthResponseDTO authResponse = authService.login(dto);
        setRefreshCookie(response, authResponse.getRefreshToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refresh(
            @RequestBody(required = false) RefreshTokenRequestDTO dto,
            HttpServletRequest request,
            HttpServletResponse response) {
        String tokenFromCookie = extractCookieToken(request);
        String tokenToUse = tokenFromCookie != null
                ? tokenFromCookie
                : (dto != null ? dto.getRefreshToken() : null);

        AuthResponseDTO authResponse = authService.refreshWithToken(tokenToUse);

        if (tokenFromCookie != null) {
            setRefreshCookie(response, authResponse.getRefreshToken());
        }

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestBody(required = false) RefreshTokenRequestDTO dto,
            HttpServletRequest request,
            HttpServletResponse response) {
        String tokenFromCookie = extractCookieToken(request);
        String tokenToUse = tokenFromCookie != null
                ? tokenFromCookie
                : (dto != null ? dto.getRefreshToken() : null);

        try {
            if (tokenToUse != null) authService.logoutWithToken(tokenToUse);
        } catch (Exception ignored) {
            // Token may already be expired or not found — still clear the cookie
        } finally {
            clearRefreshCookie(response);
        }

        return ResponseEntity.ok().build();
    }

    private String extractCookieToken(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> REFRESH_COOKIE.equals(c.getName()))
                .map(jakarta.servlet.http.Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    private void setRefreshCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, token)
                .httpOnly(true)
                .secure(false) // set true in production (HTTPS)
                .path("/api/auth")
                .maxAge(Duration.ofDays(7))
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .secure(false)
                .path("/api/auth")
                .maxAge(Duration.ZERO)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}