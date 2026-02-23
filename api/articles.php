<?php
/**
 * Articles API
 * Handles CRUD operations for articles
 * Requires admin authentication for POST/PUT/DELETE
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

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
case 'GET':
            // Get all published articles - public access
            // Optional: filter by category via query parameter ?category=politics
            // Optional: get single article by ID via query parameter ?id=123
            $category = isset($_GET['category']) ? sanitize($_GET['category']) : null;
            $articleId = isset($_GET['id']) ? sanitize($_GET['id']) : null;
            
            // If ID is provided, return single article
            if ($articleId) {
                $stmt = $pdo->prepare("SELECT * FROM articles WHERE id = ? AND status = 'published'");
                $stmt->execute([$articleId]);
                $article = $stmt->fetch();
                
                if ($article) {
                    echo json_encode([
                        'success' => true,
                        'data' => $article
                    ]);
                } else {
                    echo json_encode([
                        'success' => false,
                        'error' => 'Article not found'
                    ]);
                }
                break;
            }
            
            if ($category) {
                // Filter by category
                $stmt = $pdo->prepare("SELECT * FROM articles WHERE status = 'published' AND category = ? ORDER BY created_at DESC");
                $stmt->execute([$category]);
            } else {
                $stmt = $pdo->query("SELECT * FROM articles WHERE status = 'published' ORDER BY created_at DESC");
            }
            $articles = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => $articles,
                'count' => count($articles)
            ]);
            break;
            
        case 'POST':
            // Check rate limit (60 requests per minute)
            if (!check_rate_limit('api_articles_post', 60, 60)) {
                http_response_code(429);
                echo json_encode([
                    'success' => false,
                    'error' => 'Too many requests. Please try again later.'
                ]);
                exit;
            }
            
            // Require admin authentication
            require_admin();
            
            // Verify CSRF token
            $input = json_decode(file_get_contents('php://input'), true);
            $csrfToken = $input['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
            
            if (!verify_csrf_token($csrfToken)) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid CSRF token'
                ]);
                exit;
            }
            
            // Validate required fields
            if (!isset($input['title']) || empty(trim($input['title']))) {
                echo json_encode([
                    'success' => false,
                    'error' => 'Title is required'
                ]);
                exit;
            }
            
            // Sanitize input
            $title = sanitize($input['title']);
            $content = sanitize($input['content'] ?? '');
            $category = sanitize($input['category'] ?? 'Uncategorized');
            $image = isset($input['image']) ? sanitize($input['image']) : null;
            
            $stmt = $pdo->prepare("
                INSERT INTO articles (title, content, category, featured_image, author_id, status, view_count) 
                VALUES (?, ?, ?, ?, ?, 'published', 0)
            ");
            
            $stmt->execute([
                $title,
                $content,
                $category,
                $image,
                $_SESSION['admin_id']
            ]);
            
            $articleId = $pdo->lastInsertId();
            
            // Update article count
            $pdo->exec("UPDATE site_stats SET stat_value = (SELECT COUNT(*) FROM articles WHERE status = 'published') WHERE stat_key = 'total_articles'");
            
            // Log the event
            log_security_event('article_created', ['article_id' => $articleId, 'title' => $title]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Article created successfully',
                'article_id' => $articleId
            ]);
            break;
            
        case 'PUT':
        case 'DELETE':
            // Require admin authentication for modifications
            require_admin();
            
            echo json_encode([
                'success' => false,
                'error' => 'Method not implemented'
            ]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Method not allowed'
            ]);
    }
    
} catch (PDOException $e) {
    error_log("Articles API Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error'
    ]);
}

