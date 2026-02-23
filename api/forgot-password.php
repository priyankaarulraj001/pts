<?php
/**
 * Forgot Password API
 * Processes password reset requests and sends reset email
 */

header('Content-Type: application/json');

// Start output buffering
ob_start();

try {
    require_once __DIR__ . '/../includes/config.php';
} catch (Exception $e) {
    ob_end_clean();
    error_log("Config load error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Configuration error. Please contact administrator.']);
    exit;
}

$ob_content = ob_get_clean();

// Rate limiting - prevent abuse
$rateLimitKey = 'forgot_password_' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
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
$username = isset($input['username']) ? trim($input['username']) : '';

// Validate input
if (empty($username)) {
    echo json_encode(['success' => false, 'message' => 'Username is required']);
    exit;
}

// Sanitize input
$username = sanitize($username);

try {
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id, username, email, full_name FROM admin_users WHERE username = ? AND status = 'active'");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if (!$user) {
        // Don't reveal if user exists or not for security
        echo json_encode(['success' => true, 'message' => 'If the username exists, a reset link has been sent to the associated email address.']);
        exit;
    }
    
    // Generate reset token
    $resetToken = bin2hex(random_bytes(32));
    $tokenExpiry = date('Y-m-d H:i:s', strtotime('+1 hour')); // Token valid for 1 hour
    
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
    
    // Delete any existing reset tokens for this user
    $deleteStmt = $pdo->prepare("DELETE FROM password_resets WHERE user_id = ?");
    $deleteStmt->execute([$user['id']]);
    
    // Insert new reset token
    $insertStmt = $pdo->prepare("INSERT INTO password_resets (user_id, token, token_expiry) VALUES (?, ?, ?)");
    $insertStmt->execute([$user['id'], $resetToken, $tokenExpiry]);
    
    // Build reset URL
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $resetUrl = $protocol . '://' . $host . '/reset-password.html?token=' . $resetToken . '&user=' . $user['id'];
    
    // Prepare email
    $to = $user['email'];
    $subject = 'Password Reset Request - PTS NEWS';
    
    $emailBody = "
    <html>
    <head>
        <title>Password Reset - PTS NEWS</title>
    </head>
    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
        <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
            <div style='background: linear-gradient(135deg, #001A56 0%, #002a7a 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;'>
                <h1 style='color: white; margin: 0;'>PTS NEWS</h1>
            </div>
            <div style='background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;'>
                <h2>Password Reset Request</h2>
                <p>Hello {$user['full_name']},</p>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='{$resetUrl}' style='background: linear-gradient(135deg, #F21517 0%, #d40f11 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;'>Reset Password</a>
                </div>
                <p>Or copy and paste this link in your browser:</p>
                <p style='word-break: break-all; color: #001A56;'>{$resetUrl}</p>
                <p><strong>This link will expire in 1 hour.</strong></p>
                <p>If you didn't request this password reset, please ignore this email or contact the administrator if you have concerns.</p>
                <hr style='border: none; border-top: 1px solid #ddd; margin: 20px 0;'>
                <p style='color: #666; font-size: 12px;'>This is an automated message from PTS NEWS. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Email headers
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: PTS NEWS <noreply@ptsnews.in>" . "\r\n";
    $headers .= "Reply-To: noreply@ptsnews.in" . "\r\n";
    
    // Try to send email (suppress errors with @)
    $emailSent = @mail($to, $subject, $emailBody, $headers);
    
    // Log the event (for security monitoring)
    log_security_event('password_reset_request', [
        'user_id' => $user['id'],
        'username' => $username,
        'email' => $user['email'],
        'email_sent' => $emailSent
    ]);
    
    // Always show success message (don't reveal if email was sent or not)
    echo json_encode(['success' => true, 'message' => 'If the username exists, a reset link has been sent to the associated email address.']);
    
} catch (PDOException $e) {
    error_log("Forgot Password PDO Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error. Please try again later.']);
} catch (Exception $e) {
    error_log("Forgot Password Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'An error occurred. Please try again later.']);
}

