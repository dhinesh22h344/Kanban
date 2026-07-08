package com.kanban.taskmanager.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterCompanyRequest(
        @NotBlank(message = "Company name is required")
        @Size(max = 150)
        String companyName,

        @NotBlank(message = "Owner name is required")
        @Size(max = 150)
        String ownerName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password,

        String phone
) {
}
