package com.kanban.taskmanager.dto.response;

import java.time.LocalDateTime;

public record AttachmentResponse(
        Long id,
        Long taskId,
        Long commentId,
        UserSummaryResponse uploadedBy,
        String fileName,
        long fileSize,
        String contentType,
        String downloadUrl,
        LocalDateTime createdAt
) {
}
