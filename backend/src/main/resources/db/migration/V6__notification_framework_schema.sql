CREATE TABLE IF NOT EXISTS notification_template (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    template_code       VARCHAR(120)    NOT NULL,
    channel             VARCHAR(30)     NOT NULL,
    locale              VARCHAR(20)     NOT NULL DEFAULT 'en_IN',
    subject_template    VARCHAR(200)    NULL,
    body_template       TEXT            NOT NULL,
    description         VARCHAR(500)    NULL,
    active              BIT(1)          NOT NULL DEFAULT b'1',
    created_at          DATETIME(6)     NOT NULL,
    updated_at          DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_notification_template_code (template_code),
    KEY idx_notification_template_channel_active (channel, active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_log (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    template_code       VARCHAR(120)    NOT NULL,
    channel             VARCHAR(30)     NOT NULL,
    recipient           VARCHAR(200)    NOT NULL,
    subject             VARCHAR(255)    NULL,
    request_payload     LONGTEXT        NULL,
    rendered_message    LONGTEXT        NOT NULL,
    status              VARCHAR(30)     NOT NULL,
    provider_name       VARCHAR(80)     NULL,
    provider_response   LONGTEXT        NULL,
    failure_reason      VARCHAR(500)    NULL,
    attempt_count       INT             NOT NULL DEFAULT 0,
    created_at          DATETIME(6)     NOT NULL,
    updated_at          DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_notification_log_template (template_code),
    KEY idx_notification_log_channel_status (channel, status),
    KEY idx_notification_log_recipient (recipient)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_queue (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    notification_log_id BIGINT          NOT NULL,
    template_code       VARCHAR(120)    NOT NULL,
    recipient           VARCHAR(200)    NOT NULL,
    subject             VARCHAR(255)    NULL,
    request_payload     LONGTEXT        NULL,
    rendered_message    LONGTEXT        NOT NULL,
    status              VARCHAR(30)     NOT NULL,
    provider_name       VARCHAR(80)     NULL,
    provider_response   LONGTEXT        NULL,
    failure_reason      VARCHAR(500)    NULL,
    attempt_count       INT             NOT NULL DEFAULT 0,
    max_attempts        INT             NOT NULL,
    next_attempt_at     DATETIME(6)     NOT NULL,
    created_at          DATETIME(6)     NOT NULL,
    updated_at          DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_email_queue_status_next (status, next_attempt_at),
    CONSTRAINT fk_email_queue_log FOREIGN KEY (notification_log_id) REFERENCES notification_log(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sms_queue (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    notification_log_id BIGINT          NOT NULL,
    template_code       VARCHAR(120)    NOT NULL,
    recipient           VARCHAR(200)    NOT NULL,
    subject             VARCHAR(255)    NULL,
    request_payload     LONGTEXT        NULL,
    rendered_message    LONGTEXT        NOT NULL,
    status              VARCHAR(30)     NOT NULL,
    provider_name       VARCHAR(80)     NULL,
    provider_response   LONGTEXT        NULL,
    failure_reason      VARCHAR(500)    NULL,
    attempt_count       INT             NOT NULL DEFAULT 0,
    max_attempts        INT             NOT NULL,
    next_attempt_at     DATETIME(6)     NOT NULL,
    created_at          DATETIME(6)     NOT NULL,
    updated_at          DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_sms_queue_status_next (status, next_attempt_at),
    CONSTRAINT fk_sms_queue_log FOREIGN KEY (notification_log_id) REFERENCES notification_log(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS whatsapp_queue (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    notification_log_id BIGINT          NOT NULL,
    template_code       VARCHAR(120)    NOT NULL,
    recipient           VARCHAR(200)    NOT NULL,
    subject             VARCHAR(255)    NULL,
    request_payload     LONGTEXT        NULL,
    rendered_message    LONGTEXT        NOT NULL,
    status              VARCHAR(30)     NOT NULL,
    provider_name       VARCHAR(80)     NULL,
    provider_response   LONGTEXT        NULL,
    failure_reason      VARCHAR(500)    NULL,
    attempt_count       INT             NOT NULL DEFAULT 0,
    max_attempts        INT             NOT NULL,
    next_attempt_at     DATETIME(6)     NOT NULL,
    created_at          DATETIME(6)     NOT NULL,
    updated_at          DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_whatsapp_queue_status_next (status, next_attempt_at),
    CONSTRAINT fk_whatsapp_queue_log FOREIGN KEY (notification_log_id) REFERENCES notification_log(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO notification_template (template_code, channel, locale, subject_template, body_template, description, active, created_at, updated_at)
VALUES
('LOGIN_OTP_SMS', 'SMS', 'en_IN', NULL, 'Hello {{CustomerName}}, your Appa & Amma\'s Pickles OTP is {{OTP}}. It expires in {{ExpiryMinutes}} minutes.', 'Customer login OTP over SMS', b'1', NOW(6), NOW(6)),
('LOGIN_OTP_WHATSAPP', 'WHATSAPP', 'en_IN', NULL, 'Hello {{CustomerName}}, your login OTP is {{OTP}}. It expires in {{ExpiryMinutes}} minutes.', 'Customer login OTP over WhatsApp', b'1', NOW(6), NOW(6)),
('LOGIN_OTP_EMAIL', 'EMAIL', 'en_IN', 'Your login OTP', 'Hello {{CustomerName}}, your Appa & Amma\'s Pickles login OTP is {{OTP}}. It expires in {{ExpiryMinutes}} minutes.', 'Customer login OTP over email', b'1', NOW(6), NOW(6)),
('USER_REGISTERED_EMAIL', 'EMAIL', 'en_IN', 'Welcome to Appa & Amma\'s Pickles', 'Hello {{CustomerName}}, welcome to Appa & Amma\'s Pickles.', 'Customer welcome email', b'1', NOW(6), NOW(6)),
('ORDER_PLACED_WHATSAPP', 'WHATSAPP', 'en_IN', NULL, 'Hello {{CustomerName}}, your order {{OrderId}} for {{Items}} worth {{Amount}} has been placed successfully.', 'Order placed notification over WhatsApp', b'1', NOW(6), NOW(6)),
('ORDER_PLACED_EMAIL', 'EMAIL', 'en_IN', 'Order {{OrderId}} placed successfully', 'Hello {{CustomerName}}, your order {{OrderId}} for {{Items}} worth {{Amount}} has been placed successfully.', 'Order placed notification email', b'1', NOW(6), NOW(6)),
('PAYMENT_SUCCESS_WHATSAPP', 'WHATSAPP', 'en_IN', NULL, 'Payment received for order {{OrderId}}. Amount: {{Amount}}.', 'Payment success over WhatsApp', b'1', NOW(6), NOW(6)),
('ORDER_PACKED_WHATSAPP', 'WHATSAPP', 'en_IN', NULL, 'Good news {{CustomerName}}. Your order {{OrderId}} has been packed and is ready for dispatch.', 'Order packed notification', b'1', NOW(6), NOW(6)),
('ORDER_SHIPPED_WHATSAPP', 'WHATSAPP', 'en_IN', NULL, 'Your order {{OrderId}} has been shipped. Tracking number: {{TrackingNumber}}. Track here: {{TrackingUrl}}', 'Order shipped notification', b'1', NOW(6), NOW(6)),
('OUT_FOR_DELIVERY_WHATSAPP', 'WHATSAPP', 'en_IN', NULL, 'Your order {{OrderId}} is out for delivery today.', 'Out-for-delivery notification', b'1', NOW(6), NOW(6)),
('ORDER_DELIVERED_WHATSAPP', 'WHATSAPP', 'en_IN', NULL, 'Your order {{OrderId}} has been delivered. Enjoy your pickles.', 'Delivered notification over WhatsApp', b'1', NOW(6), NOW(6)),
('ORDER_DELIVERED_EMAIL', 'EMAIL', 'en_IN', 'Order {{OrderId}} delivered', 'Hello {{CustomerName}}, your order {{OrderId}} has been delivered. We hope you enjoy it.', 'Delivered notification email', b'1', NOW(6), NOW(6)),
('REVIEW_REQUEST_WHATSAPP', 'WHATSAPP', 'en_IN', NULL, 'Hello {{CustomerName}}, please share your feedback for order {{OrderId}} here: {{ReviewLink}}', 'Review request over WhatsApp', b'1', NOW(6), NOW(6)),
('ORDER_CANCELLED', 'EMAIL', 'en_IN', 'Order {{OrderId}} cancelled', 'Hello {{CustomerName}}, your order {{OrderId}} has been cancelled. If you have questions, please contact support.', 'Order cancelled notification', b'1', NOW(6), NOW(6)),
('PAYMENT_FAILED', 'EMAIL', 'en_IN', 'Payment failed for order {{OrderId}}', 'Hello {{CustomerName}}, payment for order {{OrderId}} could not be completed. Please retry.', 'Payment failed notification', b'1', NOW(6), NOW(6)),
('PASSWORD_RESET_OTP', 'EMAIL', 'en_IN', 'Password reset OTP', 'Hello {{CustomerName}}, your password reset OTP is {{OTP}}. It expires in {{ExpiryMinutes}} minutes.', 'Password reset OTP email', b'1', NOW(6), NOW(6))
ON DUPLICATE KEY UPDATE
    channel = VALUES(channel),
    locale = VALUES(locale),
    subject_template = VALUES(subject_template),
    body_template = VALUES(body_template),
    description = VALUES(description),
    active = VALUES(active),
    updated_at = NOW(6);