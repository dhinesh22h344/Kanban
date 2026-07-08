package com.kanban.taskmanager.service;

import com.kanban.taskmanager.dto.response.PageResponse;
import com.kanban.taskmanager.dto.response.NotificationResponse;
import com.kanban.taskmanager.entity.Notification;
import com.kanban.taskmanager.entity.NotificationType;
import com.kanban.taskmanager.entity.Task;
import com.kanban.taskmanager.entity.User;
import com.kanban.taskmanager.exception.ForbiddenException;
import com.kanban.taskmanager.exception.ResourceNotFoundException;
import com.kanban.taskmanager.mapper.NotificationMapper;
import com.kanban.taskmanager.repository.NotificationRepository;
import com.kanban.taskmanager.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void create(User recipient, NotificationType type, String message, Task relatedTask) {
        Notification notification = Notification.builder()
                .company(recipient.getCompany())
                .user(recipient)
                .type(type)
                .message(message)
                .relatedTask(relatedTask)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> list(UserPrincipal actor, Pageable pageable) {
        return PageResponse.of(
                notificationRepository.findByUserIdOrderByCreatedAtDesc(actor.getId(), pageable)
                        .map(NotificationMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public long unreadCount(UserPrincipal actor) {
        return notificationRepository.countByUserIdAndIsReadFalse(actor.getId());
    }

    @Transactional
    public void markRead(UserPrincipal actor, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(actor.getId())) {
            throw new ForbiddenException("You cannot modify another user's notifications");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllRead(UserPrincipal actor) {
        notificationRepository.markAllReadForUser(actor.getId());
    }
}
