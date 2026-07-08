-- Companies (tenants). Each Owner registration creates one company.
CREATE TABLE companies (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    task_counter  INT NOT NULL DEFAULT 0,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users: Owner, Manager, or Employee, scoped to a company.
CREATE TABLE users (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id     BIGINT NOT NULL,
    name           VARCHAR(150) NOT NULL,
    email          VARCHAR(190) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    phone          VARCHAR(30),
    designation    VARCHAR(100),
    department     VARCHAR(100),
    role           VARCHAR(20) NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT chk_users_role CHECK (role IN ('OWNER', 'MANAGER', 'EMPLOYEE')),
    CONSTRAINT chk_users_status CHECK (status IN ('ACTIVE', 'DISABLED'))
);

CREATE INDEX idx_users_company_id ON users (company_id);
CREATE INDEX idx_users_status ON users (status);

-- Refresh tokens for JWT refresh-token rotation.
CREATE TABLE refresh_tokens (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    token_hash  VARCHAR(255) NOT NULL,
    expires_at  DATETIME NOT NULL,
    revoked_at  DATETIME,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_refresh_tokens_token_hash UNIQUE (token_hash),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);

-- Password reset tokens for the "Forgot Password" flow.
CREATE TABLE password_reset_tokens (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    token_hash  VARCHAR(255) NOT NULL,
    expires_at  DATETIME NOT NULL,
    used_at     DATETIME,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_password_reset_tokens_token_hash UNIQUE (token_hash),
    CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens (user_id);

-- Tasks.
CREATE TABLE tasks (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id   BIGINT NOT NULL,
    task_code    VARCHAR(30) NOT NULL,
    title        VARCHAR(200) NOT NULL,
    description  TEXT,
    priority     VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status       VARCHAR(20) NOT NULL DEFAULT 'TODO',
    due_date     DATE,
    assigned_to  BIGINT,
    created_by   BIGINT NOT NULL,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_tasks_company_task_code UNIQUE (company_id, task_code),
    CONSTRAINT fk_tasks_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_tasks_assigned_to FOREIGN KEY (assigned_to) REFERENCES users (id),
    CONSTRAINT fk_tasks_created_by FOREIGN KEY (created_by) REFERENCES users (id),
    CONSTRAINT chk_tasks_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_tasks_status CHECK (status IN ('TODO', 'IN_PROGRESS', 'TESTING', 'COMPLETED', 'BLOCKED'))
);

CREATE INDEX idx_tasks_company_id ON tasks (company_id);
CREATE INDEX idx_tasks_assigned_to ON tasks (assigned_to);
CREATE INDEX idx_tasks_status ON tasks (status);
CREATE INDEX idx_tasks_due_date ON tasks (due_date);

-- Comments on a task.
CREATE TABLE comments (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id     BIGINT NOT NULL,
    user_id     BIGINT NOT NULL,
    content     TEXT NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comments_task FOREIGN KEY (task_id) REFERENCES tasks (id),
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_comments_task_id ON comments (task_id);

-- Attachments on a task, optionally scoped to one comment on that task.
CREATE TABLE attachments (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id       BIGINT NOT NULL,
    comment_id    BIGINT,
    uploaded_by   BIGINT NOT NULL,
    file_name     VARCHAR(255) NOT NULL,
    stored_path   VARCHAR(500) NOT NULL,
    file_size     BIGINT NOT NULL,
    content_type  VARCHAR(100) NOT NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attachments_task FOREIGN KEY (task_id) REFERENCES tasks (id),
    CONSTRAINT fk_attachments_comment FOREIGN KEY (comment_id) REFERENCES comments (id),
    CONSTRAINT fk_attachments_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users (id)
);

CREATE INDEX idx_attachments_task_id ON attachments (task_id);
CREATE INDEX idx_attachments_comment_id ON attachments (comment_id);

-- Notifications: bell feed, polled by the frontend.
CREATE TABLE notifications (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id        BIGINT NOT NULL,
    user_id           BIGINT NOT NULL,
    type              VARCHAR(30) NOT NULL,
    message           VARCHAR(500) NOT NULL,
    related_task_id   BIGINT,
    is_read           BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_notifications_task FOREIGN KEY (related_task_id) REFERENCES tasks (id),
    CONSTRAINT chk_notifications_type CHECK (type IN ('TASK_ASSIGNED', 'TASK_UPDATED', 'TASK_COMPLETED', 'COMMENT_ADDED'))
);

CREATE INDEX idx_notifications_user_id ON notifications (user_id, is_read);
