CREATE TABLE products (
    id VARCHAR(64) PRIMARY KEY,
    handle VARCHAR(160) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    shape VARCHAR(120) NOT NULL,
    price_cents INT UNSIGNED NOT NULL,
    compare_at_price_cents INT UNSIGNED NULL,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    rating DECIMAL(3, 2) NOT NULL DEFAULT 0,
    review_count INT UNSIGNED NOT NULL DEFAULT 0,
    hover_image VARCHAR(512) NULL,
    video VARCHAR(512) NULL,
    badge VARCHAR(80) NULL,
    description TEXT NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    stock_quantity INT NULL,
    featured_position INT UNSIGNED NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_products_available_created (available, created_at),
    INDEX idx_products_shape (shape),
    INDEX idx_products_price (price_cents),
    INDEX idx_products_featured (featured_position),
    FULLTEXT INDEX ft_products_search (title, shape, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE product_images (
    product_id VARCHAR(64) NOT NULL,
    url VARCHAR(512) NOT NULL,
    position SMALLINT UNSIGNED NOT NULL,
    PRIMARY KEY (product_id, position),
    CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE product_tags (
    product_id VARCHAR(64) NOT NULL,
    tag VARCHAR(120) NOT NULL,
    PRIMARY KEY (product_id, tag),
    INDEX idx_product_tags_tag (tag),
    CONSTRAINT fk_product_tags_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE collections (
    handle VARCHAR(160) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    image VARCHAR(512) NULL,
    position SMALLINT UNSIGNED NOT NULL UNIQUE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE product_collections (
    product_id VARCHAR(64) NOT NULL,
    collection_handle VARCHAR(160) NOT NULL,
    position SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (product_id, collection_handle),
    INDEX idx_product_collections_collection (collection_handle, position),
    CONSTRAINT fk_product_collections_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_product_collections_collection FOREIGN KEY (collection_handle) REFERENCES collections(handle) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE reviews (
    id VARCHAR(64) PRIMARY KEY,
    product_handle VARCHAR(160) NOT NULL,
    author VARCHAR(160) NOT NULL,
    rating DECIMAL(3, 2) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    product_title VARCHAR(255) NOT NULL,
    product_image VARCHAR(512) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP(6) NOT NULL,
    INDEX idx_reviews_product_created (product_handle, created_at),
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_handle) REFERENCES products(handle) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE pages (
    slug VARCHAR(160) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE page_sections (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    page_slug VARCHAR(160) NOT NULL,
    heading VARCHAR(255) NULL,
    position SMALLINT UNSIGNED NOT NULL,
    UNIQUE KEY uq_page_sections_position (page_slug, position),
    CONSTRAINT fk_page_sections_page FOREIGN KEY (page_slug) REFERENCES pages(slug) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE page_section_body (
    section_id BIGINT UNSIGNED NOT NULL,
    paragraph TEXT NOT NULL,
    position SMALLINT UNSIGNED NOT NULL,
    PRIMARY KEY (section_id, position),
    CONSTRAINT fk_page_section_body_section FOREIGN KEY (section_id) REFERENCES page_sections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE faq_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    page_slug VARCHAR(160) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    position SMALLINT UNSIGNED NOT NULL,
    UNIQUE KEY uq_faq_items_position (page_slug, position),
    CONSTRAINT fk_faq_items_page FOREIGN KEY (page_slug) REFERENCES pages(slug) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE blog_posts (
    handle VARCHAR(160) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT NOT NULL,
    image VARCHAR(512) NOT NULL,
    author VARCHAR(160) NOT NULL,
    published_at TIMESTAMP(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE blog_post_body (
    post_handle VARCHAR(160) NOT NULL,
    paragraph TEXT NOT NULL,
    position SMALLINT UNSIGNED NOT NULL,
    PRIMARY KEY (post_handle, position),
    CONSTRAINT fk_blog_post_body_post FOREIGN KEY (post_handle) REFERENCES blog_posts(handle) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE navigation_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(160) NOT NULL,
    href VARCHAR(512) NOT NULL,
    position SMALLINT UNSIGNED NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE navigation_columns (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    navigation_item_id BIGINT UNSIGNED NOT NULL,
    heading VARCHAR(160) NULL,
    position SMALLINT UNSIGNED NOT NULL,
    UNIQUE KEY uq_navigation_columns_position (navigation_item_id, position),
    CONSTRAINT fk_navigation_columns_item FOREIGN KEY (navigation_item_id) REFERENCES navigation_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE navigation_links (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    navigation_column_id BIGINT UNSIGNED NOT NULL,
    label VARCHAR(160) NOT NULL,
    href VARCHAR(512) NOT NULL,
    position SMALLINT UNSIGNED NOT NULL,
    UNIQUE KEY uq_navigation_links_position (navigation_column_id, position),
    CONSTRAINT fk_navigation_links_column FOREIGN KEY (navigation_column_id) REFERENCES navigation_columns(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE navigation_featured (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    navigation_item_id BIGINT UNSIGNED NOT NULL,
    label VARCHAR(160) NOT NULL,
    image VARCHAR(512) NOT NULL,
    href VARCHAR(512) NOT NULL,
    position SMALLINT UNSIGNED NOT NULL,
    UNIQUE KEY uq_navigation_featured_position (navigation_item_id, position),
    CONSTRAINT fk_navigation_featured_item FOREIGN KEY (navigation_item_id) REFERENCES navigation_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE shipping_rates (
    id VARCHAR(64) PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    amount_cents INT UNSIGNED NOT NULL,
    estimate VARCHAR(160) NOT NULL,
    min_free_subtotal_cents INT UNSIGNED NULL,
    position SMALLINT UNSIGNED NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE promo_codes (
    code VARCHAR(64) PRIMARY KEY,
    kind ENUM('percent', 'fixed', 'free_ship') NOT NULL,
    value INT UNSIGNED NOT NULL,
    min_subtotal_cents INT UNSIGNED NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMP(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE customers (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(320) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(120) NULL,
    last_name VARCHAR(120) NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE admin_users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(320) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(40) NOT NULL DEFAULT 'ADMIN',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE wishlist_items (
    customer_id CHAR(36) NOT NULL,
    product_handle VARCHAR(160) NOT NULL,
    added_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (customer_id, product_handle),
    CONSTRAINT fk_wishlist_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_product FOREIGN KEY (product_handle) REFERENCES products(handle) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE newsletter_subscribers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(320) NULL,
    phone VARCHAR(40) NULL,
    consent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_newsletter_email (email),
    INDEX idx_newsletter_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE orders (
    id CHAR(36) PRIMARY KEY,
    number VARCHAR(64) NOT NULL UNIQUE,
    email VARCHAR(320) NOT NULL,
    subtotal_cents INT UNSIGNED NOT NULL,
    shipping_cents INT UNSIGNED NOT NULL,
    discount_cents INT UNSIGNED NOT NULL DEFAULT 0,
    tax_cents INT UNSIGNED NOT NULL,
    total_cents INT UNSIGNED NOT NULL,
    currency CHAR(3) NOT NULL,
    promo_code VARCHAR(64) NULL,
    status ENUM('confirmed', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL,
    shipping_address JSON NOT NULL,
    payment_intent_id VARCHAR(255) NULL,
    idempotency_key VARCHAR(80) NOT NULL UNIQUE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_orders_email_created (email, created_at),
    INDEX idx_orders_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE order_lines (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    product_handle VARCHAR(160) NOT NULL,
    title VARCHAR(255) NOT NULL,
    shape VARCHAR(120) NOT NULL,
    image VARCHAR(512) NOT NULL,
    unit_price_cents INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    INDEX idx_order_lines_order (order_id),
    CONSTRAINT fk_order_lines_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE analytics_daily (
    product_handle VARCHAR(160) NOT NULL,
    title VARCHAR(255) NOT NULL,
    day DATE NOT NULL,
    views BIGINT UNSIGNED NOT NULL DEFAULT 0,
    clicks BIGINT UNSIGNED NOT NULL DEFAULT 0,
    adds BIGINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (product_handle, day),
    CONSTRAINT fk_analytics_product FOREIGN KEY (product_handle) REFERENCES products(handle) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
