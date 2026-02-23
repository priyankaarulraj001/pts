<?php
/**
 * Contact Form Handler
 * This file processes the contact form submissions and sends emails
 * 
 * @version 1.0
 */

// Configuration - Update these values
$config = [
    'to_email' => 'info@ptsnews.in',
    'from_email' => 'noreply@ptsnews.in',
    'subject_prefix' => '[PTS NEWS Contact]',
    'reply_to' => true,
    'store_submissions' => true,
    'submissions_file' => __DIR__ . '/submissions.txt'
];

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    // Try form data
    $input = $_POST;
}

// Validate input
$name = sanitize($input['name'] ?? '');
$email = sanitize($input['email'] ?? '');
$subject = sanitize($input['subject'] ?? '');
$message = sanitize($input['message'] ?? '');

// Validation errors
$errors = [];

if (empty($name)) {
    $errors[] = 'Name is required';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Valid email is required';
}

if (empty($subject)) {
    $errors[] = 'Subject is required';
}

if (empty($message)) {
    $errors[] = 'Message is required';
}

// Check for spam (honeypot)
if (!empty($input['website'])) {
    // Honeypot field - silently accept but don't process
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Thank you for your message!']);
    exit;
}

// Check for basic spam indicators
if (strlen($message) > 5000) {
    $errors[] = 'Message is too long';
}

if (count($errors) > 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

// Build email content
$email_subject = $config['subject_prefix'] . ' ' . ucfirst($subject) . ' - ' . $name;

$email_body = "
<html>
<head>
    <title>New Contact Form Submission</title>
</head>
<body style font-family: Arial, sans-serif;>
    <h2 style=\"color: #001A56;\">New Contact Form Submission</h2>
    
    <table style=\"width: 100%; max-width: 600px; border-collapse: collapse;\">
        <tr>
            <td style=\"padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;\">Name</td>
            <td style=\"padding: 10px; border: 1px solid #ddd;\">" . htmlspecialchars($name) . "</td>
        </tr>
        <tr>
            <td style=\"padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;\">Email</td>
            <td style=\"padding: 10px; border: 1px solid #ddd;\">" . htmlspecialchars($email) . "</td>
        </tr>
        <tr>
            <td style=\"padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;\">Subject</td>
            <td style=\"padding: 10px; border: 1px solid #ddd;\">" . htmlspecialchars(ucfirst($subject)) . "</td>
        </tr>
        <tr>
            <td style=\"padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;\">Message</td>
            <td style=\"padding: 10px; border: 1px solid #ddd;\">" . nl2br(htmlspecialchars($message)) . "</td>
        </tr>
        <tr>
            <td style=\"padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;\">Date</td>
            <td style=\"padding: 10px; border: 1px solid #ddd;\">" . date('Y-m-d H:i:s') . "</td>
        </tr>
        <tr>
            <td style=\"padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;\">IP Address</td>
            <td style=\"padding: 10px; border: 1px solid #ddd;\">" . $_SERVER['REMOTE_ADDR'] . "</td>
        </tr>
    </table>
    
    <p style=\"margin-top: 20px; color: #666; font-size: 12px;\">
        This email was sent from the PTS NEWS contact form.
    </p>
</body>
</html>
";

// Email headers
$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/html; charset=UTF-8';
$headers[] = 'From: ' . $config['from_email'];
$headers[] = 'Reply-To: ' . $email;
$headers[] = 'X-Mailer: PHP/' . phpversion();

// Try to send email
$email_sent = @mail($config['to_email'], $email_subject, $email_body, implode("\r\n", $headers));

// Store submission if enabled
if ($config['store_submissions']) {
    $log_entry = date('Y-m-d H:i:s') . ' | ' . $name . ' | ' . $email . ' | ' . $subject . ' | ' . $_SERVER['REMOTE_ADDR'] . "\n";
    @file_put_contents($config['submissions_file'], $log_entry, FILE_APPEND);
}

if ($email_sent) {
    // Send auto-reply to user
    if ($config['reply_to']) {
        $auto_reply_subject = 'Thank you for contacting PTS NEWS';
        $auto_reply_body = "
        <html>
        <body>
            <h2 style=\"color: #001A56;\">Thank you for contacting PTS NEWS</h2>
            <p>Dear " . htmlspecialchars($name) . ",</p>
            <p>We have received your message and will get back to you within 24-48 hours.</p>
            <p>Here's a copy of your message:</p>
            <hr>
            <p><strong>Subject:</strong> " . htmlspecialchars(ucfirst($subject)) . "</p>
            <p><strong>Message:</strong></p>
            <p>" . nl2br(htmlspecialchars($message)) . "</p>
            <hr>
            <p>Best regards,<br>PTS NEWS Team</p>
        </body>
        </html>
        ";
        
        $auto_reply_headers = [];
        $auto_reply_headers[] = 'MIME-Version: 1.0';
        $auto_reply_headers[] = 'Content-Type: text/html; charset=UTF-8';
        $auto_reply_headers[] = 'From: ' . $config['from_email'];
        
        @mail($email, $auto_reply_subject, $auto_reply_body, implode("\r\n", $auto_reply_headers));
    }
    
    echo json_encode([
        'success' => true, 
        'message' => 'Thank you for your message! We will get back to you soon.'
    ]);
} else {
    // Email failed but still show success to prevent probing
    echo json_encode([
        'success' => true, 
        'message' => 'Thank you for your message! We will get back to you soon.'
    ]);
}

// Sanitize function
function sanitize($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}
?>
