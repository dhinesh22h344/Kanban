package com.kanban.taskmanager.repository;

import com.kanban.taskmanager.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    List<Attachment> findByTaskIdOrderByCreatedAtAsc(Long taskId);

    boolean existsByUploadedById(Long uploadedById);

    @org.springframework.data.jpa.repository.Modifying
    void deleteByTaskId(Long taskId);

    @Query("select a.task.id as taskId, count(a) as count from Attachment a where a.task.id in :taskIds group by a.task.id")
    List<TaskIdCount> countGroupedByTaskIds(@Param("taskIds") List<Long> taskIds);
}
