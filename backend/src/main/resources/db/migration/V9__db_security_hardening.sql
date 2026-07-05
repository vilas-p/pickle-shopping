UPDATE customers
SET phone = CONCAT('99', LPAD(id, 8, '0'))
WHERE phone = '0000000000';

ALTER TABLE customers
    ADD CONSTRAINT uk_customers_phone UNIQUE (phone);

CREATE INDEX idx_otp_identifier_purpose_latest
    ON otp_tokens (identifier, purpose, consumed_at, expires_at, id);