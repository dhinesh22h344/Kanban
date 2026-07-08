package com.kanban.taskmanager.controller;

import com.kanban.taskmanager.dto.request.*;
import com.kanban.taskmanager.dto.response.AuthResponse;
import com.kanban.taskmanager.dto.response.MessageResponse;
import com.kanban.taskmanager.dto.response.UserSummaryResponse;
import com.kanban.taskmanager.security.UserPrincipal;
import com.kanban.taskmanager.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterCompanyRequest request) {
        return authService.registerCompany(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request);
    }

    @PostMapping("/logout")
    public MessageResponse logout(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.logout(request);
    }

    @PostMapping("/forgot-password")
    public MessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return authService.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    public MessageResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }

    @PostMapping("/change-password")
    public MessageResponse changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        return authService.changePassword(principal.getId(), request);
    }

    @GetMapping("/me")
    public UserSummaryResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        return authService.getCurrentUser(principal.getId());
    }
}
