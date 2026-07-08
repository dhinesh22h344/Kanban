package com.kanban.taskmanager.mapper;

import com.kanban.taskmanager.dto.response.UserSummaryResponse;
import com.kanban.taskmanager.entity.User;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserSummaryResponse toSummary(User user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getDesignation(),
                user.getDepartment(),
                user.getRole(),
                user.getStatus(),
                user.getCompany().getId(),
                user.getCompany().getName(),
                user.getCreatedAt()
        );
    }
}
