<?php
/**
 * Database Configuration
 * Update these values according to your web hosting database credentials
 * OR use environment variables from .env file
 */

// Load .env file if it exists
if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '#') === 0) continue; // Skip comments
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

// Determine if we're in production
$appEnv = $_ENV['APP_ENV'] ?? 'development';
$isProduction = ($appEnv === 'production');

// Database Configuration - Use .env values or fallbacks
define('DB_HOST', $_ENV['DB_HOST'] ?? 'localhost');
define('DB_NAME', $_ENV['DB_NAME'] ?? 'pts_admin');
define('DB_USER', $_ENV['DB_USER'] ?? 'pts_admin_user');
define('DB_PASS', $_ENV['DB_PASS'] ?? 'your_strong_password_here');

// Application Settings
define('APP_KEY', $_ENV['APP_KEY'] ?? bin2hex(random_bytes(16)));
define('CSRF_TOKEN_NAME', $_ENV['CSRF_TOKEN_NAME'] ?? 'pts_csrf_token');
define('CORS_ORIGIN', $_ENV['CORS_ALLOWED_ORIGIN'] ?? '*');

// Error Reporting - Disable in production
if ($isProduction) {
    error_reporting(0);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/../logs/error.log');
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

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
    if ($isProduction) {
        die("Database connection failed. Please contact the administrator.");
    } else {
        die("Database connection failed: " . $e->getMessage());
    }
}

// Session configuration
$cookieSecure = isset($_ENV['COOKIE_SECURE']) ? filter_var($_ENV['COOKIE_SECURE'], FILTER_VALIDATE_BOOLEAN) : !$isProduction;
$cookieHttpOnly = isset($_ENV['COOKIE_HTTPONLY']) ? filter_var($_ENV['COOKIE_HTTPONLY'], FILTER_VALIDATE_BOOLEAN) : true;
$cookieSameSite = $_ENV['COOKIE_SAMESITE'] ?? 'Strict';
$sessionLifetime = (int)($_ENV['SESSION_LIFETIME'] ?? 86400);

session_name('PTS_ADMIN_SESSION');
session_start([
    'cookie_lifetime' => $sessionLifetime,
    'cookie_secure' => $cookieSecure,
    'cookie_httponly' => $cookieHttpOnly,
    'cookie_samesite' => $cookieSameSite,
    'use_strict_mode' => true,
    'use_only_cookies' => true
]);

// Regenerate session ID periodically to prevent fixation
if (!isset($_SESSION['initiated'])) {
    session_regenerate_id(true);
    $_SESSION['initiated'] = true;
    $_SESSION['created_at'] = time();
}

// Check session age and regenerate if too old
if (isset($_SESSION['created_at']) && (time() - $_SESSION['created_at']) > $sessionLifetime) {
    session_regenerate_id(true);
    $_SESSION['created_at'] = time();
}

// Security functions
function sanitize($data) {
    if (is_array($data)) {
        return array_map('sanitize', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

function isLoggedIn() {
    return isset($_SESSION['admin_id']) && isset($_SESSION['login_token']) && isset($_SESSION['login_hash']);
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

/**
 * CSRF Protection Functions
 */
function csrf_token() {
    if (!isset($_SESSION[CSRF_TOKEN_NAME])) {
        $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
    }
    return $_SESSION[CSRF_TOKEN_NAME];
}

function csrf_field() {
    return '<input type="hidden" name="csrf_token" value="' . csrf_token() . '">';
}

function verify_csrf_token($token) {
    if (!isset($_SESSION[CSRF_TOKEN_NAME])) {
        return false;
    }
    return hash_equals($_SESSION[CSRF_TOKEN_NAME], $token);
}

/**
 * Rate Limiting Function
 * Simple file-based rate limiting
 */
function check_rate_limit($identifier, $limit = 60, $period = 60) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $key = $identifier . '_' . $ip;
    $cacheFile = __DIR__ . '/../cache/rate_limit_' . md5($key) . '.json';
    
    // Create cache directory if it doesn't exist
    $cacheDir = __DIR__ . '/../cache';
    if (!is_dir($cacheDir)) {
        mkdir($cacheDir, 0755, true);
    }
    
    $now = time();
    $requests = [];
    
    // Read existing requests
    if (file_exists($cacheFile)) {
        $data = json_decode(file_get_contents($cacheFile), true);
        if ($data && isset($data['expires']) && $data['expires'] > $now) {
            $requests = $data['requests'] ?? [];
        }
    }
    
    // Remove old requests
    $requests = array_filter($requests, function($time) use ($now, $period) {
        return ($now - $time) < $period;
    });
    
    // Check if limit exceeded
    if (count($requests) >= $limit) {
        return false;
    }
    
    // Add new request
    $requests[] = $now;
    
    // Save requests
    file_put_contents($cacheFile, json_encode([
        'requests' => $requests,
        'expires' => $now + $period
    ]));
    
    return true;
}

/**
 * CORS Headers Function
 */
function set_cors_headers() {
    $origin = CORS_ORIGIN;
    
    // If not in production and CORS is *, allow all
    // In production, this should be restricted to your actual domain
    if ($origin !== '*') {
        $requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($requestOrigin === $origin || in_array($requestOrigin, explode(',', $origin))) {
            header("Access-Control-Allow-Origin: $requestOrigin");
        } else {
            header("Access-Control-Allow-Origin: $origin");
        }
    } else {
        header("Access-Control-Allow-Origin: *");
    }
    
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, X-CSRF-Token");
    header("Access-Control-Allow-Credentials: true");
}

/**
 * Require POST method
 */
function require_post() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }
}

/**
 * Require admin authentication
 */
function require_admin() {
    if (!isLoggedIn()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Authentication required']);
        exit;
    }
}

/**
 * Validate email format
 */
function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Log security events
 */
function log_security_event($event, $details = []) {
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'event' => $event,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        'details' => $details
    ];
    
    $logDir = __DIR__ . '/../logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logFile = $logDir . '/security_' . date('Y-m-d') . '.log';
    file_put_contents($logFile, json_encode($logData) . "\n", FILE_APPEND);
}
