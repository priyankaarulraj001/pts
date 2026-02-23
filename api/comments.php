<?php
/**
 * Comments API
 * Handles comment submissions and retrieval
 * Public can submit comments, but rate limited
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

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'POST') {
        // Check rate limit (10 comments per minute to prevent spam)
        if (!check_rate_limit('api_comments_post', 10, 60)) {
            http_response_code(429);
            echo json_encode([
                'success' => false,
                'error' => 'Too many requests. Please try again later.'
            ]);
            exit;
        }
        
        // Verify CSRF token for public comments (optional but recommended)
        $input = json_decode(file_get_contents('php://input'), true);
        $csrfToken = $input['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        
        // For public comments, we can make CSRF optional but recommended
        // Uncomment the following to enforce CSRF:
        /*
        if (!verify_csrf_token($csrfToken)) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error' => 'Invalid CSRF token'
            ]);
            exit;
        }
        */
        
        if (!isset($input['article_id']) || empty($input['article_id'])) {
            echo json_encode([
                'success' => false,
                'error' => 'Article ID is required'
            ]);
            exit;
        }
        
        if (!isset($input['comment']) || empty(trim($input['comment']))) {
            echo json_encode([
                'success' => false,
                'error' => 'Comment is required'
            ]);
            exit;
        }
        
        // Validate and sanitize input
        $articleId = (int)$input['article_id'];
        $comment = sanitize($input['comment']);
        $name = sanitize($input['name'] ?? 'Anonymous');
        $email = isset($input['email']) ? sanitize($input['email']) : null;
        
        // Validate email if provided
        if ($email && !validate_email($email)) {
            echo json_encode([
                'success' => false,
                'error' => 'Invalid email address'
            ]);
            exit;
        }
        
        // Check if article exists
        $stmt = $pdo->prepare("SELECT id FROM articles WHERE id = ? AND status = 'published'");
        $stmt->execute([$articleId]);
        if (!$stmt->fetch()) {
            echo json_encode([
                'success' => false,
                'error' => 'Article not found'
            ]);
            exit;
        }
        
        // Comment length limit (prevent abuse)
        if (strlen($comment) > 5000) {
            echo json_encode([
                'success' => false,
                'error' => 'Comment is too long (max 5000 characters)'
            ]);
            exit;
        }
        
        $stmt = $pdo->prepare("
            INSERT INTO comments (article_id, user_name, user_email, comment, status) 
            VALUES (?, ?, ?, ?, 'pending')
        ");
        
        $stmt->execute([
            $articleId,
            $name,
            $email,
            $comment
        ]);
        
        // Update comment count in stats (only approved comments)
        $pdo->exec("UPDATE site_stats SET stat_value = (SELECT COUNT(*) FROM comments WHERE status = 'approved') WHERE stat_key = 'total_comments'");
        
        // Log the event
        log_security_event('comment_submitted', ['article_id' => $articleId]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Comment submitted successfully! It will be visible after approval.'
        ]);
        
    } elseif ($method === 'GET') {
        // Get comments for an article - public access
        $articleId = isset($_GET['article_id']) ? (int)$_GET['article_id'] : null;
        
        if ($articleId) {
            $stmt = $pdo->prepare("
                SELECT id, article_id, user_name, comment, created_at 
                FROM comments 
                WHERE article_id = ? AND status = 'approved' 
                ORDER BY created_at DESC
            ");
            $stmt->execute([$articleId]);
        } else {
            $stmt = $pdo->query("
                SELECT c.id, c.article_id, c.user_name, c.comment, c.created_at, a.title as article_title 
                FROM comments c 
                LEFT JOIN articles a ON c.article_id = a.id 
                WHERE c.status = 'approved' 
                ORDER BY c.created_at DESC 
                LIMIT 50
            ");
        }
        
        $comments = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'data' => $comments,
            'count' => count($comments)
        ]);
    } else {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'error' => 'Method not allowed'
        ]);
    }
    
} catch (PDOException $e) {
    error_log("Comments API Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error'
    ]);
}

