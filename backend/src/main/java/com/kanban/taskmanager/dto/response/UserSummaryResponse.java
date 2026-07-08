package com.kanban.taskmanager.dto.response;

import com.kanban.taskmanager.entity.Role;
import com.kanban.taskmanager.entity.UserStatus;

import java.time.LocalDateTime;

public record UserSummaryResponse(
        Long id,
        String name,
        String email,
        String phone,
        String designation,
        String department,
        Role role,
        UserStatus status,
        Long companyId,
        String companyName,
        LocalDateTime createdAt
) {
}
