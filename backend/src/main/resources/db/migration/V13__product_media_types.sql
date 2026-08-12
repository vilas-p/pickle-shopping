ALTER TABLE product_images
    ADD COLUMN media_type VARCHAR(16) NOT NULL DEFAULT 'IMAGE' AFTER `primary`;