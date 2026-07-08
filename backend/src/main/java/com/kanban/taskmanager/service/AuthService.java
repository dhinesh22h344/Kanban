package com.kanban.taskmanager.service;

import com.kanban.taskmanager.dto.request.*;
import com.kanban.taskmanager.dto.response.AuthResponse;
import com.kanban.taskmanager.dto.response.MessageResponse;
import com.kanban.taskmanager.dto.response.UserSummaryResponse;
import com.kanban.taskmanager.entity.*;
import com.kanban.taskmanager.exception.BadRequestException;
import com.kanban.taskmanager.exception.InvalidTokenException;
import com.kanban.taskmanager.exception.ResourceNotFoundException;
import com.kanban.taskmanager.mapper.UserMapper;
import com.kanban.taskmanager.repository.CompanyRepository;
import com.kanban.taskmanager.repository.PasswordResetTokenRepository;
import com.kanban.taskmanager.repository.RefreshTokenRepository;
import com.kanban.taskmanager.repository.UserRepository;
import com.kanban.taskmanager.security.JwtService;
import com.kanban.taskmanager.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final MailService mailService;

    @Value("${app.password-reset.ttl-minutes}")
    private long passwordResetTtlMinutes;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @Transactional
    public AuthResponse registerCompany(RegisterCompanyRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email is already registered");
        }

        Company company = Company.builder()
                .name(request.companyName())
                .taskCounter(0)
                .build();
        company = companyRepository.save(company);

        User owner = User.builder()
                .company(company)
                .name(request.ownerName())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .phone(request.phone())
                .role(Role.OWNER)
                .status(UserStatus.ACTIVE)
                .build();
        owner = userRepository.save(owner);

        return issueTokens(owner);
    }

    @Transactional(readOnly = true)
    public UserSummaryResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserMapper.toSummary(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new InvalidTokenException("User not found"));

        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        String tokenHash = jwtService.hashToken(request.refreshToken());
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired refresh token"));

        if (!refreshToken.isActive()) {
            throw new InvalidTokenException("Invalid or expired refresh token");
        }

        refreshToken.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(refreshToken);

        User user = refreshToken.getUser();
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new InvalidTokenException("Account is disabled");
        }

        return issueTokens(user);
    }

    @Transactional
    public MessageResponse logout(RefreshTokenRequest request) {
        String tokenHash = jwtService.hashToken(request.refreshToken());
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            token.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(token);
        });
        return new MessageResponse("Logged out successfully");
    }

    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(user -> {
            String rawToken = jwtService.generateRawRefreshToken();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user)
                    .tokenHash(jwtService.hashToken(rawToken))
                    .expiresAt(LocalDateTime.now().plusMinutes(passwordResetTtlMinutes))
                    .build();
            passwordResetTokenRepository.save(resetToken);

            String resetLink = frontendBaseUrl + "/reset-password?token=" + rawToken;
            mailService.trySend(
                    user.getEmail(),
                    "Reset your Flowdeck password",
                    "Reset your password using the link below (expires in " + passwordResetTtlMinutes + " minutes):\n" + resetLink
            );
        });

        // Always return a generic message so we don't reveal whether an email is registered.
        return new MessageResponse("If that email is registered, a reset link has been sent");
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        String tokenHash = jwtService.hashToken(request.token());
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired reset token"));

        if (!resetToken.isActive()) {
            throw new InvalidTokenException("Invalid or expired reset token");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);

        refreshTokenRepository.revokeAllForUser(user.getId(), LocalDateTime.now());

        return new MessageResponse("Password reset successful");
    }

    @Transactional
    public MessageResponse changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        return new MessageResponse("Password changed successfully");
    }

    private AuthResponse issueTokens(User user) {
        UserPrincipal principal = new UserPrincipal(user);
        String accessToken = jwtService.generateAccessToken(principal);

        String rawRefreshToken = jwtService.generateRawRefreshToken();
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(jwtService.hashToken(rawRefreshToken))
                .expiresAt(LocalDateTime.now().plusDays(jwtService.getRefreshTokenTtlDays()))
                .build();
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
                accessToken,
                rawRefreshToken,
                jwtService.getAccessTokenTtlMinutes() * 60,
                UserMapper.toSummary(user)
        );
    }
}
