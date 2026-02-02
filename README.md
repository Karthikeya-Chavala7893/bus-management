# Bus Tracker - College Bus Management System

A lightweight, offline-capable bus tracking system for college campuses.

## Quick Start

### Method 1: Using the Batch Script (Windows)
1. Double-click `start-server.bat`
2. The browser will open automatically to `http://localhost:8080`

### Method 2: Using Python
```bash
cd "bus management"
python -m http.server 8080
```
Then open `http://localhost:8080` in your browser.

### Method 3: Using Node.js (live-server)
```bash
npx -y live-server --port=8080
```

## Important Notes

⚠️ **DO NOT** open the HTML files directly in your browser (using `file://` protocol).
The application uses relative paths and service workers that require a proper web server.

## Portals

The system has three portals:

1. **Student Portal** (`/student/`) - Track buses, view ETAs, get notifications
2. **Driver Portal** (`/driver/`) - Check-in at stops, manage trips
3. **Admin Dashboard** (`/admin/`) - Fleet management, analytics, settings

## Test Credentials

For testing purposes, you can use any ID/password combination:
- Student: Any ID + any password
- Driver: Any ID + 4-digit PIN
- Admin: Any email + any password

## Troubleshooting

### 404 Error on Login
If you see a 404 error when trying to login:

1. **Clear your browser cache** (Ctrl+Shift+Delete)
2. **Clear service worker caches**:
   - Open browser DevTools (F12)
   - Go to Application tab → Service Workers
   - Click "Unregister" for all service workers
   - Go to Storage → Cache Storage
   - Delete all caches
3. **Restart the server** and try again

### Pages Not Loading
Make sure you're accessing the app through `http://localhost:8080` and not by opening files directly.

## Technology Stack

- Vanilla HTML/CSS/JavaScript
- No framework dependencies
- Works offline (Service Workers)
- Progressive Web App (PWA) capable
- Chart.js for admin analytics

## Project Structure

```
bus management/
├── index.html          # Root redirect
├── start-server.bat    # Easy startup script
├── landing/            # Landing page with login
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── sw.js
├── student/            # Student portal
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── sw.js
├── driver/             # Driver app
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── sw.js
└── admin/              # Admin dashboard
    ├── index.html
    ├── styles.css
    ├── app.js
    └── sw.js
```
