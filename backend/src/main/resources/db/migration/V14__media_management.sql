-- Media management table for banners, hero images, about page images, and general site assets.
CREATE TABLE media (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_filename VARCHAR(255)  NOT NULL,
    s3_key            VARCHAR(500)  NOT NULL,
    url               VARCHAR(500)  NOT NULL,
    content_type      VARCHAR(100)  NOT NULL,
    media_type        VARCHAR(16)   NOT NULL DEFAULT 'IMAGE',
    file_size         BIGINT        NOT NULL,
    category          VARCHAR(50)   NOT NULL,
    product_id        BIGINT        NULL,
    alt_text          VARCHAR(200),
    display_order     INT           NOT NULL DEFAULT 0,
    is_active         TINYINT(1)    NOT NULL DEFAULT 1,
    uploaded_by       BIGINT        NULL,
    created_at        DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at        DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

    UNIQUE KEY uk_media_s3_key (s3_key),
    INDEX idx_media_category_active (category, is_active),
    INDEX idx_media_product (product_id),
    CONSTRAINT fk_media_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add s3_key column to product_images for S3 object tracking (enables deletion).
ALTER TABLE product_images
    ADD COLUMN s3_key VARCHAR(500) NULL AFTER url;
