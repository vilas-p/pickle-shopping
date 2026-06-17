-- V1: Initial schema for Appa & Amma's Pickles
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;

-- ===== Roles & Users =====
CREATE TABLE IF NOT EXISTS roles (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    name            VARCHAR(50)     NOT NULL UNIQUE,
    created_at      DATETIME(6)     NOT NULL,
    updated_at      DATETIME(6)     NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    full_name       VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    phone           VARCHAR(20)     NULL,
    enabled         BIT(1)          NOT NULL DEFAULT b'1',
    created_at      DATETIME(6)     NOT NULL,
    updated_at      DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== Categories & Products =====
CREATE TABLE IF NOT EXISTS categories (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    name            VARCHAR(100)    NOT NULL UNIQUE,
    slug            VARCHAR(120)    NOT NULL UNIQUE,
    description     VARCHAR(500)    NULL,
    active          BIT(1)          NOT NULL DEFAULT b'1',
    created_at      DATETIME(6)     NOT NULL,
    updated_at      DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    name                VARCHAR(150)    NOT NULL,
    slug                VARCHAR(180)    NOT NULL UNIQUE,
    short_description   TEXT            NOT NULL,
    description         TEXT            NULL,
    ingredients         TEXT            NULL,
    shelf_life          VARCHAR(100)    NULL,
    price               DECIMAL(10, 2)  NOT NULL,
    compare_at_price    DECIMAL(10, 2)  NULL,
    weight              VARCHAR(50)     NOT NULL,
    category_id         BIGINT          NOT NULL,
    active              BIT(1)          NOT NULL DEFAULT b'1',
    featured            BIT(1)          NOT NULL DEFAULT b'0',
    created_at          DATETIME(6)     NOT NULL,
    updated_at          DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_products_slug (slug),
    KEY idx_products_category (category_id),
    KEY idx_products_active_featured (active, featured),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_images (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    product_id      BIGINT          NOT NULL,
    url             VARCHAR(500)    NOT NULL,
    alt_text        VARCHAR(200)    NULL,
    display_order   INT             NOT NULL DEFAULT 0,
    `primary`       BIT(1)          NOT NULL DEFAULT b'0',
    created_at      DATETIME(6)     NOT NULL,
    updated_at      DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_pimg_product (product_id),
    CONSTRAINT fk_pimg_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== Customers & Addresses =====
CREATE TABLE IF NOT EXISTS customers (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    full_name       VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    phone           VARCHAR(20)     NOT NULL,
    created_at      DATETIME(6)     NOT NULL,
    updated_at      DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_customers_email (email),
    KEY idx_customers_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS addresses (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    customer_id     BIGINT          NOT NULL,
    line1           VARCHAR(200)    NOT NULL,
    line2           VARCHAR(200)    NULL,
    city            VARCHAR(100)    NOT NULL,
    state           VARCHAR(100)    NOT NULL,
    pincode         VARCHAR(10)     NOT NULL,
    country         VARCHAR(100)    NOT NULL DEFAULT 'India',
    landmark        VARCHAR(500)    NULL,
    default_address BIT(1)          NOT NULL DEFAULT b'0',
    created_at      DATETIME(6)     NOT NULL,
    updated_at      DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_addresses_customer (customer_id),
    CONSTRAINT fk_addresses_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== Orders =====
CREATE TABLE IF NOT EXISTS orders (
    id                      BIGINT          NOT NULL AUTO_INCREMENT,
    order_number            VARCHAR(30)     NOT NULL UNIQUE,
    customer_id             BIGINT          NOT NULL,
    shipping_address_id     BIGINT          NULL,
    status                  VARCHAR(30)     NOT NULL,
    channel                 VARCHAR(30)     NOT NULL,
    subtotal                DECIMAL(10, 2)  NOT NULL,
    shipping_fee            DECIMAL(10, 2)  NOT NULL DEFAULT 0,
    total                   DECIMAL(10, 2)  NOT NULL,
    notes                   TEXT            NULL,
    created_at              DATETIME(6)     NOT NULL,
    updated_at              DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_orders_status (status),
    KEY idx_orders_customer (customer_id),
    KEY idx_orders_created (created_at),
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_orders_address FOREIGN KEY (shipping_address_id) REFERENCES addresses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    order_id        BIGINT          NOT NULL,
    product_id      BIGINT          NOT NULL,
    product_name    VARCHAR(150)    NOT NULL,
    product_weight  VARCHAR(50)     NOT NULL,
    quantity        INT             NOT NULL,
    unit_price      DECIMAL(10, 2)  NOT NULL,
    line_total      DECIMAL(10, 2)  NOT NULL,
    created_at      DATETIME(6)     NOT NULL,
    updated_at      DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_oi_order (order_id),
    KEY idx_oi_product (product_id),
    CONSTRAINT fk_oi_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_oi_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== Reviews =====
CREATE TABLE IF NOT EXISTS reviews (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    product_id      BIGINT          NULL,
    author_name     VARCHAR(100)    NOT NULL,
    author_city     VARCHAR(100)    NULL,
    rating          INT             NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    body            TEXT            NOT NULL,
    approved        BIT(1)          NOT NULL DEFAULT b'0',
    created_at      DATETIME(6)     NOT NULL,
    updated_at      DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_reviews_product_approved (product_id, approved),
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== Contacts =====
CREATE TABLE IF NOT EXISTS contacts (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    full_name       VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL,
    phone           VARCHAR(20)     NULL,
    subject         VARCHAR(200)    NOT NULL,
    message         TEXT            NOT NULL,
    handled         BIT(1)          NOT NULL DEFAULT b'0',
    created_at      DATETIME(6)     NOT NULL,
    updated_at      DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_contacts_handled (handled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== Inventory =====
CREATE TABLE IF NOT EXISTS inventory (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    product_id          BIGINT          NOT NULL UNIQUE,
    quantity_available  INT             NOT NULL DEFAULT 0,
    reorder_level       INT             NOT NULL DEFAULT 10,
    batch_code          VARCHAR(100)    NULL,
    created_at          DATETIME(6)     NOT NULL,
    updated_at          DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== Audit Logs =====
CREATE TABLE IF NOT EXISTS audit_logs (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    actor           VARCHAR(100)    NOT NULL,
    action          VARCHAR(50)     NOT NULL,
    entity_type     VARCHAR(100)    NOT NULL,
    entity_id       VARCHAR(100)    NULL,
    details         TEXT            NULL,
    created_at      DATETIME(6)     NOT NULL,
    updated_at      DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    KEY idx_audit_entity (entity_type, entity_id),
    KEY idx_audit_actor (actor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
