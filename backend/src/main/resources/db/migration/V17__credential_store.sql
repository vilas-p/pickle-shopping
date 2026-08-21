-- Credential provider groups (e.g. RAZORPAY, TEST-RAZORPAY, S3, SHIPROCKET)
CREATE TABLE credential_providers (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    code       VARCHAR(100) NOT NULL,
    category   VARCHAR(50)  NOT NULL COMMENT 'Logical category: PAYMENT, STORAGE, SHIPPING, NOTIFICATION, etc.',
    label      VARCHAR(200) NULL     COMMENT 'Human-friendly label',
    active     BOOLEAN      NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id),
    UNIQUE KEY uk_credential_providers_code (code),
    KEY uk_credential_providers_code_category (code, category),
    KEY idx_credential_providers_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Key-value entries for each credential provider
CREATE TABLE credential_entries (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    provider_id BIGINT       NOT NULL,
    entry_key   VARCHAR(100) NOT NULL,
    entry_value TEXT         NULL,
    encrypted   BOOLEAN      NOT NULL DEFAULT FALSE COMMENT 'Whether value is stored encrypted',
    PRIMARY KEY (id),
    UNIQUE KEY uk_credential_entries_provider_key (provider_id, entry_key),
    CONSTRAINT fk_credential_entries_provider FOREIGN KEY (provider_id) REFERENCES credential_providers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

