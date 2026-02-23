# PTS News - Going Live Checklist

## 1. Deploy to GoDaddy (Recommended for PHP)

### Step 1: Upload Files to GoDaddy
1. Login to your GoDaddy account
2. Go to **cPanel** (under Web Hosting)
3. Click **File Manager** → **public_html**
4. Delete default files (index.html, etc.)
5. Click **Upload** → Select all your website files
6. Wait for upload to complete

### Step 2: Create Database in GoDaddy
1. In cPanel, click **MySQL Databases**
2. Create new database: `pts_admin`
3. Create username: `pts_admin_user`
4. Create password: Use a strong password generator
5. **Add User to Database** → Check **ALL PRIVILEGES**
6. Click **Make Changes**

### Step 3: Import Database
1. In cPanel, click **phpMyAdmin**
2. Click your database (`pts_admin`) in left panel
3. Click **Import** tab
4. Click **Choose File** → Select `database-setup.sql`
5. Scroll down and click **Go**

### Step 4: Configure Database Connection
1. In File Manager, edit `.env` file (in root directory)
2. Update these values with your actual database credentials:

```env
DB_HOST=localhost
DB_NAME=pts_admin
DB_USER=pts_admin_user
DB_PASS=YourPassword123
APP_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
CORS_ALLOWED_ORIGIN=https://ptsnews.in
```

> **Important:** Change `DB_PASS` to your actual database password!

### Step 5: Get Free SSL Certificate
1. In cPanel, search **SSL/TLS**
2. Click **Install Let's Encrypt SSL**
3. Select your domain: `ptsnews.in`
4. Check **www ptsnews.in** if wanted
5. Click **Install**
6. After install, click **Force HTTPS** redirect

### Step 6: Test Your Website
- Visit: `https://ptsnews.in`
- Test newsletter subscription
- Test contact form
- Check all pages load correctly

---

## 2. SSL Certificate (Let's Encrypt - Free)

### Option A: Using cPanel (Already covered above)
1. Login to your hosting cPanel
2. Look for "SSL/TLS" or "Let's Encrypt" icon
3. Click "Install Let's Encrypt SSL"
4. Select your domain (ptsnews.in)
5. Click "Install"
6. Enable "Force HTTPS" redirect

### Option B: If using Cloudflare (Recommended)
1. Go to [Cloudflare.com](https://cloudflare.com) and sign up
2. Add your domain (ptsnews.in)
3. Cloudflare will scan your DNS records
4. Update nameservers at your domain registrar to Cloudflare's nameservers
5. In Cloudflare dashboard, go to SSL/TLS → Overview
6. Set SSL mode to "Full" or "Full (Strict)"
7. Enable "Always Use HTTPS" in the Rules tab

### Option C: If using VPS with Certbot
```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache

# Get SSL certificate
sudo certbot --apache -d ptsnews.in -d www.ptsnews.in

# Auto-renewal (Certbot handles this automatically)
```

---

## 2. Google Analytics Setup

### Step 1: Create GA4 Property
1. Go to [analytics.google.com](https://analytics.google.com)
2. Sign in with your Google account
3. Click "Start Measuring"
4. Enter property name: "PTS NEWS"
5. Select your business size and timezone
6. Click "Create"

### Step 2: Get Measurement ID
1. In GA4 dashboard, click the gear icon (Admin)
2. Click "Data Streams" → "Web"
3. Click your website stream
4. Copy the "Measurement ID" (starts with G-XXXXXXXX)

### Step 3: Update Your Website
Edit `includes/analytics-head.html` and replace the Measurement ID:

```javascript
// Change this:
gtag('config', 'G-XXXXXXXXXX');

// To your actual ID, for example:
gtag('config', 'G-ABC123DEF');
```

### Step 4: Verify Tracking
1. Go to your website
2. In GA4, click "Realtime" in the left menu
3. You should see yourself as active user

---

## 3. Database Setup

### Step 1: Create Database (in cPanel)
1. Login to cPanel
2. Click "MySQL Databases"
3. Create new database: `pts_admin`
4. Create user: `pts_admin_user`
5. Assign user to database with ALL PRIVILEGES
6. Note down: Database name, Username, Password

### Step 2: Create Tables
Instead of running SQL manually, use the prepared `database-setup.sql` file:

1. In cPanel, click **phpMyAdmin**
2. Click your database (`pts_admin`) in left panel
3. Click **Import** tab
4. Click **Choose File** → Select `database-setup.sql` (from your website files)
5. Scroll down and click **Go**

### Step 3: Configure config.php
Edit `includes/config.php`:
```php
// Update these values with your actual database credentials
define('DB_HOST', 'localhost');
define('DB_NAME', 'pts_admin');
define('DB_USER', 'pts_admin_user');
define('DB_PASS', 'your_actual_password_here');
```

---

## 4. Test Before Launch

- [ ] SSL certificate is working (https://ptsnews.in)
- [ ] All pages load without errors
- [ ] Newsletter form submits successfully
- [ ] Contact form submits and sends email
- [ ] Google Analytics shows realtime visitors
- [ ] Mobile responsive on all devices
- [ ] All links work correctly
- [ ] Images load properly

---

## Support
For issues, check your hosting provider's documentation or contact their support team.
