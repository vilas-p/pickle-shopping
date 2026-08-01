-- ============================================================
-- V11: Shiprocket Shipping Integration
-- ============================================================

-- 1. New table: shipments
CREATE TABLE shipments (
    id                      BIGINT          NOT NULL AUTO_INCREMENT,
    order_id                BIGINT          NOT NULL,
    shiprocket_order_id     BIGINT          NULL,
    shiprocket_shipment_id  BIGINT          NULL,
    awb_number              VARCHAR(50)     NULL,
    courier_name            VARCHAR(100)    NULL,
    courier_id              INT             NULL,
    status                  VARCHAR(50)     NOT NULL DEFAULT 'CREATED',
    pickup_scheduled_date   DATE            NULL,
    pickup_token            VARCHAR(100)    NULL,
    label_url               VARCHAR(500)    NULL,
    manifest_url            VARCHAR(500)    NULL,
    invoice_url             VARCHAR(500)    NULL,
    estimated_delivery_date DATE            NULL,
    actual_delivery_date    DATETIME(6)     NULL,
    shipping_charge         DECIMAL(10,2)   NULL,
    weight                  DECIMAL(6,3)    NULL,
    length                  DECIMAL(6,2)    NULL,
    breadth                 DECIMAL(6,2)    NULL,
    height                  DECIMAL(6,2)    NULL,
    channel_order_id        VARCHAR(50)     NULL,
    cancellation_reason     VARCHAR(500)    NULL,
    created_at              DATETIME(6)     NOT NULL,
    updated_at              DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_shipments_order (order_id),
    KEY idx_shipments_awb (awb_number),
    KEY idx_shipments_status (status),
    KEY idx_shipments_sr_order (shiprocket_order_id),
    CONSTRAINT fk_shipments_order FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. New table: shipment_events
CREATE TABLE shipment_events (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    shipment_id         BIGINT          NOT NULL,
    status              VARCHAR(50)     NOT NULL,
    status_code         INT             NULL,
    description         VARCHAR(500)    NULL,
    location            VARCHAR(200)    NULL,
    event_time          DATETIME(6)     NOT NULL,
    shiprocket_status   VARCHAR(100)    NULL,
    raw_payload         JSON            NULL,
    created_at          DATETIME(6)     NOT NULL,
    updated_at          DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_se_shipment (shipment_id),
    KEY idx_se_event_time (event_time),
    CONSTRAINT fk_se_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. New table: shiprocket_tokens
CREATE TABLE shiprocket_tokens (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    token           TEXT            NOT NULL,
    expires_at      DATETIME(6)     NOT NULL,
    created_at      DATETIME(6)     NOT NULL,
    updated_at      DATETIME(6)     NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Add shipping columns to orders table
ALTER TABLE orders
    ADD COLUMN tracking_number VARCHAR(50) NULL AFTER notes,
    ADD COLUMN courier_name VARCHAR(100) NULL AFTER tracking_number,
    ADD COLUMN estimated_delivery_date DATE NULL AFTER courier_name,
    ADD COLUMN shipped_at DATETIME(6) NULL AFTER estimated_delivery_date,
    ADD COLUMN delivered_at DATETIME(6) NULL AFTER shipped_at;
