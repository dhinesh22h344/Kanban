package com.kanban.taskmanager.service;

import com.kanban.taskmanager.dto.request.CreateEmployeeRequest;
import com.kanban.taskmanager.dto.request.UpdateEmployeeRequest;
import com.kanban.taskmanager.dto.request.UpdateStatusRequest;
import com.kanban.taskmanager.dto.response.PageResponse;
import com.kanban.taskmanager.dto.response.UserSummaryResponse;
import com.kanban.taskmanager.entity.Company;
import com.kanban.taskmanager.entity.Role;
import com.kanban.taskmanager.entity.User;
import com.kanban.taskmanager.entity.UserStatus;
import com.kanban.taskmanager.exception.BadRequestException;
import com.kanban.taskmanager.exception.ForbiddenException;
import com.kanban.taskmanager.exception.ResourceNotFoundException;
import com.kanban.taskmanager.mapper.UserMapper;
import com.kanban.taskmanager.repository.AttachmentRepository;
import com.kanban.taskmanager.repository.CommentRepository;
import com.kanban.taskmanager.repository.CompanyRepository;
import com.kanban.taskmanager.repository.NotificationRepository;
import com.kanban.taskmanager.repository.PasswordResetTokenRepository;
import com.kanban.taskmanager.repository.RefreshTokenRepository;
import com.kanban.taskmanager.repository.TaskRepository;
import com.kanban.taskmanager.repository.UserRepository;
import com.kanban.taskmanager.repository.spec.UserSpecifications;
import com.kanban.taskmanager.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final TaskRepository taskRepository;
    private final CommentRepository commentRepository;
    private final AttachmentRepository attachmentRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserSummaryResponse createEmployee(UserPrincipal actor, CreateEmployeeRequest request) {
        assertCanAssignRole(actor, request.role());

        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email is already registered");
        }

        Company company = companyRepository.getReferenceById(actor.getCompanyId());

        User user = User.builder()
                .company(company)
                .name(request.name())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .phone(request.phone())
                .designation(request.designation())
                .department(request.department())
                .role(request.role())
                .status(UserStatus.ACTIVE)
                .build();

        return UserMapper.toSummary(userRepository.save(user));
    }

    @Transactional
    public UserSummaryResponse updateEmployee(UserPrincipal actor, Long targetId, UpdateEmployeeRequest request) {
        User target = getManageableTarget(actor, targetId);

        target.setName(request.name());
        target.setPhone(request.phone());
        target.setDesignation(request.designation());
        target.setDepartment(request.department());

        if (request.role() != null && request.role() != target.getRole()) {
            if (actor.getRole() != Role.OWNER) {
                throw new ForbiddenException("Only the Owner can change an employee's role");
            }
            assertCanAssignRole(actor, request.role());
            target.setRole(request.role());
        }

        return UserMapper.toSummary(userRepository.save(target));
    }

    @Transactional
    public UserSummaryResponse updateStatus(UserPrincipal actor, Long targetId, UpdateStatusRequest request) {
        User target = getManageableTarget(actor, targetId);
        target.setStatus(request.status());
        return UserMapper.toSummary(userRepository.save(target));
    }

    @Transactional
    public void deleteEmployee(UserPrincipal actor, Long targetId) {
        User target = getManageableTarget(actor, targetId);

        boolean hasHistory = taskRepository.existsByAssignedToIdOrCreatedById(target.getId(), target.getId())
                || commentRepository.existsByUserId(target.getId())
                || attachmentRepository.existsByUploadedById(target.getId());

        if (hasHistory) {
            throw new BadRequestException(
                    "This employee has task history and cannot be deleted. Disable the account instead.");
        }

        refreshTokenRepository.deleteByUserId(target.getId());
        passwordResetTokenRepository.deleteByUserId(target.getId());
        notificationRepository.deleteByUserId(target.getId());
        userRepository.delete(target);
    }

    @Transactional(readOnly = true)
    public PageResponse<UserSummaryResponse> search(
            UserPrincipal actor, String search, Role role, UserStatus status, String department, Pageable pageable) {

        List<Specification<User>> specs = Arrays.asList(
                UserSpecifications.companyId(actor.getCompanyId()),
                UserSpecifications.search(search),
                UserSpecifications.role(role),
                UserSpecifications.status(status),
                UserSpecifications.department(department)
        );

        Specification<User> combined = Specification.allOf(specs.stream().filter(s -> s != null).toList());

        return PageResponse.of(userRepository.findAll(combined, pageable).map(UserMapper::toSummary));
    }

    @Transactional(readOnly = true)
    public UserSummaryResponse getById(UserPrincipal actor, Long targetId) {
        User target = userRepository.findByIdAndCompanyId(targetId, actor.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        return UserMapper.toSummary(target);
    }

    private User getManageableTarget(UserPrincipal actor, Long targetId) {
        User target = userRepository.findByIdAndCompanyId(targetId, actor.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (target.getId().equals(actor.getId())) {
            throw new ForbiddenException("You cannot manage your own account through this endpoint");
        }

        if (target.getRole() == Role.OWNER) {
            throw new ForbiddenException("The Owner account cannot be managed here");
        }

        if (actor.getRole() == Role.MANAGER && target.getRole() != Role.EMPLOYEE) {
            throw new ForbiddenException("Managers can only manage Employees");
        }

        return target;
    }

    private void assertCanAssignRole(UserPrincipal actor, Role requestedRole) {
        if (requestedRole == Role.OWNER) {
            throw new ForbiddenException("Cannot create another Owner account");
        }
        if (requestedRole == Role.MANAGER && actor.getRole() != Role.OWNER) {
            throw new ForbiddenException("Only the Owner can create Managers");
        }
    }
}
