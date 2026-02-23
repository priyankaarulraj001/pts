<?php
/**
 * Reset Password API
 * Processes password reset confirmation and updates the password
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../includes/config.php';

// Rate limiting - prevent abuse
$rateLimitKey = 'reset_password_' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
if (!check_rate_limit($rateLimitKey, 5, 3600)) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Too many requests. Please try again later.']);
    exit;
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get input data
$input = json_decode(file_get_contents('php://input'), true);
$userId = isset($input['userId']) ? trim($input['userId']) : '';
$token = isset($input['token']) ? trim($input['token']) : '';
$newPassword = isset($input['newPassword']) ? $input['newPassword'] : '';

// Validate input
if (empty($userId) || empty($token) || empty($newPassword)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

if (strlen($newPassword) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
    exit;
}

try {
    // Create password_resets table if not exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        token_expiry DATETIME NOT NULL,
        used TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token (token),
        INDEX idx_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Check if token is valid
    $stmt = $pdo->prepare("SELECT pr.*, au.email, au.full_name FROM password_resets pr 
                           JOIN admin_users au ON pr.user_id = au.id 
                           WHERE pr.token = ? AND pr.user_id = ? AND pr.used = 0");
    $stmt->execute([$token, $userId]);
    $resetRequest = $stmt->fetch();
    
    if (!$resetRequest) {
        echo json_encode(['success' => false, 'message' => 'Invalid or expired reset link. Please request a new password reset.']);
        exit;
    }
    
    // Check if token has expired
    $currentTime = new DateTime();
    $expiryTime = new DateTime($resetRequest['token_expiry']);
    
    if ($currentTime > $expiryTime) {
        echo json_encode(['success' => false, 'message' => 'Reset link has expired. Please request a new password reset.']);
        exit;
    }
    
    // Hash the new password
    $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Update the user's password
    $updateStmt = $pdo->prepare("UPDATE admin_users SET password_hash = ?, updated_at = NOW() WHERE id = ?");
    $updateStmt->execute([$passwordHash, $userId]);
    
    // Mark the reset token as used
    $usedStmt = $pdo->prepare("UPDATE password_resets SET used = 1 WHERE user_id = ?");
    $usedStmt->execute([$userId]);
    
    // Invalidate all other reset tokens for this user
    $deleteStmt = $pdo->prepare("DELETE FROM password_resets WHERE user_id = ? AND used = 0");
    $deleteStmt->execute([$userId]);
    
    // Log the event
    log_security_event('password_reset_completed', [
        'user_id' => $userId,
        'email' => $resetRequest['email']
    ]);
    
    echo json_encode(['success' => true, 'message' => 'Password has been reset successfully. Redirecting to login...']);
    
} catch (PDOException $e) {
    error_log("Reset Password Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'An error occurred. Please try again later.']);
}

