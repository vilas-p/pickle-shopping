-- =============================================================================
-- V5: Payments table + order payment tracking columns
-- =============================================================================

-- Add payment method and Razorpay tracking columns to orders
ALTER TABLE orders
    ADD COLUMN payment_method       VARCHAR(30)     NULL AFTER channel,
    ADD COLUMN razorpay_order_id    VARCHAR(64)     NULL AFTER payment_method;

ALTER TABLE orders
    ADD UNIQUE INDEX uq_orders_razorpay_order_id (razorpay_order_id);

-- Payments table: tracks each payment attempt / capture
CREATE TABLE IF NOT EXISTS payments (
    id                      BIGINT          NOT NULL AUTO_INCREMENT,
    order_id                BIGINT          NOT NULL,
    razorpay_order_id       VARCHAR(64)     NOT NULL,
    razorpay_payment_id     VARCHAR(64)     NULL,
    razorpay_signature      VARCHAR(256)    NULL,
    amount                  DECIMAL(10, 2)  NOT NULL,
    currency                VARCHAR(10)     NOT NULL DEFAULT 'INR',
    status                  VARCHAR(30)     NOT NULL,
    created_at              DATETIME(6)     NOT NULL,
    updated_at              DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_payments_order (order_id),
    KEY idx_payments_rp_order (razorpay_order_id),
    KEY idx_payments_status (status),
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default existing orders to COD
UPDATE orders SET payment_method = 'COD' WHERE payment_method IS NULL;
