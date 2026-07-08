package com.kanban.taskmanager.repository;

/** Projection for "count of X grouped by task id" queries (comments, attachments). */
public interface TaskIdCount {
    Long getTaskId();

    Long getCount();
}
