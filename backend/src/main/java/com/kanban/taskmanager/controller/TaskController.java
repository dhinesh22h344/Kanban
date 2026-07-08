package com.kanban.taskmanager.controller;

import com.kanban.taskmanager.dto.request.CreateCommentRequest;
import com.kanban.taskmanager.dto.request.CreateTaskRequest;
import com.kanban.taskmanager.dto.request.UpdateTaskRequest;
import com.kanban.taskmanager.dto.request.UpdateTaskStatusRequest;
import com.kanban.taskmanager.dto.response.AttachmentResponse;
import com.kanban.taskmanager.dto.response.CommentResponse;
import com.kanban.taskmanager.dto.response.PageResponse;
import com.kanban.taskmanager.dto.response.TaskDetailResponse;
import com.kanban.taskmanager.dto.response.TaskSummaryResponse;
import com.kanban.taskmanager.entity.Attachment;
import com.kanban.taskmanager.entity.Priority;
import com.kanban.taskmanager.entity.TaskStatus;
import com.kanban.taskmanager.security.UserPrincipal;
import com.kanban.taskmanager.service.AttachmentService;
import com.kanban.taskmanager.service.CommentService;
import com.kanban.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final CommentService commentService;
    private final AttachmentService attachmentService;

    @GetMapping
    public PageResponse<TaskSummaryResponse> search(
            @AuthenticationPrincipal UserPrincipal actor,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long assignedToId,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate dueDateFrom,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate dueDateTo,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return taskService.search(actor, search, assignedToId, priority, status, dueDateFrom, dueDateTo, pageable);
    }

    @GetMapping("/{id}")
    public TaskDetailResponse getDetail(@AuthenticationPrincipal UserPrincipal actor, @PathVariable Long id) {
        return taskService.getDetail(actor, id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskDetailResponse create(
            @AuthenticationPrincipal UserPrincipal actor,
            @Valid @RequestBody CreateTaskRequest request
    ) {
        return taskService.create(actor, request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public TaskDetailResponse update(
            @AuthenticationPrincipal UserPrincipal actor,
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request
    ) {
        return taskService.update(actor, id, request);
    }

    @PatchMapping("/{id}/status")
    public TaskDetailResponse updateStatus(
            @AuthenticationPrincipal UserPrincipal actor,
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskStatusRequest request
    ) {
        return taskService.updateStatus(actor, id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal UserPrincipal actor, @PathVariable Long id) {
        taskService.delete(actor, id);
    }

    @PostMapping("/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse addComment(
            @AuthenticationPrincipal UserPrincipal actor,
            @PathVariable Long id,
            @Valid @RequestBody CreateCommentRequest request
    ) {
        return commentService.addComment(actor, id, request);
    }

    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public AttachmentResponse uploadAttachment(
            @AuthenticationPrincipal UserPrincipal actor,
            @PathVariable Long id,
            @RequestParam(required = false) Long commentId,
            @RequestParam("file") MultipartFile file
    ) {
        return attachmentService.upload(actor, id, commentId, file);
    }

    @GetMapping("/{id}/attachments/{attachmentId}/download")
    public ResponseEntity<InputStreamResource> downloadAttachment(
            @AuthenticationPrincipal UserPrincipal actor,
            @PathVariable Long id,
            @PathVariable Long attachmentId
    ) {
        Attachment attachment = attachmentService.getForDownload(actor, id, attachmentId);
        InputStreamResource resource = new InputStreamResource(attachmentService.loadContent(attachment));

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(attachment.getFileName()).build().toString())
                .body(resource);
    }
}
