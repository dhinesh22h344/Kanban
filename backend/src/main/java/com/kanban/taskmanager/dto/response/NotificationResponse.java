package com.kanban.taskmanager.dto.response;

import com.kanban.taskmanager.entity.NotificationType;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        NotificationType type,
        String message,
        Long relatedTaskId,
        String relatedTaskCode,
        boolean isRead,
        LocalDateTime createdAt
) {
}
