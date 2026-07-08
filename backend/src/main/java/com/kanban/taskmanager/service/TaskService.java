package com.kanban.taskmanager.service;

import com.kanban.taskmanager.dto.request.CreateTaskRequest;
import com.kanban.taskmanager.dto.request.UpdateTaskRequest;
import com.kanban.taskmanager.dto.request.UpdateTaskStatusRequest;
import com.kanban.taskmanager.dto.response.PageResponse;
import com.kanban.taskmanager.dto.response.TaskDetailResponse;
import com.kanban.taskmanager.dto.response.TaskSummaryResponse;
import com.kanban.taskmanager.entity.*;
import com.kanban.taskmanager.exception.BadRequestException;
import com.kanban.taskmanager.exception.ForbiddenException;
import com.kanban.taskmanager.exception.ResourceNotFoundException;
import com.kanban.taskmanager.mapper.TaskMapper;
import com.kanban.taskmanager.repository.*;
import com.kanban.taskmanager.repository.spec.TaskSpecifications;
import com.kanban.taskmanager.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final CommentRepository commentRepository;
    private final AttachmentRepository attachmentRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    @Transactional
    public TaskDetailResponse create(UserPrincipal actor, CreateTaskRequest request) {
        User createdBy = userRepository.findById(actor.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User assignedTo = resolveAssignee(actor.getCompanyId(), request.assignedToId());

        Company company = companyRepository.findByIdForUpdate(actor.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        int nextNumber = company.getTaskCounter() + 1;
        company.setTaskCounter(nextNumber);
        companyRepository.save(company);

        Task task = Task.builder()
                .company(company)
                .taskCode("TASK-" + nextNumber)
                .title(request.title())
                .description(request.description())
                .priority(request.priority())
                .status(TaskStatus.TODO)
                .dueDate(request.dueDate())
                .assignedTo(assignedTo)
                .createdBy(createdBy)
                .build();

        task = taskRepository.save(task);

        if (assignedTo != null && !assignedTo.getId().equals(actor.getId())) {
            notificationService.create(assignedTo, NotificationType.TASK_ASSIGNED,
                    "You were assigned to " + task.getTaskCode() + ": " + task.getTitle(), task);
        }

        return TaskMapper.toDetail(task, List.of(), List.of());
    }

    @Transactional
    public TaskDetailResponse update(UserPrincipal actor, Long taskId, UpdateTaskRequest request) {
        Task task = getCompanyTask(actor.getCompanyId(), taskId);

        User newAssignee = resolveAssignee(actor.getCompanyId(), request.assignedToId());
        User previousAssignee = task.getAssignedTo();
        boolean reassigned = !equalsId(previousAssignee, newAssignee);

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
        task.setAssignedTo(newAssignee);
        task = taskRepository.save(task);

        if (reassigned && newAssignee != null && !newAssignee.getId().equals(actor.getId())) {
            notificationService.create(newAssignee, NotificationType.TASK_ASSIGNED,
                    "You were assigned to " + task.getTaskCode() + ": " + task.getTitle(), task);
        } else if (!reassigned && newAssignee != null && !newAssignee.getId().equals(actor.getId())) {
            notificationService.create(newAssignee, NotificationType.TASK_UPDATED,
                    task.getTaskCode() + " was updated", task);
        }

        return toDetail(task);
    }

    @Transactional
    public TaskDetailResponse updateStatus(UserPrincipal actor, Long taskId, UpdateTaskStatusRequest request) {
        Task task = getCompanyTask(actor.getCompanyId(), taskId);
        assertCanAccessTask(actor, task);

        task.setStatus(request.status());
        task = taskRepository.save(task);

        notifyStatusChange(actor, task);

        return toDetail(task);
    }

    @Transactional
    public void delete(UserPrincipal actor, Long taskId) {
        Task task = getCompanyTask(actor.getCompanyId(), taskId);

        attachmentRepository.deleteByTaskId(task.getId());
        commentRepository.deleteByTaskId(task.getId());
        notificationRepository.deleteByRelatedTaskId(task.getId());
        taskRepository.delete(task);
    }

    @Transactional(readOnly = true)
    public PageResponse<TaskSummaryResponse> search(
            UserPrincipal actor,
            String search,
            Long assignedToId,
            Priority priority,
            TaskStatus status,
            LocalDate dueDateFrom,
            LocalDate dueDateTo,
            Pageable pageable
    ) {
        Long effectiveAssignedToId = actor.getRole() == Role.EMPLOYEE ? actor.getId() : assignedToId;

        List<Specification<Task>> specs = java.util.Arrays.asList(
                TaskSpecifications.companyId(actor.getCompanyId()),
                TaskSpecifications.assignedToId(effectiveAssignedToId),
                TaskSpecifications.search(search),
                TaskSpecifications.priority(priority),
                TaskSpecifications.status(status),
                TaskSpecifications.dueDateFrom(dueDateFrom),
                TaskSpecifications.dueDateTo(dueDateTo)
        );

        Specification<Task> combined = Specification.allOf(specs.stream().filter(s -> s != null).toList());

        Page<Task> page = taskRepository.findAll(combined, pageable);
        List<Long> taskIds = page.getContent().stream().map(Task::getId).toList();
        Map<Long, Long> commentCounts = taskIds.isEmpty()
                ? Map.of() : countMap(commentRepository.countGroupedByTaskIds(taskIds));
        Map<Long, Long> attachmentCounts = taskIds.isEmpty()
                ? Map.of() : countMap(attachmentRepository.countGroupedByTaskIds(taskIds));

        return PageResponse.of(page.map(task -> TaskMapper.toSummary(
                task,
                commentCounts.getOrDefault(task.getId(), 0L),
                attachmentCounts.getOrDefault(task.getId(), 0L))));
    }

    private static Map<Long, Long> countMap(List<TaskIdCount> counts) {
        return counts.stream().collect(Collectors.toMap(TaskIdCount::getTaskId, TaskIdCount::getCount));
    }

    @Transactional(readOnly = true)
    public TaskDetailResponse getDetail(UserPrincipal actor, Long taskId) {
        Task task = getCompanyTask(actor.getCompanyId(), taskId);
        assertCanAccessTask(actor, task);
        return toDetail(task);
    }

    /** Used by CommentService/AttachmentService to enforce the same task-visibility rule. */
    @Transactional(readOnly = true)
    public Task getAccessibleTask(UserPrincipal actor, Long taskId) {
        Task task = getCompanyTask(actor.getCompanyId(), taskId);
        assertCanAccessTask(actor, task);
        return task;
    }

    private void notifyStatusChange(UserPrincipal actor, Task task) {
        boolean actorIsAssignee = task.getAssignedTo() != null && task.getAssignedTo().getId().equals(actor.getId());

        if (task.getStatus() == TaskStatus.COMPLETED) {
            User creator = task.getCreatedBy();
            if (!creator.getId().equals(actor.getId())) {
                notificationService.create(creator, NotificationType.TASK_COMPLETED,
                        task.getTaskCode() + " was marked completed", task);
            }
            return;
        }

        if (actorIsAssignee) {
            User creator = task.getCreatedBy();
            if (!creator.getId().equals(actor.getId())) {
                notificationService.create(creator, NotificationType.TASK_UPDATED,
                        task.getTaskCode() + " status changed to " + task.getStatus(), task);
            }
        } else if (task.getAssignedTo() != null && !task.getAssignedTo().getId().equals(actor.getId())) {
            notificationService.create(task.getAssignedTo(), NotificationType.TASK_UPDATED,
                    task.getTaskCode() + " status changed to " + task.getStatus(), task);
        }
    }

    private TaskDetailResponse toDetail(Task task) {
        List<Comment> comments = commentRepository.findByTaskIdOrderByCreatedAtAsc(task.getId());
        List<Attachment> attachments = attachmentRepository.findByTaskIdOrderByCreatedAtAsc(task.getId());
        return TaskMapper.toDetail(task, comments, attachments);
    }

    private Task getCompanyTask(Long companyId, Long taskId) {
        return taskRepository.findByIdAndCompanyId(taskId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }

    private User resolveAssignee(Long companyId, Long assignedToId) {
        if (assignedToId == null) {
            return null;
        }
        return userRepository.findByIdAndCompanyId(assignedToId, companyId)
                .orElseThrow(() -> new BadRequestException("Assigned employee not found in your company"));
    }

    private void assertCanAccessTask(UserPrincipal actor, Task task) {
        if (actor.getRole() != Role.EMPLOYEE) {
            return;
        }
        if (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(actor.getId())) {
            throw new ForbiddenException("You can only access tasks assigned to you");
        }
    }

    private boolean equalsId(User a, User b) {
        if (a == null || b == null) {
            return a == b;
        }
        return a.getId().equals(b.getId());
    }
}
