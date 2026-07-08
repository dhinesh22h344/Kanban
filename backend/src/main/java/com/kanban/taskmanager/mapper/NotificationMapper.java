package com.kanban.taskmanager.mapper;

import com.kanban.taskmanager.dto.response.NotificationResponse;
import com.kanban.taskmanager.entity.Notification;

public final class NotificationMapper {

    private NotificationMapper() {
    }

    public static NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getMessage(),
                notification.getRelatedTask() == null ? null : notification.getRelatedTask().getId(),
                notification.getRelatedTask() == null ? null : notification.getRelatedTask().getTaskCode(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
