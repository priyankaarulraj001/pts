<?php
/**
 * Database Configuration
 * Update these values according to your web hosting database credentials
 */

define('DB_HOST', 'localhost');        // Usually 'localhost' on shared hosting
define('DB_NAME', 'pts_admin');        // Your database name
define('DB_USER', 'pts_admin_user');   // Your database username
define('DB_PASS', 'your_strong_password_here'); // Your database password

// Create database connection
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    error_log("Database Connection Error: " . $e->getMessage());
    die("Database connection failed. Please contact the administrator.");
}

// Session configuration
session_name('PTS_ADMIN_SESSION');
session_start([
    'cookie_lifetime' => 86400,        // 24 hours
    'cookie_secure' => true,           // Set to false if not using HTTPS
    'cookie_httponly' => true,
    'cookie_samesite' => 'Strict',
    'use_strict_mode' => true,
    'use_only_cookies' => true
]);

// Security functions
function sanitize($data) {
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

function isLoggedIn() {
    return isset($_SESSION['admin_id']) && isset($_SESSION['login_token']);
}

function generateToken() {
    return bin2hex(random_bytes(32));
}

function verifyToken($token) {
    return isset($_SESSION['login_token']) && hash_equals($_SESSION['login_token'], $token);
}

function redirect($url) {
    header("Location: $url");
    exit();
}
