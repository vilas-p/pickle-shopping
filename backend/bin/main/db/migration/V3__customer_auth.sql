-- V3: Customer OTP authentication
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS otp_tokens (
    id                BIGINT          NOT NULL AUTO_INCREMENT,
    identifier        VARCHAR(150)    NOT NULL,
    identifier_kind   VARCHAR(20)     NOT NULL,
    purpose           VARCHAR(30)     NOT NULL,
    code_hash         VARCHAR(255)    NOT NULL,
    attempts          INT             NOT NULL DEFAULT 0,
    max_attempts      INT             NOT NULL DEFAULT 5,
    expires_at        DATETIME(6)     NOT NULL,
    consumed_at       DATETIME(6)     NULL,
    ip_address        VARCHAR(64)     NULL,
    user_agent        VARCHAR(500)    NULL,
    created_at        DATETIME(6)     NOT NULL,
    updated_at        DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_otp_identifier (identifier),
    KEY idx_otp_purpose (purpose),
    KEY idx_otp_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
