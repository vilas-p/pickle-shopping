-- V4: Product variants (weight-based pricing) + link inventory and order_items to variants

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;

-- ===== Product variants =====
CREATE TABLE IF NOT EXISTS product_variants (
    id                BIGINT          NOT NULL AUTO_INCREMENT,
    product_id        BIGINT          NOT NULL,
    weight            VARCHAR(50)     NOT NULL,
    sku               VARCHAR(80)     NULL UNIQUE,
    price             DECIMAL(10, 2)  NOT NULL,
    compare_at_price  DECIMAL(10, 2)  NULL,
    display_order     INT             NOT NULL DEFAULT 0,
    active            BIT(1)          NOT NULL DEFAULT b'1',
    created_at        DATETIME(6)     NOT NULL,
    updated_at        DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_pv_product (product_id),
    CONSTRAINT fk_pv_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== Extend inventory with optional variant FK =====
ALTER TABLE inventory
    ADD COLUMN variant_id BIGINT NULL AFTER product_id,
    ADD CONSTRAINT fk_inventory_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE;

-- Re-add a unique covering both (product_id, variant_id) — NULL variant_id still supported
ALTER TABLE inventory
    ADD UNIQUE KEY uq_inventory_product_variant (product_id, variant_id);

-- ===== Extend order_items with optional variant FK =====
ALTER TABLE order_items
    ADD COLUMN variant_id BIGINT NULL AFTER product_id,
    ADD CONSTRAINT fk_oi_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id);

-- ===== Seed: create variants for existing products using their current price/weight =====
INSERT INTO product_variants (product_id, weight, sku, price, compare_at_price, display_order, active, created_at, updated_at)
SELECT id, weight, CONCAT(slug, '-', LOWER(REPLACE(weight, ' ', ''))), price, compare_at_price, 0, b'1', NOW(6), NOW(6)
FROM products;

-- Also add a 250g variant at ~60 % of the 500g price, and a 1kg at ~180 %
INSERT INTO product_variants (product_id, weight, sku, price, compare_at_price, display_order, active, created_at, updated_at)
SELECT id, '250g',
       CONCAT(slug, '-250g'),
       ROUND(price * 0.60, 2),
       CASE WHEN compare_at_price IS NOT NULL THEN ROUND(compare_at_price * 0.60, 2) ELSE NULL END,
       -1, b'1', NOW(6), NOW(6)
FROM products;

INSERT INTO product_variants (product_id, weight, sku, price, compare_at_price, display_order, active, created_at, updated_at)
SELECT id, '1kg',
       CONCAT(slug, '-1kg'),
       ROUND(price * 1.80, 2),
       CASE WHEN compare_at_price IS NOT NULL THEN ROUND(compare_at_price * 1.80, 2) ELSE NULL END,
       1, b'1', NOW(6), NOW(6)
FROM products;

-- Migrate existing inventory rows to point at the original-weight variant
UPDATE inventory i
    JOIN product_variants pv ON pv.product_id = i.product_id AND pv.display_order = 0
SET i.variant_id = pv.id;

