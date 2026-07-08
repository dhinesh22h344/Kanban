package com.kanban.taskmanager.repository;

import com.kanban.taskmanager.entity.Task;
import com.kanban.taskmanager.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

    Optional<Task> findByIdAndCompanyId(Long id, Long companyId);

    long countByCompanyIdAndStatus(Long companyId, TaskStatus status);

    long countByCompanyIdAndStatusNotAndDueDateBefore(Long companyId, TaskStatus status, LocalDate date);

    long countByCompanyIdAndAssignedToIdAndStatus(Long companyId, Long assignedToId, TaskStatus status);

    long countByCompanyIdAndAssignedToIdAndStatusNotAndDueDateBefore(
            Long companyId, Long assignedToId, TaskStatus status, LocalDate date);

    long countByCompanyId(Long companyId);

    long countByCompanyIdAndAssignedToId(Long companyId, Long assignedToId);

    List<Task> findByCompanyIdAndAssignedToIdAndDueDate(Long companyId, Long assignedToId, LocalDate dueDate);

    List<Task> findTop10ByCompanyIdOrderByUpdatedAtDesc(Long companyId);

    List<Task> findTop10ByCompanyIdAndAssignedToIdOrderByUpdatedAtDesc(Long companyId, Long assignedToId);

    boolean existsByAssignedToIdOrCreatedById(Long assignedToId, Long createdById);
}
