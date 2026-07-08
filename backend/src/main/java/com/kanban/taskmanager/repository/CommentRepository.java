package com.kanban.taskmanager.repository;

import com.kanban.taskmanager.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByTaskIdOrderByCreatedAtAsc(Long taskId);

    boolean existsByUserId(Long userId);

    @org.springframework.data.jpa.repository.Modifying
    void deleteByTaskId(Long taskId);

    @Query("select c.task.id as taskId, count(c) as count from Comment c where c.task.id in :taskIds group by c.task.id")
    List<TaskIdCount> countGroupedByTaskIds(@Param("taskIds") List<Long> taskIds);
}
