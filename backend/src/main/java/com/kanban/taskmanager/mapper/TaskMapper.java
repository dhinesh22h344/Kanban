package com.kanban.taskmanager.mapper;

import com.kanban.taskmanager.dto.response.AttachmentResponse;
import com.kanban.taskmanager.dto.response.CommentResponse;
import com.kanban.taskmanager.dto.response.TaskDetailResponse;
import com.kanban.taskmanager.dto.response.TaskSummaryResponse;
import com.kanban.taskmanager.entity.Attachment;
import com.kanban.taskmanager.entity.Comment;
import com.kanban.taskmanager.entity.Task;

import java.util.List;

public final class TaskMapper {

    private TaskMapper() {
    }

    public static TaskSummaryResponse toSummary(Task task, long commentCount, long attachmentCount) {
        return new TaskSummaryResponse(
                task.getId(),
                task.getTaskCode(),
                task.getTitle(),
                task.getPriority(),
                task.getStatus(),
                task.getDueDate(),
                task.getAssignedTo() == null ? null : UserMapper.toSummary(task.getAssignedTo()),
                UserMapper.toSummary(task.getCreatedBy()),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                commentCount,
                attachmentCount
        );
    }

    public static TaskDetailResponse toDetail(Task task, List<Comment> comments, List<Attachment> attachments) {
        return new TaskDetailResponse(
                task.getId(),
                task.getTaskCode(),
                task.getTitle(),
                task.getDescription(),
                task.getPriority(),
                task.getStatus(),
                task.getDueDate(),
                task.getAssignedTo() == null ? null : UserMapper.toSummary(task.getAssignedTo()),
                UserMapper.toSummary(task.getCreatedBy()),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                comments.stream().map(TaskMapper::toCommentResponse).toList(),
                attachments.stream().map(TaskMapper::toAttachmentResponse).toList()
        );
    }

    public static CommentResponse toCommentResponse(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getTask().getId(),
                UserMapper.toSummary(comment.getUser()),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }

    public static AttachmentResponse toAttachmentResponse(Attachment attachment) {
        return new AttachmentResponse(
                attachment.getId(),
                attachment.getTask().getId(),
                attachment.getComment() == null ? null : attachment.getComment().getId(),
                UserMapper.toSummary(attachment.getUploadedBy()),
                attachment.getFileName(),
                attachment.getFileSize(),
                attachment.getContentType(),
                "/api/tasks/" + attachment.getTask().getId() + "/attachments/" + attachment.getId() + "/download",
                attachment.getCreatedAt()
        );
    }
}
