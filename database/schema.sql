-- F-09: Added user_notes, user_progress, articles tables for learner and KB domains
CREATE DATABASE IF NOT EXISTS helixdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE helixdb;

CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  UNIQUE NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('administrator','blue_team','red_team','purple_team','learner') NOT NULL,
    is_active     BOOLEAN      DEFAULT TRUE,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    last_login    TIMESTAMP    NULL
);

CREATE TABLE log_entries (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    filename    VARCHAR(255),
    source_ip   VARCHAR(45),
    timestamp   TIMESTAMP    NOT NULL,
    severity    ENUM('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'LOW',
    event_type  VARCHAR(100),
    message     TEXT         NOT NULL,
    raw_line    TEXT,
    ingested_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    ingested_by INT          NULL,
    FOREIGN KEY (ingested_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE anomaly_scores (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    log_entry_id  INT   NOT NULL,
    score         FLOAT NOT NULL,
    severity_label ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL,
    computed_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (log_entry_id) REFERENCES log_entries(id) ON DELETE CASCADE
);

CREATE TABLE alerts (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    log_entry_id     INT  NULL,
    anomaly_score_id INT  NULL,
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    severity         ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL,
    status           ENUM('open','investigating','resolved') DEFAULT 'open',
    assigned_to      INT  NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (log_entry_id)     REFERENCES log_entries(id)    ON DELETE SET NULL,
    FOREIGN KEY (anomaly_score_id) REFERENCES anomaly_scores(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to)      REFERENCES users(id)          ON DELETE SET NULL
);

CREATE TABLE chat_sessions (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT  NOT NULL,
    alert_id     INT  NULL,
    message_role ENUM('user','assistant') NOT NULL,
    content      TEXT NOT NULL,
    sent_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE SET NULL
);

CREATE TABLE scan_results (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    performed_by INT NOT NULL,
    target       VARCHAR(255) NOT NULL,
    port         INT NOT NULL,
    protocol     VARCHAR(10),
    status       ENUM('open','closed','filtered') NOT NULL,
    scanned_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- Learner domain tables (UC-27, UC-28, UC-29)
CREATE TABLE IF NOT EXISTS user_notes (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    content    TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_progress (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    module_name VARCHAR(100) NOT NULL,
    score       FLOAT DEFAULT 0,
    completed   BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Knowledge base tables (UC-21, UC-22, UC-23, UC-26)
CREATE TABLE IF NOT EXISTS articles (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    author_id   INT NOT NULL,
    title       VARCHAR(255) NOT NULL,
    content     TEXT NOT NULL,
    status      ENUM('draft','pending','published','archived') DEFAULT 'draft',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);
