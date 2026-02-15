<?php
/**
 * Database Setup Script
 * Run this file ONCE to set up the database and create admin user
 * 
 * After running, DELETE this file for security!
 * 
 * Access: http://yourdomain.com/setup.php
 */

require_once 'config.php';

echo '<!DOCTYPE html>
<html>
<head>
    <title>Database Setup - PTS Admin</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .success { color: green; padding: 10px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; margin: 10px 0; }
        .error { color: red; padding: 10px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; margin: 10px 0; }
        .info { color: blue; padding: 10px; background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>PTS Admin Database Setup</h1>';

try {
    // Create admin_users table
    $sql = "CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        role ENUM('admin', 'editor', 'author') DEFAULT 'admin',
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        last_login DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    echo '<div class="success">✓ Admin users table created successfully!</div>';
    
    // Check if admin exists
    $stmt = $pdo->prepare("SELECT id FROM admin_users WHERE username = ?");
    $stmt->execute(['admin']);
    $adminExists = $stmt->fetch();
    
    if (!$adminExists) {
        $password = 'admin123';
        $passwordHash = password_hash($password, PASSWORD_DEFAULT, ['cost' => 12]);
        
        $stmt = $pdo->prepare("
            INSERT INTO admin_users (username, email, password_hash, full_name, role, status) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            'admin',
            'admin@ptsnews.com',
            $passwordHash,
            'Administrator',
            'admin',
            'active'
        ]);
        
        echo '<div class="success">✓ Default admin user created!</div>';
        echo '<div class="info"><strong>Username:</strong> admin<br><strong>Password:</strong> admin123</div>';
    } else {
        echo '<div class="info">Admin user already exists. No changes made.</div>';
    }
    
    // Create login logs table
    $sql = "CREATE TABLE IF NOT EXISTS admin_login_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        ip_address VARCHAR(45),
        user_agent VARCHAR(255),
        login_status ENUM('success', 'failed') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE SET NULL,
        INDEX idx_created (created_at),
        INDEX idx_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    echo '<div class="success">✓ Login logs table created!</div>';
    
    echo '<div style="margin-top:20px; padding:15px; background:#fff3cd; border:1px solid #ffc107; border-radius:5px;">';
    echo '<strong>⚠️ SECURITY WARNING:</strong> Delete setup.php after setup!';
    echo '</div>';
    
    echo '<div style="margin-top:20px;"><a href="login.php" style="display:inline-block; padding:10px 20px; background:#001A56; color:white; text-decoration:none; border-radius:5px;">Go to Login</a></div>';
    
} catch (PDOException $e) {
    echo '<div class="error">Error: ' . htmlspecialchars($e->getMessage()) . '</div>';
    echo '<div class="info">Check database credentials in config.php!</div>';
}

echo '</body></html>';
