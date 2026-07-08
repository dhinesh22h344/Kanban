package com.kanban.taskmanager.dto.request;

import com.kanban.taskmanager.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateTaskRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 200)
        String title,

        String description,

        @NotNull(message = "Priority is required")
        Priority priority,

        LocalDate dueDate,

        Long assignedToId
) {
}
