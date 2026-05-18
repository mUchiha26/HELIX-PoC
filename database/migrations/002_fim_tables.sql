CREATE TABLE IF NOT EXISTS fim_baselines (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    target_path  VARCHAR(512) NOT NULL,
    baseline_data TEXT NOT NULL,
    file_count   INT NOT NULL,
    created_by   INT NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fim_scan_results (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    baseline_id INT NOT NULL,
    file_path   VARCHAR(512) NOT NULL,
    sha256      VARCHAR(64),
    file_size   BIGINT,
    status      ENUM('added','modified','deleted','unchanged') NOT NULL,
    scanned_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (baseline_id) REFERENCES fim_baselines(id) ON DELETE CASCADE
);
