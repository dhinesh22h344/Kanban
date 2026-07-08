package com.kanban.taskmanager.dto.request;

import com.kanban.taskmanager.entity.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateTaskStatusRequest(
        @NotNull(message = "Status is required")
        TaskStatus status
) {
}
