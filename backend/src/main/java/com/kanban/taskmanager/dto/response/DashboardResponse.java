package com.kanban.taskmanager.dto.response;

import java.util.List;

public record DashboardResponse(
        long totalTasks,
        long pendingTasks,
        long inProgressTasks,
        long completedTasks,
        long overdueTasks,
        List<TaskSummaryResponse> recentActivity,
        List<TaskSummaryResponse> todaysAssignedTasks
) {
}
