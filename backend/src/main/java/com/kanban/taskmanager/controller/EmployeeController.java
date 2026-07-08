package com.kanban.taskmanager.controller;

import com.kanban.taskmanager.dto.request.CreateEmployeeRequest;
import com.kanban.taskmanager.dto.request.UpdateEmployeeRequest;
import com.kanban.taskmanager.dto.request.UpdateStatusRequest;
import com.kanban.taskmanager.dto.response.PageResponse;
import com.kanban.taskmanager.dto.response.UserSummaryResponse;
import com.kanban.taskmanager.entity.Role;
import com.kanban.taskmanager.entity.UserStatus;
import com.kanban.taskmanager.security.UserPrincipal;
import com.kanban.taskmanager.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER','MANAGER')")
public class EmployeeController {

    private final UserService userService;

    @GetMapping
    public PageResponse<UserSummaryResponse> search(
            @AuthenticationPrincipal UserPrincipal actor,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) String department,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return userService.search(actor, search, role, status, department, pageable);
    }

    @GetMapping("/{id}")
    public UserSummaryResponse getById(@AuthenticationPrincipal UserPrincipal actor, @PathVariable Long id) {
        return userService.getById(actor, id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserSummaryResponse create(
            @AuthenticationPrincipal UserPrincipal actor,
            @Valid @RequestBody CreateEmployeeRequest request
    ) {
        return userService.createEmployee(actor, request);
    }

    @PutMapping("/{id}")
    public UserSummaryResponse update(
            @AuthenticationPrincipal UserPrincipal actor,
            @PathVariable Long id,
            @Valid @RequestBody UpdateEmployeeRequest request
    ) {
        return userService.updateEmployee(actor, id, request);
    }

    @PatchMapping("/{id}/status")
    public UserSummaryResponse updateStatus(
            @AuthenticationPrincipal UserPrincipal actor,
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        return userService.updateStatus(actor, id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal UserPrincipal actor, @PathVariable Long id) {
        userService.deleteEmployee(actor, id);
    }
}
