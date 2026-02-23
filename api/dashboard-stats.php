<?php
/**
 * Dashboard Stats API
 * Returns real-time statistics for the admin dashboard
 * Requires admin authentication
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

// Only allow GET method
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
    exit;
}

// Require admin authentication
require_admin();

try {
    // Get statistics from database
    
    // 1. Total Articles count
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM articles WHERE status = 'published'");
    $totalArticles = (int)$stmt->fetch()['count'];
    
    // 2. Total Views (sum of all article view counts)
    $stmt = $pdo->query("SELECT COALESCE(SUM(view_count), 0) as total FROM articles WHERE status = 'published'");
    $totalViews = (int)$stmt->fetch()['total'];
    
    // 3. Total Subscribers (active only)
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM subscribers WHERE status = 'active'");
    $totalSubscribers = (int)$stmt->fetch()['count'];
    
    // 4. Total Comments (approved only)
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM comments WHERE status = 'approved'");
    $totalComments = (int)$stmt->fetch()['count'];
    
    // 5. Total Pending Comments
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM comments WHERE status = 'pending'");
    $pendingComments = (int)$stmt->fetch()['count'];
    
    // Prepare response
    $stats = [
        'success' => true,
        'data' => [
            'articles' => $totalArticles,
            'views' => $totalViews,
            'subscribers' => $totalSubscribers,
            'comments' => $totalComments,
            'pending_comments' => $pendingComments
        ],
        'last_updated' => date('Y-m-d H:i:s')
    ];
    
    echo json_encode($stats);
    
} catch (PDOException $e) {
    // Log error
    error_log("Dashboard Stats API Error: " . $e->getMessage());
    
    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch statistics'
    ]);
}

