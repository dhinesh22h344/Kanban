# ER Diagram

```mermaid
erDiagram
    COMPANIES ||--o{ USERS : employs
    COMPANIES ||--o{ TASKS : owns
    COMPANIES ||--o{ NOTIFICATIONS : scopes

    USERS ||--o{ REFRESH_TOKENS : has
    USERS ||--o{ PASSWORD_RESET_TOKENS : requests
    USERS ||--o{ TASKS : "assigned_to"
    USERS ||--o{ TASKS : "created_by"
    USERS ||--o{ COMMENTS : writes
    USERS ||--o{ ATTACHMENTS : uploads
    USERS ||--o{ NOTIFICATIONS : receives

    TASKS ||--o{ COMMENTS : has
    TASKS ||--o{ ATTACHMENTS : has
    TASKS ||--o{ NOTIFICATIONS : "related_task"
    COMMENTS ||--o{ ATTACHMENTS : has

    COMPANIES {
        bigint id PK
        varchar name
        int task_counter
        datetime created_at
        datetime updated_at
    }

    USERS {
        bigint id PK
        bigint company_id FK
        varchar name
        varchar email UK
        varchar password_hash
        varchar phone
        varchar designation
        varchar department
        varchar role "OWNER, MANAGER, EMPLOYEE"
        varchar status "ACTIVE, DISABLED"
        datetime created_at
        datetime updated_at
    }

    REFRESH_TOKENS {
        bigint id PK
        bigint user_id FK
        varchar token_hash UK
        datetime expires_at
        datetime revoked_at
        datetime created_at
    }

    PASSWORD_RESET_TOKENS {
        bigint id PK
        bigint user_id FK
        varchar token_hash UK
        datetime expires_at
        datetime used_at
        datetime created_at
    }

    TASKS {
        bigint id PK
        bigint company_id FK
        varchar task_code UK "per company, e.g. TASK-1001"
        varchar title
        text description
        varchar priority "LOW, MEDIUM, HIGH, CRITICAL"
        varchar status "TODO, IN_PROGRESS, TESTING, COMPLETED, BLOCKED"
        date due_date
        bigint assigned_to FK
        bigint created_by FK
        datetime created_at
        datetime updated_at
    }

    COMMENTS {
        bigint id PK
        bigint task_id FK
        bigint user_id FK
        text content
        datetime created_at
    }

    ATTACHMENTS {
        bigint id PK
        bigint task_id FK
        bigint comment_id FK "nullable"
        bigint uploaded_by FK
        varchar file_name
        varchar stored_path
        bigint file_size
        varchar content_type
        datetime created_at
    }

    NOTIFICATIONS {
        bigint id PK
        bigint company_id FK
        bigint user_id FK "recipient"
        varchar type "TASK_ASSIGNED, TASK_UPDATED, TASK_COMPLETED, COMMENT_ADDED"
        varchar message
        bigint related_task_id FK "nullable"
        boolean is_read
        datetime created_at
    }
```

## Notes

- **Multi-tenancy**: every row that matters for isolation (`users`, `tasks`, `notifications`) carries `company_id`. `comments` and `attachments` inherit tenancy transitively through `task_id`.
- **Roles**: kept as a `role` enum column on `users` rather than a separate roles/permissions table — the 3 roles (OWNER, MANAGER, EMPLOYEE) are fixed and this keeps the schema simple, matching the "not a full Jira clone" brief.
- **Task codes**: human-readable IDs (`TASK-1001`) are unique *per company*, generated from a `task_counter` column on `companies` that's incremented transactionally when a task is created (application-level, built in Module 3).
- **Attachments**: can belong to a task directly, or to a specific comment on a task (`comment_id` nullable) — covers "Add Attachments" on both tasks and comments.
