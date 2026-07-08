package com.kanban.taskmanager.controller;

import com.kanban.taskmanager.dto.response.DashboardResponse;
import com.kanban.taskmanager.security.UserPrincipal;
import com.kanban.taskmanager.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public DashboardResponse getDashboard(@AuthenticationPrincipal UserPrincipal actor) {
        return dashboardService.getDashboard(actor);
    }
}
