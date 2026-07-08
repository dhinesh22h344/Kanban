package com.kanban.taskmanager.dto.response;

import com.kanban.taskmanager.entity.Priority;
import com.kanban.taskmanager.entity.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record TaskDetailResponse(
        Long id,
        String taskCode,
        String title,
        String description,
        Priority priority,
        TaskStatus status,
        LocalDate dueDate,
        UserSummaryResponse assignedTo,
        UserSummaryResponse createdBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<CommentResponse> comments,
        List<AttachmentResponse> attachments
) {
}
