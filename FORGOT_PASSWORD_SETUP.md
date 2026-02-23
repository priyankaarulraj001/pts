PTS NEWS - Forgot Password Feature Setup Requirements
=====================================================

For the forgot password feature to work when the website is hosted,
the following configurations must be completed:

REQUIREMENT 1: Set up the MySQL Database
----------------------------------------
1. Login to cPanel (GoDaddy or your hosting provider)
2. Open phpMyAdmin
3. Select your database (pts_admin)
4. Click Import tab
5. Choose file: database-setup.sql
6. Click Go to import

This will create the required tables:
- admin_users (with default admin user)
- password_resets (for storing reset tokens)


REQUIREMENT 2: Configure .env File
----------------------------------
Edit the .env file in your website root with your actual database credentials:

DB_HOST=localhost
DB_NAME=pts_admin
DB_USER=pts_admin_user
DB_PASS=your_actual_database_password
APP_KEY=your_app_key_here


REQUIREMENT 3: Enable PHP Mail()
--------------------------------
Most hosting providers have PHP mail() enabled by default. 
If emails are not being sent:
- Check spam folder
- Contact hosting provider support
- Consider using SMTP for reliable email delivery


DEFAULT ADMIN CREDENTIALS
-------------------------
After database setup, the default admin user is:
- Username: admin
- Email: admin@ptsnews.in
- Password: admin123 (CHANGE THIS IN PRODUCTION!)


TESTING THE FEATURE
-------------------
1. Navigate to admin-login.html
2. Click "Forgot password?"
3. Enter username: admin
4. Check email for reset link
5. Click the link and set new password
6. Login with new password


NOTES
-----
- Reset links expire after 1 hour
- Password must be at least 6 characters
- Security events are logged in logs/security_*.log

