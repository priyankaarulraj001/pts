-- PTS News Database Setup
-- Run this file in phpMyAdmin to create all required tables

-- Set database name
-- Run: CREATE DATABASE pts_admin; (if not exists)
USE pts_admin;

-- ============================================
-- ARTICLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content TEXT,
    category VARCHAR(100) DEFAULT 'Uncategorized',
    featured_image VARCHAR(255),
    author_id INT DEFAULT 1,
    author_name VARCHAR(100) DEFAULT 'PTS News',
    status VARCHAR(20) DEFAULT 'published' COMMENT 'published, draft, archived',
    view_count INT DEFAULT 0,
    is_featured TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' COMMENT 'active, unsubscribed',
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP NULL,
    ip_address VARCHAR(45),
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SITE STATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS site_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stat_key VARCHAR(50) UNIQUE NOT NULL,
    stat_value VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (stat_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default stats
INSERT INTO site_stats (stat_key, stat_value) VALUES 
('total_articles', '0'),
('total_subscribers', '0'),
('total_views', '0'),
('total_comments', '0')
ON DUPLICATE KEY UPDATE stat_value = stat_value;

-- ============================================
-- ADMIN USERS TABLE (Optional - for admin panel)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'admin' COMMENT 'admin, editor',
    status VARCHAR(20) DEFAULT 'active',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (Password: admin123 - CHANGE THIS!)
-- Default username: admin
-- Default password hash for 'admin123' (use your own hash in production!)
INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES 
('admin', 'admin@ptsnews.in', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Site Administrator', 'admin')
ON DUPLICATE KEY UPDATE email = email;

-- ============================================
-- COMMENTS TABLE (Optional)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_id INT NOT NULL,
    parent_id INT DEFAULT NULL,
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' COMMENT 'approved, pending, spam',
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_article (article_id),
    INDEX idx_status (status),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CREATE DATABASE (Run this separately if needed)
-- ============================================
-- CREATE DATABASE IF NOT EXISTS pts_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- VIEW: Get statistics
-- ============================================
-- Run this query to get all stats:
-- SELECT * FROM site_stats;

-- ============================================
-- SAMPLE DATA: Insert sample article
-- ============================================
INSERT INTO articles (title, summary, content, category, author_name, status, view_count) VALUES 
('Welcome to PTS NEWS', 'Your trusted source for the latest news and updates from around the world.', 
'<p>Welcome to PTS NEWS - your trusted source for the latest news and updates from around the world.</p><p>We deliver accurate, timely, and comprehensive coverage across politics, business, sports, science, and technology.</p><p>Stay informed with our 24/7 news updates and breaking news alerts.</p>',
'General', 'PTS News', 'published', 0)
ON DUPLICATE KEY UPDATE title = title;

-- Update stats after insert
UPDATE site_stats SET stat_value = (SELECT COUNT(*) FROM articles WHERE status = 'published') WHERE stat_key = 'total_articles';
UPDATE site_stats SET stat_value = (SELECT COUNT(*) FROM subscribers WHERE status = 'active') WHERE stat_key = 'total_subscribers';

-- ============================================
-- END OF DATABASE SETUP
-- ============================================
-- After running this file, configure includes/config.php with your database credentials
-- Default credentials in config.php:
--   DB_HOST: localhost
--   DB_NAME: pts_admin
--   DB_USER: pts_admin_user (change this)
--   DB_PASS: your_password (change this)
-- ============================================
