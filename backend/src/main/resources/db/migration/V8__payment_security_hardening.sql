ALTER TABLE payment_attempts
    ADD COLUMN razorpay_payment_id VARCHAR(64) NULL AFTER order_number,
    ADD COLUMN gateway_status VARCHAR(30) NULL AFTER status,
    ADD COLUMN failure_reason VARCHAR(255) NULL AFTER gateway_status,
    ADD CONSTRAINT uk_payment_attempts_razorpay_payment UNIQUE (razorpay_payment_id);

ALTER TABLE payments
    ADD COLUMN gateway_status VARCHAR(30) NULL AFTER currency,
    ADD CONSTRAINT uk_payments_razorpay_payment_id UNIQUE (razorpay_payment_id);