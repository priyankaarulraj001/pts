# PTS News Portal - Security Checklist for Going Live

## ✅ Pre-Launch Security Checklist

### 1. Critical Security (MUST DO)
- [x] Deleted `setup.php` - prevents unauthorized database setup
- [ ] **CHANGE DEFAULT ADMIN PASSWORD** - Log in and change from 'admin123' to a strong password
- [ ] Set proper file permissions (config files should not be publicly accessible)

### 2. Server Configuration
- [ ] Enable HTTPS/SSL certificate
- [ ] Disable directory listing
- [ ] Hide PHP version in headers
- [ ] Set proper session cookie settings

### 3. Database Security
- [ ] Create strong database password
- [ ] Limit database user privileges (use least privilege)
- [ ] Enable automated backups
- [ ] Remove sample/test data

### 4. API Security
- [x] Added authentication checks to POST APIs
- [x] Restricted CORS to your domain
- [x] Added CSRF protection
- [x] Added rate limiting

### 5. File Permissions (Recommended)
```bash
# Set permissions
chmod 644 *.php *.html *.css *.js
chmod 600 includes/config.php
chmod 755 api/ includes/ assets/
```

---

## 🔐 How to Change Admin Password

1. Login to admin dashboard
2. Go to Settings/Profile
3. Update password to something strong (min 12 chars, mix of letters/numbers/symbols)

---

## 📝 Environment Variables (.env)

Copy `.env.example` to `.env` and update with your actual values:

```
DB_HOST=localhost
DB_NAME=pts_admin
DB_USER=pts_admin_user
DB_PASS=your_strong_password_here

# Generate a new APP_KEY
APP_KEY=your-random-32-character-key-here
```

---

## 🚨 If You Discover a Breach

1. **Don't panic** - Document everything
2. **Change all passwords** immediately
3. **Check admin users** in database - remove any unknown accounts
4. **Restore from backup** if needed
5. **Update security patches**
6. **Report** to appropriate authorities if data breach

---

## 📞 Emergency Contacts

- Hosting Provider: _________________
- Domain Registrar: _________________
- SSL Certificate Provider: _________________

---

*Last Updated: <?php echo date('Y-m-d H:i:s'); ?>*

