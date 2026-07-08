package com.kanban.taskmanager.repository.spec;

import com.kanban.taskmanager.entity.Priority;
import com.kanban.taskmanager.entity.Task;
import com.kanban.taskmanager.entity.TaskStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public final class TaskSpecifications {

    private TaskSpecifications() {
    }

    public static Specification<Task> companyId(Long companyId) {
        return (root, query, cb) -> cb.equal(root.get("company").get("id"), companyId);
    }

    public static Specification<Task> assignedToId(Long assignedToId) {
        if (assignedToId == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("assignedTo").get("id"), assignedToId);
    }

    public static Specification<Task> search(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }
        String like = "%" + search.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), like),
                cb.like(cb.lower(root.get("taskCode")), like)
        );
    }

    public static Specification<Task> priority(Priority priority) {
        if (priority == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("priority"), priority);
    }

    public static Specification<Task> status(TaskStatus status) {
        if (status == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Task> dueDateFrom(LocalDate from) {
        if (from == null) {
            return null;
        }
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("dueDate"), from);
    }

    public static Specification<Task> dueDateTo(LocalDate to) {
        if (to == null) {
            return null;
        }
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("dueDate"), to);
    }
}
