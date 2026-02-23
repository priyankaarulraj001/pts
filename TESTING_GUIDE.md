# PTS News - Website Testing Guide

## How to Test Your Website Locally

### Option 1: VSCode Live Server (Recommended)
1. Open VSCode
2. Install "Live Server" extension
3. Right-click on `index.html` → "Open with Live Server"
4. The website will open at `http://localhost:5500`

### Option 2: Python HTTP Server
```bash
# Open terminal in your project folder
cd /Users/priyanka/Website/PTS
python3 -m http.server 8000
```
Then visit: `http://localhost:8000`

---

## Testing Checklist - Frontend Pages

### 1. Homepage (index.html)
- [ ] Page loads without errors
- [ ] Logo displays correctly
- [ ] Navigation menu works (all categories)
- [ ] Breaking news ticker scrolls
- [ ] Date displays correctly
- [ ] Language switcher works (ENG, Tamil, Hindi)
- [ ] Theme toggle works (dark/light mode)
- [ ] Side navigation opens/closes
- [ ] Mobile menu works
- [ ] All sliders load (Top Stories, Trending, Video)
- [ ] AQI widget loads
- [ ] Horoscope section loads
- [ ] Newsletter form exists
- [ ] Footer links work
- [ ] Social media links exist

### 2. Article Page (article.html)
- [ ] Page loads
- [ ] Article content displays
- [ ] Featured image shows
- [ ] Category tag displays
- [ ] Share buttons work
- [ ] Related articles section shows

### 3. Contact Page (contact.html)
- [ ] Page loads
- [ ] Contact form displays
- [ ] Form validation works
- [ ] Submit shows success message

### 4. Legal Pages
- [ ] privacy-policy.html loads
- [ ] terms-of-service.html loads
- [ ] cookie-policy.html loads

---

## Testing APIs with curl

```bash
# Test Subscribe API
curl -X POST http://localhost:8000/api/subscribe.php \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test Contact API  
curl -X POST http://localhost:8000/api/contact.php \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","subject":"Test","message":"Hello"}'

# Test Dashboard Stats
curl http://localhost:8000/api/dashboard-stats.php
```

---

## Feature Testing

### Newsletter
1. Enter email in newsletter form
2. Click subscribe
3. ✅ Success message should appear

### Language Switcher
1. Click dropdown (ENG/Tamil/Hindi)
2. ✅ UI should change language

### Dark Mode
1. Click moon/sun icon
2. ✅ Theme toggles light/dark

### Contact Form
1. Fill form fields
2. Submit
3. ✅ Success message + email sent

---

## Quick Test Commands

```bash
# Start PHP server (for APIs)
cd /Users/priyanka/Website/PTS
php -S localhost:8000
```

Then visit:
- http://localhost:8000/index.html
- http://localhost:8000/article.html
- http://localhost:8000/contact.html

---

## Pre-Launch Final Check

- [ ] All pages load without errors
- [ ] All links work
- [ ] All forms submit
- [ ] Mobile responsive
- [ ] SSL installed
- [ ] Analytics tracking

