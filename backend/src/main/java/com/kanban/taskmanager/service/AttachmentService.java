package com.kanban.taskmanager.service;

import com.kanban.taskmanager.dto.response.AttachmentResponse;
import com.kanban.taskmanager.entity.Attachment;
import com.kanban.taskmanager.entity.Comment;
import com.kanban.taskmanager.entity.Task;
import com.kanban.taskmanager.entity.User;
import com.kanban.taskmanager.exception.BadRequestException;
import com.kanban.taskmanager.exception.ResourceNotFoundException;
import com.kanban.taskmanager.mapper.TaskMapper;
import com.kanban.taskmanager.repository.AttachmentRepository;
import com.kanban.taskmanager.repository.CommentRepository;
import com.kanban.taskmanager.repository.UserRepository;
import com.kanban.taskmanager.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final TaskService taskService;
    private final AttachmentStorageService storageService;

    @Transactional
    public AttachmentResponse upload(UserPrincipal actor, Long taskId, Long commentId, MultipartFile file) {
        Task task = taskService.getAccessibleTask(actor, taskId);
        User uploader = userRepository.findById(actor.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Comment comment = null;
        if (commentId != null) {
            comment = commentRepository.findById(commentId)
                    .filter(c -> c.getTask().getId().equals(task.getId()))
                    .orElseThrow(() -> new BadRequestException("Comment does not belong to this task"));
        }

        String storedPath = storageService.store(file);

        Attachment attachment = Attachment.builder()
                .task(task)
                .comment(comment)
                .uploadedBy(uploader)
                .fileName(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename())
                .storedPath(storedPath)
                .fileSize(file.getSize())
                .contentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType())
                .build();

        return TaskMapper.toAttachmentResponse(attachmentRepository.save(attachment));
    }

    @Transactional(readOnly = true)
    public Attachment getForDownload(UserPrincipal actor, Long taskId, Long attachmentId) {
        taskService.getAccessibleTask(actor, taskId);
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .filter(a -> a.getTask().getId().equals(taskId))
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));
        return attachment;
    }

    public InputStream loadContent(Attachment attachment) {
        return storageService.load(attachment.getStoredPath());
    }
}
