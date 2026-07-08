package com.kanban.taskmanager.service;

import com.kanban.taskmanager.dto.response.DashboardResponse;
import com.kanban.taskmanager.dto.response.TaskSummaryResponse;
import com.kanban.taskmanager.entity.Role;
import com.kanban.taskmanager.entity.Task;
import com.kanban.taskmanager.entity.TaskStatus;
import com.kanban.taskmanager.mapper.TaskMapper;
import com.kanban.taskmanager.repository.AttachmentRepository;
import com.kanban.taskmanager.repository.CommentRepository;
import com.kanban.taskmanager.repository.TaskIdCount;
import com.kanban.taskmanager.repository.TaskRepository;
import com.kanban.taskmanager.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TaskRepository taskRepository;
    private final CommentRepository commentRepository;
    private final AttachmentRepository attachmentRepository;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(UserPrincipal actor) {
        Long companyId = actor.getCompanyId();
        boolean scopedToSelf = actor.getRole() == Role.EMPLOYEE;
        LocalDate today = LocalDate.now();

        long total;
        long pending;
        long inProgress;
        long completed;
        long overdue;
        List<Task> recentActivity;

        if (scopedToSelf) {
            Long userId = actor.getId();
            total = taskRepository.countByCompanyIdAndAssignedToId(companyId, userId);
            pending = taskRepository.countByCompanyIdAndAssignedToIdAndStatus(companyId, userId, TaskStatus.TODO);
            inProgress = taskRepository.countByCompanyIdAndAssignedToIdAndStatus(companyId, userId, TaskStatus.IN_PROGRESS);
            completed = taskRepository.countByCompanyIdAndAssignedToIdAndStatus(companyId, userId, TaskStatus.COMPLETED);
            overdue = taskRepository.countByCompanyIdAndAssignedToIdAndStatusNotAndDueDateBefore(
                    companyId, userId, TaskStatus.COMPLETED, today);
            recentActivity = taskRepository.findTop10ByCompanyIdAndAssignedToIdOrderByUpdatedAtDesc(companyId, userId);
        } else {
            total = taskRepository.countByCompanyId(companyId);
            pending = taskRepository.countByCompanyIdAndStatus(companyId, TaskStatus.TODO);
            inProgress = taskRepository.countByCompanyIdAndStatus(companyId, TaskStatus.IN_PROGRESS);
            completed = taskRepository.countByCompanyIdAndStatus(companyId, TaskStatus.COMPLETED);
            overdue = taskRepository.countByCompanyIdAndStatusNotAndDueDateBefore(companyId, TaskStatus.COMPLETED, today);
            recentActivity = taskRepository.findTop10ByCompanyIdOrderByUpdatedAtDesc(companyId);
        }

        List<Task> todaysAssigned =
                taskRepository.findByCompanyIdAndAssignedToIdAndDueDate(companyId, actor.getId(), today);

        return new DashboardResponse(
                total,
                pending,
                inProgress,
                completed,
                overdue,
                toSummaries(recentActivity),
                toSummaries(todaysAssigned)
        );
    }

    private List<TaskSummaryResponse> toSummaries(List<Task> tasks) {
        if (tasks.isEmpty()) {
            return List.of();
        }
        List<Long> taskIds = tasks.stream().map(Task::getId).toList();
        Map<Long, Long> commentCounts = countMap(commentRepository.countGroupedByTaskIds(taskIds));
        Map<Long, Long> attachmentCounts = countMap(attachmentRepository.countGroupedByTaskIds(taskIds));

        return tasks.stream()
                .map(task -> TaskMapper.toSummary(
                        task,
                        commentCounts.getOrDefault(task.getId(), 0L),
                        attachmentCounts.getOrDefault(task.getId(), 0L)))
                .toList();
    }

    private static Map<Long, Long> countMap(List<TaskIdCount> counts) {
        return counts.stream().collect(Collectors.toMap(TaskIdCount::getTaskId, TaskIdCount::getCount));
    }
}
