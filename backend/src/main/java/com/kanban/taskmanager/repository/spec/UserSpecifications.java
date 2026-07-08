package com.kanban.taskmanager.repository.spec;

import com.kanban.taskmanager.entity.Role;
import com.kanban.taskmanager.entity.User;
import com.kanban.taskmanager.entity.UserStatus;
import org.springframework.data.jpa.domain.Specification;

public final class UserSpecifications {

    private UserSpecifications() {
    }

    public static Specification<User> companyId(Long companyId) {
        return (root, query, cb) -> cb.equal(root.get("company").get("id"), companyId);
    }

    public static Specification<User> search(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }
        String like = "%" + search.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), like),
                cb.like(cb.lower(root.get("email")), like)
        );
    }

    public static Specification<User> role(Role role) {
        if (role == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("role"), role);
    }

    public static Specification<User> status(UserStatus status) {
        if (status == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<User> department(String department) {
        if (department == null || department.isBlank()) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("department"), department);
    }
}
