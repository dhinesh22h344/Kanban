package com.kanban.taskmanager.dto.response;

import com.kanban.taskmanager.entity.Priority;
import com.kanban.taskmanager.entity.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskSummaryResponse(
        Long id,
        String taskCode,
        String title,
        Priority priority,
        TaskStatus status,
        LocalDate dueDate,
        UserSummaryResponse assignedTo,
        UserSummaryResponse createdBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        long commentCount,
        long attachmentCount
) {
}
