<?php
/**
 * Subscribe API
 * Handles newsletter subscriptions
 * Public can subscribe, but rate limited
 */

require_once 'includes/config.php';

// Set CORS headers
set_cors_headers();

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Set headers for JSON response
header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Only allow POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
    exit;
}

try {
    // Check rate limit (5 subscriptions per minute to prevent abuse)
    if (!check_rate_limit('api_subscribe', 5, 60)) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error' => 'Too many requests. Please try again later.'
        ]);
        exit;
    }
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['email']) || empty($input['email'])) {
        echo json_encode([
            'success' => false,
            'error' => 'Email is required'
        ]);
        exit;
    }
    
    // Sanitize and validate email
    $email = sanitize($input['email']);
    $email = filter_var($email, FILTER_VALIDATE_EMAIL);
    
    if (!$email) {
        echo json_encode([
            'success' => false,
            'error' => 'Invalid email address'
        ]);
        exit;
    }
    
    // Check if already subscribed
    $stmt = $pdo->prepare("SELECT id, status FROM subscribers WHERE email = ?");
    $stmt->execute([$email]);
    $existing = $stmt->fetch();
    
    if ($existing) {
        if ($existing['status'] === 'active') {
            // Log potential duplicate subscription attempt
            log_security_event('duplicate_subscription', ['email' => $email]);
            
            echo json_encode([
                'success' => false,
                'message' => 'Already subscribed!'
            ]);
        } else {
            // Reactivate subscription
            $stmt = $pdo->prepare("UPDATE subscribers SET status = 'active', unsubscribed_at = NULL WHERE id = ?");
            $stmt->execute([$existing['id']]);
            
            // Update subscriber count
            $pdo->exec("UPDATE site_stats SET stat_value = (SELECT COUNT(*) FROM subscribers WHERE status = 'active') WHERE stat_key = 'total_subscribers'");
            
            // Log the event
            log_security_event('subscription_reactivated', ['email' => $email]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Subscription reactivated!'
            ]);
        }
        exit;
    }
    
    // Sanitize name if provided
    $name = isset($input['name']) ? sanitize($input['name']) : null;
    
    // Insert new subscriber
    $stmt = $pdo->prepare("INSERT INTO subscribers (email, name, status) VALUES (?, ?, 'active')");
    $stmt->execute([
        $email,
        $name
    ]);
    
    // Update subscriber count
    $pdo->exec("UPDATE site_stats SET stat_value = (SELECT COUNT(*) FROM subscribers WHERE status = 'active') WHERE stat_key = 'total_subscribers'");
    
    // Log the event
    log_security_event('new_subscription', ['email' => $email]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Successfully subscribed!'
    ]);
    
} catch (PDOException $e) {
    error_log("Subscribe API Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Subscription failed. Please try again.'
    ]);
}

