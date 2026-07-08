package com.kanban.taskmanager.service;

import com.kanban.taskmanager.dto.request.CreateCommentRequest;
import com.kanban.taskmanager.dto.response.CommentResponse;
import com.kanban.taskmanager.entity.Comment;
import com.kanban.taskmanager.entity.NotificationType;
import com.kanban.taskmanager.entity.Task;
import com.kanban.taskmanager.entity.User;
import com.kanban.taskmanager.exception.ResourceNotFoundException;
import com.kanban.taskmanager.mapper.TaskMapper;
import com.kanban.taskmanager.repository.CommentRepository;
import com.kanban.taskmanager.repository.UserRepository;
import com.kanban.taskmanager.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final TaskService taskService;
    private final NotificationService notificationService;

    @Transactional
    public CommentResponse addComment(UserPrincipal actor, Long taskId, CreateCommentRequest request) {
        Task task = taskService.getAccessibleTask(actor, taskId);
        User author = userRepository.findById(actor.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Comment comment = Comment.builder()
                .task(task)
                .user(author)
                .content(request.content())
                .build();
        comment = commentRepository.save(comment);

        notifyOtherParty(actor, task);

        return TaskMapper.toCommentResponse(comment);
    }

    private void notifyOtherParty(UserPrincipal actor, Task task) {
        boolean actorIsAssignee = task.getAssignedTo() != null && task.getAssignedTo().getId().equals(actor.getId());

        if (actorIsAssignee) {
            User creator = task.getCreatedBy();
            if (!creator.getId().equals(actor.getId())) {
                notificationService.create(creator, NotificationType.COMMENT_ADDED,
                        "New comment on " + task.getTaskCode(), task);
            }
        } else if (task.getAssignedTo() != null && !task.getAssignedTo().getId().equals(actor.getId())) {
            notificationService.create(task.getAssignedTo(), NotificationType.COMMENT_ADDED,
                    "New comment on " + task.getTaskCode(), task);
        }
    }
}
