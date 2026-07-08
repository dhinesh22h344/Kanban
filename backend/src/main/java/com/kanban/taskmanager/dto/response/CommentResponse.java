package com.kanban.taskmanager.dto.response;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        Long taskId,
        UserSummaryResponse user,
        String content,
        LocalDateTime createdAt
) {
}
