package com.kanban.taskmanager.controller;

import com.kanban.taskmanager.dto.response.NotificationResponse;
import com.kanban.taskmanager.dto.response.PageResponse;
import com.kanban.taskmanager.security.UserPrincipal;
import com.kanban.taskmanager.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public PageResponse<NotificationResponse> list(
            @AuthenticationPrincipal UserPrincipal actor,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return notificationService.list(actor, pageable);
    }

    @GetMapping("/unread-count")
    public long unreadCount(@AuthenticationPrincipal UserPrincipal actor) {
        return notificationService.unreadCount(actor);
    }

    @PostMapping("/{id}/read")
    public void markRead(@AuthenticationPrincipal UserPrincipal actor, @PathVariable Long id) {
        notificationService.markRead(actor, id);
    }

    @PostMapping("/read-all")
    public void markAllRead(@AuthenticationPrincipal UserPrincipal actor) {
        notificationService.markAllRead(actor);
    }
}
