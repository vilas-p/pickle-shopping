ALTER TABLE reviews
    ADD COLUMN customer_id BIGINT NULL AFTER product_id;

ALTER TABLE reviews
    ADD KEY idx_reviews_customer (customer_id);

ALTER TABLE reviews
    ADD CONSTRAINT fk_reviews_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

ALTER TABLE reviews
    ADD CONSTRAINT uk_reviews_customer_product UNIQUE (customer_id, product_id);