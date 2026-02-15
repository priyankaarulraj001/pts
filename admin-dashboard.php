<?php
require_once 'includes/config.php';

// Check if logged in
if (!isLoggedIn()) {
    redirect('login.php');
}

// Get admin info
$adminName = $_SESSION['admin_full_name'] ?? $_SESSION['admin_username'] ?? 'Admin';
$adminRole = $_SESSION['admin_role'] ?? 'admin';

// Handle logout
if (isset($_GET['logout'])) {
    // Destroy session
    session_destroy();
    redirect('login.php');
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - PTS NEWS</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Manrope', sans-serif; background: #f0f2f5; min-height: 100vh; }
        
        .dashboard-header {
            background: linear-gradient(135deg, #001A56 0%, #002a7a 100%);
            color: white;
            padding: 20px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        .dashboard-logo { display: flex; align-items: center; gap: 15px; }
        .dashboard-logo img { width: 50px; height: auto; }
        .dashboard-logo h1 { font-size: 24px; font-weight: 700; }
        .dashboard-logo span { background: #F21517; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .dashboard-user { display: flex; align-items: center; gap: 20px; }
        .user-info { display: flex; align-items: center; gap: 12px; }
        .user-avatar {
            width: 45px; height: 45px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 20px;
        }
        .user-details { text-align: right; }
        .user-name { font-size: 16px; font-weight: 600; }
        .user-role { font-size: 12px; opacity: 0.8; }
        .logout-btn {
            display: flex; align-items: center; gap: 8px;
            padding: 10px 20px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            color: white; font-size: 14px; font-weight: 600;
            cursor: pointer; transition: all 0.3s ease;
            text-decoration: none;
        }
        .logout-btn:hover { background: #F21517; border-color: #F21517; }
        
        .dashboard-content { padding: 40px; max-width: 1400px; margin: 0 auto; }
        .dashboard-title { font-size: 28px; font-weight: 700; color: #001A56; margin-bottom: 30px; }
        
        .welcome-banner {
            background: linear-gradient(135deg, #001A56 0%, #002a7a 100%);
            border-radius: 15px; padding: 30px 40px;
            margin-bottom: 40px; color: white;
            display: flex; justify-content: space-between; align-items: center;
            box-shadow: 0 10px 30px rgba(0, 26, 86, 0.3);
        }
        .welcome-text h2 { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
        .welcome-text p { font-size: 15px; opacity: 0.9; }
        .welcome-date { text-align: right; }
        .welcome-date .date { font-size: 36px; font-weight: 800; }
        .welcome-date .time { font-size: 18px; opacity: 0.8; }
        
        .stats-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px; margin-bottom: 40px;
        }
        .stat-card {
            background: white; border-radius: 15px; padding: 25px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease; position: relative; overflow: hidden;
        }
        .stat-card::before {
            content: ''; position: absolute; top: 0; left: 0; width: 5px; height: 100%;
        }
        .stat-card.blue::before { background: linear-gradient(180deg, #001A56, #002a7a); }
        .stat-card.red::before { background: linear-gradient(180deg, #F21517, #ff4757); }
        .stat-card.green::before { background: linear-gradient(180deg, #00d4aa, #00b894); }
        .stat-card.orange::before { background: linear-gradient(180deg, #f9c74f, #f8961e); }
        .stat-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15); }
        .stat-icon {
            width: 60px; height: 60px; border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            font-size: 28px; margin-bottom: 20px;
        }
        .stat-card.blue .stat-icon { background: rgba(0, 26, 86, 0.1); color: #001A56; }
        .stat-card.red .stat-icon { background: rgba(242, 21, 23, 0.1); color: #F21517; }
        .stat-card.green .stat-icon { background: rgba(0, 212, 170, 0.1); color: #00d4aa; }
        .stat-card.orange .stat-icon { background: rgba(249, 199, 79, 0.1); color: #f9c74f; }
        .stat-value { font-size: 36px; font-weight: 800; color: #333; margin-bottom: 5px; }
        .stat-label { font-size: 14px; color: #666; font-weight: 500; }
        
        .quick-actions {
            background: white; border-radius: 15px; padding: 30px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); margin-bottom: 40px;
        }
        .section-title {
            font-size: 20px; font-weight: 700; color: #001A56; margin-bottom: 25px;
            display: flex; align-items: center; gap: 12px;
        }
        .section-title i { color: #F21517; }
        .actions-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;
        }
        .action-btn {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 30px 20px; background: #f8f9fa;
            border: 2px solid #e5e5e5; border-radius: 12px;
            cursor: pointer; transition: all 0.3s ease; text-decoration: none; gap: 15px;
        }
        .action-btn:hover {
            background: #001A56; border-color: #001A56;
            transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0, 26, 86, 0.2);
        }
        .action-btn i { font-size: 36px; color: #001A56; transition: color 0.3s ease; }
        .action-btn:hover i { color: white; }
        .action-btn span { font-size: 15px; font-weight: 600; color: #333; transition: color 0.3s ease; }
        .action-btn:hover span { color: white; }
        
        .recent-activity {
            background: white; border-radius: 15px; padding: 30px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }
        .activity-list { display: flex; flex-direction: column; gap: 15px; }
        .activity-item {
            display: flex; align-items: center; gap: 15px;
            padding: 15px; background: #f8f9fa; border-radius: 10px;
            transition: all 0.3s ease;
        }
        .activity-item:hover { background: #f0f2f5; }
        .activity-icon {
            width: 45px; height: 45px; border-radius: 10px;
            display: flex; align-items: center; justify-content: center; font-size: 20px;
        }
        .activity-icon.blue { background: rgba(0, 26, 86, 0.1); color: #001A56; }
        .activity-icon.green { background: rgba(0, 212, 170, 0.1); color: #00b894; }
        .activity-content { flex: 1; }
        .activity-title { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 3px; }
        .activity-time { font-size: 13px; color: #888; }
        
        @media (max-width: 768px) {
            .dashboard-header { padding: 15px 20px; flex-direction: column; gap: 20px; }
            .dashboard-user { width: 100%; justify-content: space-between; }
            .dashboard-content { padding: 20px; }
            .welcome-banner { flex-direction: column; text-align: center; gap: 20px; padding: 25px; }
            .welcome-date { text-align: center; }
            .actions-grid { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
</head>
<body>
    <header class="dashboard-header">
        <div class="dashboard-logo">
            <img src="assets/images/20210512190118_logo_21.png" alt="PTS NEWS">
            <div>
                <h1>PTS NEWS</h1>
                <span>Admin Panel</span>
            </div>
        
        <div class="dashboard-user">
            <div class="user-info">
                <div class="user-avatar"><i class="ri-user-line"></i></div>
                <div class="user-details">
                    <div class="user-name"><?php echo htmlspecialchars($adminName); ?></div>
                    <div class="user-role"><?php echo htmlspecialchars(ucfirst($adminRole)); ?></div>
            </div>
            <a href="?logout=1" class="logout-btn">
                <i class="ri-logout-box-r-line"></i>
                <span>Logout</span>
            </a>
        </div>
    </header>

    <main class="dashboard-content">
        <h1 class="dashboard-title">Dashboard Overview</h1>
        
        <div class="welcome-banner">
            <div class="welcome-text">
                <h2>Welcome back, <?php echo htmlspecialchars($adminName); ?>!</h2>
                <p>Here's what's happening with your news portal today.</p>
            </div>
            <div class="welcome-date">
                <div class="date" id="currentDate"></div>
                <div class="time" id="currentTime"></div>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card blue">
                <div class="stat-icon"><i class="ri-article-line"></i></div>
                <div class="stat-value">1,234</div>
                <div class="stat-label">Total Articles</div>
            <div class="stat-card red">
                <div class="stat-icon"><i class="ri-eye-line"></i></div>
                <div class="stat-value">45.2K</div>
                <div class="stat-label">Total Views</div>
            <div class="stat-card green">
                <div class="stat-icon"><i class="ri-user-follow-line"></i></div>
                <div class="stat-value">8,547</div>
                <div class="stat-label">Subscribers</div>
            <div class="stat-card orange">
                <div class="stat-icon"><i class="ri-message-3-line"></i></div>
                <div class="stat-value">342</div>
                <div class="stat-label">Comments</div>
        </div>
        
        <div class="quick-actions">
            <h2 class="section-title"><i class="ri-flashlight-line"></i>Quick Actions</h2>
            <div class="actions-grid">
                <a href="#" class="action-btn"><i class="ri-add-circle-line"></i><span>Add Article</span></a>
                <a href="#" class="action-btn"><i class="ri-image-add-line"></i><span>Upload Media</span></a>
                <a href="#" class="action-btn"><i class="ri-user-settings-line"></i><span>Manage Users</span></a>
                <a href="#" class="action-btn"><i class="ri-settings-3-line"></i><span>Settings</span></a>
                <a href="#" class="action-btn"><i class="ri-bar-chart-line"></i><span>Analytics</span></a>
                <a href="#" class="action-btn"><i class="ri-mail-send-line"></i><span>Newsletter</span></a>
            </div>
        
        <div class="recent-activity">
            <h2 class="section-title"><i class="ri-time-line"></i>Recent Activity</h2>
            <div class="activity-list">
                <div class="activity-item">
                    <div class="activity-icon blue"><i class="ri-edit-line"></i></div>
                    <div class="activity-content">
                        <div class="activity-title">Article "Climate Summit Updates" was published</div>
                        <div class="activity-time">2 minutes ago</div>
                </div>
                <div class="activity-item">
                    <div class="activity-icon green"><i class="ri-user-add-line"></i></div>
                    <div class="activity-content">
                        <div class="activity-title">New subscriber: john.doe@email.com</div>
                        <div class="activity-time">15 minutes ago</div>
                </div>
                <div class="activity-item">
                    <div class="activity-icon blue"><i class="ri-image-line"></i></div>
                    <div class="activity-content">
                        <div class="activity-title">5 images uploaded to media library</div>
                        <div class="activity-time">1 hour ago</div>
                </div>
                <div class="activity-item">
                    <div class="activity-icon green"><i class="ri-check-line"></i></div>
                    <div class="activity-content">
                        <div class="activity-title">System backup completed successfully</div>
                        <div class="activity-time">3 hours ago</div>
                </div>
        </div>
    </main>

    <script>
        function updateDateTime() {
            const now = new Date();
            const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', dateOptions);
            document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        updateDateTime();
        setInterval(updateDateTime, 1000);
    </script>
</body>
</html>
