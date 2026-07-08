package com.kanban.taskmanager.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateCommentRequest(
        @NotBlank(message = "Comment cannot be empty")
        String content
) {
}
