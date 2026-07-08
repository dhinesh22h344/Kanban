package com.kanban.taskmanager.dto.response;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        long accessTokenExpiresInSeconds,
        UserSummaryResponse user
) {
}
