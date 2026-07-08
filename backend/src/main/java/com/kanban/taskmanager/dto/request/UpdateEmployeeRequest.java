package com.kanban.taskmanager.dto.request;

import com.kanban.taskmanager.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateEmployeeRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 150)
        String name,

        String phone,
        String designation,
        String department,

        /** Only honored when the acting user is an OWNER; ignored otherwise. */
        Role role
) {
}
