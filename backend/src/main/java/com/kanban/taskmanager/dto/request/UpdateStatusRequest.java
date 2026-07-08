package com.kanban.taskmanager.dto.request;

import com.kanban.taskmanager.entity.UserStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(
        @NotNull(message = "Status is required")
        UserStatus status
) {
}
