<p align="center">
  <img src="https://img.shields.io/badge/Project-BusTrack-2563EB?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxyZWN0IHg9IjMiIHk9IjYiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxMiIgcng9IjIiLz48Y2lyY2xlIGN4PSI3IiBjeT0iMTgiIHI9IjIiLz48Y2lyY2xlIGN4PSIxNyIgY3k9IjE4IiByPSIyIi8+PC9zdmc+" alt="BusTrack" />
  <img src="https://img.shields.io/badge/Version-1.0-green?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License" />
</p>

<h1 align="center">🚌 BusTrack — College Bus Management System</h1>

<p align="center">
  <strong>A real-time campus bus tracking, seat booking, and notification platform</strong><br>
  <em>Built entirely with Vanilla HTML, CSS & JavaScript — No frameworks, no dependencies</em>
</p>

<p align="center">
  <a href="#-project-objective">Objective</a> •
  <a href="#-the-problem">Problem</a> •
  <a href="#-the-solution">Solution</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-folder-structure">Folder Structure</a>
</p>

---

## 🎯 Project Objective

> **Build a lightweight, offline-capable web application that solves the everyday problem of college students missing their campus buses by providing real-time tracking, seat booking, and admin-to-student notifications — all without requiring any backend server or database.**

BusTrack is designed with one goal in mind: **make campus transportation predictable and stress-free** for every student, driver, and administrator.

---

## ❌ The Problem

Every day on college campuses, students face these frustrations:

| Problem | Impact |
|---------|--------|
| 🕐 **No idea when the bus will arrive** | Students waste 15–30 mins waiting at stops |
| 📱 **No way to know if seats are available** | Overcrowded buses, missed classes |
| 🔇 **No communication from admin → students** | Delay info doesn't reach students in time |
| 🚌 **Drivers have no easy check-in system** | No data on bus location for tracking |
| 📊 **Admin has no analytics** | Can't optimize routes or bus allocation |

---

## ✅ The Solution

BusTrack solves all of these with a **Single Page Application (SPA)** that has:

| Solution | How It Helps |
|----------|-------------|
| 📍 **Live Bus Tracking** | Students see real-time bus position (which stop it's at) |
| 🎫 **One-Click Seat Booking** | Reserve a seat instantly, with auto-cancellation of old bookings |
| 📢 **Admin → Student Notifications** | Admin can broadcast alerts (delays, cancellations, changes) |
| ▶️ **Driver One-Tap Check-In** | Drivers mark each stop with a single button press |
| 📊 **Admin Analytics Dashboard** | Charts showing passenger trends, route usage, fleet status |
| 📶 **Works Offline (PWA)** | Service Workers cache the app — works even without internet |

---

## 🔄 How It Works — Complete Workflow

### The Big Picture

```
┌─────────────┐     ┌─────────────────────────┐     ┌──────────────┐
│   STUDENT   │     │      BusTrack App        │     │    DRIVER    │
│             │     │                           │     │              │
│ • View Bus  │◄───►│   📱 Landing Page         │◄───►│ • Start Trip │
│ • Book Seat │     │   🔐 Login Modal          │     │ • Mark Stops │
│ • Get Alerts│     │   📊 Dashboard            │     │ • End Trip   │
└─────────────┘     │   💾 LocalStorage         │     └──────────────┘
                    │   ⚡ Service Workers       │
┌─────────────┐     │                           │
│    ADMIN    │◄───►│                           │
│             │     └─────────────────────────┘
│ • Analytics │
│ • Send Alerts│
│ • Fleet View │
└─────────────┘
```

### Step-by-Step Workflow

```
Step 1: User opens the app
        ↓
Step 2: Landing page loads → Shows features, stats, role cards
        ↓
Step 3: User clicks "Get Started" or a role card
        ↓
Step 4: Login Modal appears → Select role (Student/Driver/Admin)
        ↓
Step 5: Enter ID/Email & Password → Submit
        ↓
Step 6: App navigates to the role-specific portal (hash routing: #/student, #/driver, #/admin)
        ↓
Step 7: User interacts with their portal (details below)
        ↓
Step 8: All data saved to localStorage (bookings, notifications, settings)
        ↓
Step 9: Service Worker caches everything → App works offline!
```

---

## 👥 Three User Roles — Detailed Explanation

### 1️⃣ Student Portal 👨‍🎓

> **Purpose**: Students can track buses, book seats, and receive alerts from admin.

**What a student can do:**

| Feature | What It Does | How It Works (Technically) |
|---------|-------------|---------------------------|
| 🏠 **Home** | Shows next bus arrival, saved routes with ETA | Displays pre-configured route data with stop counts |
| 🚌 **Browse Routes** | View all available routes (Main Campus Loop, Hostel Express, Engineering Loop, City Center Shuttle) | Renders a list with route badges, stop count, and booking buttons |
| 🎫 **Book Seat** | Reserve a seat on any active route | Calls `addBooking()` → saves to `localStorage.busBookings` → only ONE active booking allowed at a time |
| ↩️ **Auto-Cancel** | When booking a new seat, old booking is automatically cancelled | `addBooking()` iterates through existing bookings and marks old ones as `status: 'cancelled'` |
| 🔔 **Notifications** | View alerts sent by the admin (delays, changes, cancellations) | Reads from `localStorage.busNotifications` → marks all as read when page opens |
| ⚙️ **Settings** | Toggle push/SMS/email notifications, set default stop, logout | Saves preferences to `localStorage.bustrack_settings` |

**Student Booking Rule (Important!):**
> A student can only have **ONE active booking at a time**. If they book a new seat, the previous booking is automatically cancelled. This prevents seat hoarding.

---

### 2️⃣ Driver Portal 🚌

> **Purpose**: Drivers can start trips, mark each stop as reached, and complete the route.

**What a driver can do:**

| Feature | What It Does | How It Works (Technically) |
|---------|-------------|---------------------------|
| ▶️ **Start Trip** | Begin driving Route 5 (Engineering Loop) | Button changes from "START TRIP" → "REACHED STOP", `driverTripState` changes from `'ready'` to `'started'` |
| ✓ **Mark Stop** | At each stop, driver taps button to mark it as reached | `driverCurrentStop` increments from 1 to 7, UI updates with CSS classes `.completed`, `.current`, `.upcoming` |
| 📊 **Progress** | Shows how many stops completed (e.g., 4/7) | Progress counter updates in real-time |
| 🏁 **Complete Trip** | After all 7 stops, trip is marked complete | Button changes to "TRIP COMPLETE" with green gradient, toast says "🎉 Trip completed!" |
| 🔄 **New Trip** | Reset and start a fresh trip | `driverTripState` resets to `'ready'`, counter goes back to 0/7 |

**The 7 Stops on Engineering Loop (Route 5):**
1. Main Gate
2. Library
3. Science Block
4. Medical Center
5. Admin Block
6. Engineering Block
7. Hostel Gate

**Driver Menu Options:**
- 🏠 Back to Home
- 📅 Today's Schedule
- 📋 Trip History
- ⚙️ Settings
- 🚨 Emergency
- 🚪 Logout

---

### 3️⃣ Admin Dashboard 👨‍💼

> **Purpose**: Administrators can monitor the entire fleet, view analytics, manage routes, and send notifications to students.

**What an admin can do:**

| Feature | What It Does | How It Works (Technically) |
|---------|-------------|---------------------------|
| 📊 **Dashboard** | Overview with 4 metric cards + 2 charts + fleet status | Shows Total Buses (12), Active Routes (5), Bookings Today (live), On-Time Rate (94%) |
| 🚌 **Live Fleet** | Table showing all buses, their routes, drivers, and status | Displays Bus 101 (Active), Bus 102 (Active), Bus 103 (Delayed) with last update time |
| 🗺️ **Routes** | Table of all routes with stop count, schedule, and status | Shows R001 (Engineering Loop), R002 (Hostel Express), R003 (City Center - Inactive) |
| 📈 **Analytics** | Bar chart of daily ridership (last 30 days) + summary metrics | Uses **Chart.js** to render: Passenger Trends (Line chart), Route Distribution (Doughnut chart), Daily Ridership (Bar chart) |
| 📢 **Send Notification** | Compose and send alerts to all students | Form with Title, Type (Info/Warning/Success/Alert), Message → calls `sendAdminNotification()` → saved to `localStorage.busNotifications` |

**Admin Dashboard Metrics:**
| Metric | Value | Description |
|--------|-------|-------------|
| Total Buses | 12 | Fleet size (+2 this month) |
| Active Routes | 5 | Currently operating routes |
| Bookings Today | Live | Real-time count from localStorage |
| On-Time Rate | 94% | Percentage of on-time trips |

---

## 🔔 Notification System — How It Works

This is one of the most important features. Here's the complete flow:

```
ADMIN                           LOCAL STORAGE                      STUDENT
  │                                  │                                │
  │ 1. Types title, message,         │                                │
  │    selects type (info/warning)   │                                │
  │                                  │                                │
  │ 2. Clicks "Send Notification"   │                                │
  │──────────────────────────────►   │                                │
  │                                  │ Saves as JSON object:          │
  │                                  │ {                              │
  │                                  │   id: Date.now(),              │
  │                                  │   title: "...",                │
  │                                  │   message: "...",              │
  │                                  │   type: "warning",             │
  │                                  │   sender: "Admin",             │
  │                                  │   timestamp: "ISO string",     │
  │                                  │   read: false                  │
  │                                  │ }                              │
  │                                  │                                │
  │                                  │   3. Student opens Alerts page │
  │                                  │◄────────────────────────────── │
  │                                  │                                │
  │                                  │   4. Returns all notifications │
  │                                  │──────────────────────────────► │
  │                                  │                                │
  │                                  │   5. Student sees alert with   │
  │                                  │      icon, time ago, message   │
  │                                  │                                │
  │                                  │   6. markAllNotificationsRead()│
  │                                  │◄────────────────────────────── │
```

**Notification Types:**
| Type | Icon | Use Case |
|------|------|----------|
| `info` | 🚌 | General updates ("New route added") |
| `warning` | ⚠️ | Delays ("Route 5 delayed by 10 minutes") |
| `success` | ✅ | Positive updates ("Service restored") |
| `alert` | 🔔 | Urgent notices ("Route cancelled today") |

---

## 🎫 Seat Booking System — How It Works

```
Student clicks "Book Seat" on a route
        ↓
addBooking() function is called
        ↓
Check: Does this student have an existing active booking today?
        ↓
    ┌───YES───┐         ┌───NO───┐
    │         │         │        │
    ↓         │         ↓        │
Cancel the    │    Create new     │
old booking   │    booking        │
(status →     │    directly       │
'cancelled')  │         │        │
    │         │         │        │
    ↓         │         ↓        │
Create new    │    Save to       │
booking       │    localStorage  │
    │         │         │        │
    ↓         │         ↓        │
Show toast:   │    Show toast:   │
"Booked!      │    "Booked on    │
Previous      │    Route X!"     │
cancelled"    │         │        │
    │         │         │        │
    └─────────┘─────────┘        │
              ↓                  │
     Update admin dashboard      │
     booking count (live)        │
```

**Booking Data Structure (saved in localStorage):**
```javascript
{
  bookings: [
    {
      id: 1706889600000,        // Unique timestamp ID
      routeId: "R001",          // Route identifier
      routeName: "Main Campus Loop",
      stopName: "Engineering Block",
      studentId: "STU123",      // From login
      date: "2026-02-02",       // Today's date
      time: "08:30 PM",         // Booking time
      status: "confirmed"       // or "cancelled"
    }
  ],
  lastUpdated: "2026-02-02T15:00:00Z"
}
```

---

## 🛠️ Tech Stack & Implementation Workflow

![Tech Stack and Implementation Workflow](./tech_stack_workflow.png)

### Technologies Used

| Technology | Purpose | Why This Choice? |
|-----------|---------|-----------------|
| **HTML5** | Structure & layout | Semantic elements, accessibility, SEO |
| **CSS3** | Styling & animations | Gradients, flexbox, grid, responsive design |
| **Vanilla JavaScript** | All application logic | No framework overhead, lightweight, fast |
| **Chart.js (v4.4)** | Analytics charts (Admin dashboard) | Lightweight, responsive, beautiful charts |
| **LocalStorage** | Data persistence (bookings, notifications, settings) | No backend needed, instant read/write |
| **Service Workers** | Offline support (PWA) | Cache-first strategy, background sync |
| **Python HTTP Server** | Local development server | Zero-config, built into Python |
| **Web App Manifest** | PWA installability | Add to home screen on mobile |

### Why No Backend?

> This project intentionally uses **no backend server or database**. Here's why:
> - **Simplicity**: Students/developers can run it with a single command
> - **Zero dependencies**: No Node.js, no npm install, no database setup
> - **Offline-first**: Everything works without internet
> - **Learning**: Teaches pure web fundamentals (HTML, CSS, JS)
> - **Deployable anywhere**: Any static file host (GitHub Pages, Netlify, etc.)

---

## 📁 Folder Structure — Every File Explained

![Folder Structure Diagram](./folder_structure_diagram.png)

```
bus-management/
│
│── 📄 index.html              # 🌐 MAIN ENTRY POINT — The SPA shell
│                               #    Contains ALL four views (Landing, Student,
│                               #    Driver, Admin) in a single HTML file.
│                               #    Views are toggled via CSS class 'active'.
│                               #    1050 lines, includes Login Modal, Toast, etc.
│
│── 📄 app.js                   # ⚙️ CORE APPLICATION LOGIC — The brain of the app
│                               #    1173 lines of pure JavaScript. Contains:
│                               #    • AppState management (current view, role, login)
│                               #    • Hash-based SPA router (#/student, #/driver, #/admin)
│                               #    • Booking system (add, cancel, auto-cancel)
│                               #    • Notification system (send, read, mark)
│                               #    • Driver trip management (start, mark stop, complete)
│                               #    • Admin charts (Chart.js initialization)
│                               #    • Login/logout with localStorage persistence
│                               #    • Toast notifications & offline detection
│
│── 📄 styles.css               # 🎨 GLOBAL STYLESHEET — All visual design
│                               #    52KB of CSS covering ALL views:
│                               #    • Landing page (hero, features, role cards, footer)
│                               #    • Student portal (mobile-first, bottom nav, cards)
│                               #    • Driver portal (large buttons, stop list, sidebar)
│                               #    • Admin dashboard (sidebar, metrics, charts, tables)
│                               #    • Login modal, toast notifications, offline banner
│                               #    • Responsive design (mobile, tablet, desktop)
│
│── 📄 start-server.bat         # 🖥️ ONE-CLICK SERVER LAUNCHER
│                               #    Windows batch file that:
│                               #    1. Opens browser at http://localhost:8080
│                               #    2. Starts Python HTTP server on port 8080
│                               #    Just double-click to run!
│
│── 📄 README.md                # 📖 This documentation file
│
├── 📁 student/                 # 👨‍🎓 STANDALONE STUDENT PORTAL (PWA)
│   │                           #    A separate, full-featured student app
│   │                           #    that can run independently as a PWA.
│   │
│   ├── 📄 index.html           #    Student UI with pages: Home, Routes,
│   │                           #    Tracking, Notifications, Settings
│   ├── 📄 app.js               #    728 lines — State management, navigation,
│   │                           #    favorites, search, offline sync, service
│   │                           #    worker registration, report system
│   ├── 📄 styles.css           #    Student-specific styles (blue theme)
│   ├── 📄 sw.js                #    Service Worker — Cache-first for static
│   │                           #    assets, network-first for API calls,
│   │                           #    push notifications, background sync
│   └── 📄 manifest.json        #    PWA manifest (theme: #2563EB blue)
│
├── 📁 driver/                  # 🚌 STANDALONE DRIVER PORTAL (PWA)
│   │                           #    Minimalist driver app optimized for
│   │                           #    one-handed use while driving.
│   │
│   ├── 📄 index.html           #    Large buttons, simple layout, trip view
│   ├── 📄 app.js               #    Trip state machine, stop marking,
│   │                           #    GPS mock, offline queue
│   ├── 📄 styles.css           #    Driver-specific styles (green theme)
│   ├── 📄 sw.js                #    Service Worker for offline check-ins
│   └── 📄 manifest.json        #    PWA manifest (theme: #10B981 green)
│
├── 📁 admin/                   # 👨‍💼 STANDALONE ADMIN DASHBOARD
│   │                           #    Full-featured admin panel with sidebar
│   │                           #    navigation and data visualization.
│   │
│   ├── 📄 index.html           #    Sidebar + content layout, metric cards,
│   │                           #    data tables, notification form
│   ├── 📄 app.js               #    Chart initialization, fleet management,
│   │                           #    notification sending, data refresh
│   ├── 📄 styles.css           #    Admin-specific styles (dark sidebar theme)
│   ├── 📄 sw.js                #    Service Worker for dashboard caching
│   └── 📄 manifest.json        #    PWA manifest (theme: #1E40AF dark blue)
│
├── 📁 landing/                 # 🏠 STANDALONE LANDING PAGE
│   │                           #    The welcome page users see first.
│   │                           #    Showcases features and provides login.
│   │
│   ├── 📄 index.html           #    Hero section, feature grid, role cards,
│   │                           #    how-it-works steps, statistics, footer
│   ├── 📄 app.js               #    Login modal handling, role selection,
│   │                           #    redirect to portals, smooth scrolling
│   ├── 📄 styles.css           #    Landing-specific styles with gradients
│   └── 📄 sw.js                #    Service Worker for offline landing page
│
└── 📁 venv/                    # 🐍 PYTHON VIRTUAL ENVIRONMENT
                                #    Used by start-server.bat for Python's
                                #    built-in HTTP server. Not project code.
```

---

## 🏗️ System Architecture — How Everything Connects

```
┌─────────────────────────────────────────────────────────────────────┐
│                        🌐 BROWSER (Client-Side Only)                │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    index.html (SPA Shell)                      │  │
│  │                                                               │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │  │
│  │  │ Landing  │  │ Student  │  │  Driver  │  │  Admin   │     │  │
│  │  │  View    │  │  View    │  │  View    │  │  View    │     │  │
│  │  │ #/       │  │ #/student│  │ #/driver │  │ #/admin  │     │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │  │
│  │       │              │             │              │           │  │
│  │       └──────────────┴─────────────┴──────────────┘           │  │
│  │                           │                                   │  │
│  │                    ┌──────┴──────┐                            │  │
│  │                    │   app.js    │ ← Hash Router              │  │
│  │                    │  (1173 ln) │ ← State Manager             │  │
│  │                    │            │ ← Event Handlers            │  │
│  │                    └──────┬──────┘                            │  │
│  │                           │                                   │  │
│  └───────────────────────────┼───────────────────────────────────┘  │
│                              │                                      │
│  ┌───────────────────────────┼───────────────────────────────────┐  │
│  │                    💾 LocalStorage                             │  │
│  │                                                               │  │
│  │  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────┐  │  │
│  │  │ busBookings │  │ busNotifications │  │  userRole       │  │  │
│  │  │ (JSON)      │  │ (JSON Array)     │  │  userId         │  │  │
│  │  └─────────────┘  └──────────────────┘  │  bustrack_*     │  │  │
│  │                                          └─────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    ⚡ Service Workers (PWA)                    │  │
│  │                                                               │  │
│  │  • Cache-first for static assets (HTML, CSS, JS)              │  │
│  │  • Network-first for API calls                                │  │
│  │  • Offline fallback to cached index.html                      │  │
│  │  • Push notification handling                                 │  │
│  │  • Background sync for pending changes                        │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    📊 Chart.js (CDN)                           │  │
│  │                                                               │  │
│  │  • Passenger Trends Line Chart (7 days)                       │  │
│  │  • Route Distribution Doughnut Chart                          │  │
│  │  • Daily Ridership Bar Chart (30 days)                        │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started — Run the Project

### Prerequisites

| Requirement | Why Needed | How to Check |
|-------------|-----------|--------------|
| **Python 3.x** | To run the local development HTTP server | Run `python --version` in terminal |
| **Web Browser** | To view the application (Chrome/Firefox/Edge) | Any modern browser works |

> 💡 **That's it!** No Node.js, no npm, no database, no complex setup.

### Method 1: One-Click Start (Windows)

```
1. Double-click start-server.bat
2. Browser opens automatically at http://localhost:8080
3. Done! 🎉
```

### Method 2: Manual Start (Any OS)

```bash
# Step 1: Navigate to the project folder
cd bus-management

# Step 2: Start Python's built-in HTTP server
python -m http.server 8080

# Step 3: Open your browser
# Go to: http://localhost:8080
```

### Method 3: Using Live Server (VS Code)

```
1. Install the "Live Server" extension in VS Code
2. Right-click on index.html → "Open with Live Server"
3. The app opens in your browser automatically
```

### After Starting:

1. **Landing Page** loads with features, stats, and role selection
2. Click **"Get Started"** or choose a role card
3. **Login** with any ID and password (no validation — it's a demo)
4. Explore the **Student**, **Driver**, or **Admin** portal!

---

## ⚙️ Key Technical Concepts — For Learners

### 1. Single Page Application (SPA) Architecture

> **What is SPA?** Instead of loading a new HTML page for every screen, the entire app is in **one HTML file** (`index.html`). Different "pages" are just different `<section>` elements that are shown/hidden using CSS.

```javascript
// How hash routing works in this project:
// URL: http://localhost:8080/#/student  →  Shows student view
// URL: http://localhost:8080/#/driver   →  Shows driver view
// URL: http://localhost:8080/#/admin    →  Shows admin view

function navigateTo(viewName) {
    // 1. Hide ALL views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    
    // 2. Show the target view
    document.getElementById(`view-${viewName}`).classList.add('active');
    
    // 3. Update the URL hash
    history.pushState(null, '', `#/${viewName}`);
}
```

### 2. LocalStorage as a Database

> **What is LocalStorage?** It's a browser API that lets you store key-value pairs (as strings) that persist even after closing the browser. Max 5–10 MB.

```javascript
// Saving booking data:
localStorage.setItem('busBookings', JSON.stringify({
    bookings: [...],
    lastUpdated: "2026-03-23T15:00:00Z"
}));

// Reading booking data:
const data = JSON.parse(localStorage.getItem('busBookings'));
```

### 3. Service Workers (Offline Support)

> **What is a Service Worker?** It's a JavaScript file that runs in the background (separate from the main page) and can intercept network requests, cache files, and enable offline functionality.

```javascript
// How caching works:
// 1. First visit: Download and cache all static files
// 2. Next visit: Serve from cache (instant load!)
// 3. Offline: Serve cached version, show offline banner
// 4. Back online: Update cache in background
```

### 4. Progressive Web App (PWA)

> **What is PWA?** A web app that feels like a native mobile app. Users can "install" it on their phone's home screen. Requires: `manifest.json` + Service Worker + HTTPS.

Each portal has its own `manifest.json` with:
- App name and description
- Theme color (Student=Blue, Driver=Green, Admin=DarkBlue)
- Icon (SVG embedded as data URI)
- Display mode: `standalone` (no browser toolbar)

---

## 💾 Data Storage Reference

### All LocalStorage Keys Used

| Key | Type | Used By | Description |
|-----|------|---------|-------------|
| `busBookings` | JSON Object | Student, Admin | All seat bookings (today's active + cancelled) |
| `busNotifications` | JSON Array | Admin, Student | Notifications sent by admin |
| `userRole` | String | All | Current logged-in role (`student`/`driver`/`admin`) |
| `userId` | String | All | Current user's ID/email |
| `bustrack_favorites` | JSON Array | Student | Favorite route IDs |
| `bustrack_settings` | JSON Object | Student | Notification preferences, default stop |
| `bustrack_lastSync` | ISO String | Student | Last data synchronization timestamp |

---

## 🎨 UI Design Principles

| Principle | How It's Applied |
|-----------|-----------------|
| **Role-Based Colors** | Student = Blue (#3b82f6), Driver = Green (#10b981), Admin = Amber (#f59e0b) |
| **Mobile-First** | Student & Driver portals designed for phone screens first |
| **One Action per Screen** | Driver portal has ONE big button — no confusion |
| **Responsive Layout** | CSS flexbox/grid adapts to any screen size |
| **Toast Notifications** | Non-intrusive feedback for every user action |
| **Gradients & Shadows** | Modern, premium look without any images |
| **SVG Icons** | Inline SVGs for zero-latency, crisp icons at any size |

---

## 📊 Available Bus Routes

| Route ID | Route Name | Stops | Schedule | Status |
|----------|-----------|-------|----------|--------|
| R001 | Main Campus Loop | 8 stops | Every 15 mins | ✅ Active |
| R002 | Hostel Express | 6 stops | Every 20 mins | ✅ Active |
| R005 | Engineering Loop | 7 stops | Every 10 mins | ✅ Active |
| R007 | City Center Shuttle | 10 stops | Weekends only | ⬜ Inactive |

---

## 🧪 How to Test Each Feature

### Test the Student Portal:
1. Login as **Student** with any ID
2. Go to **Routes** → Click **"Book Seat"** on Engineering Loop
3. See the toast: "🎫 Seat booked on Engineering Loop!"
4. Go to **Routes** again → Book a different route → Previous booking auto-cancels
5. Go to **Alerts** → See notifications (after admin sends one)

### Test the Driver Portal:
1. Login as **Driver** with any ID
2. Click **"▶ START TRIP"** → Changes to "REACHED STOP"
3. Click **"✓ REACHED STOP"** 7 times → Watch stops turn green one by one
4. After stop 7 → "🎉 Trip completed!" → Click to reset

### Test the Admin Dashboard:
1. Login as **Admin** with any email
2. See the **Dashboard** with metrics and charts
3. Scroll down to **"📢 Send Notification"** panel
4. Enter a title, select "Warning", type a message → Click **Send**
5. Now login as Student → Go to **Alerts** → See the notification!
6. Check **Live Fleet** and **Routes** pages from the sidebar
7. Click **Analytics** → See the 30-day ridership bar chart

### Test Offline Mode:
1. Open the app in Chrome
2. Open DevTools → Application → Service Workers → Check "Offline"
3. The app still works! (offline banner appears at the top)

---

## 🎓 Who Is This Project For?

| Audience | How They Can Use This |
|----------|----------------------|
| **CS/IT Students** | As a full-stack web development project for college submissions |
| **Web Dev Beginners** | Learn SPA architecture, localStorage, Service Workers, PWA |
| **Frontend Developers** | Reference for vanilla JS app without frameworks |
| **College Administrators** | Deploy for actual campus bus tracking (with backend additions) |
| **Open Source Contributors** | Add features like real GPS, backend API, real-time WebSockets |

---

## 🔮 Future Improvements (Ideas)

| Feature | Difficulty | Description |
|---------|-----------|-------------|
| Real GPS Tracking | ⭐⭐⭐ | Use Geolocation API + Google Maps |
| Backend API (Node.js/Flask) | ⭐⭐⭐ | Replace localStorage with REST API + database |
| Real-Time Updates (WebSockets) | ⭐⭐⭐⭐ | Push live bus positions to all clients |
| QR Code Boarding | ⭐⭐ | Students scan QR to confirm boarding |
| Payment Integration | ⭐⭐⭐⭐ | Pay for bus passes through the app |
| Multi-Language Support | ⭐⭐ | Hindi, Telugu, Tamil translations |
| Accessibility (WCAG) | ⭐⭐ | Screen reader support, keyboard navigation |

---

## 📝 Important Notes

> ⚠️ **This is a frontend-only demo.** Login accepts any credentials — there is no authentication. In a production environment, you would add a proper backend with user authentication, a real database, and server-side validation.

> 💡 **LocalStorage Limitation:** Data is stored per-browser. If a student books on Chrome and opens Firefox, the booking won't appear. A backend database would solve this.

> 📱 **PWA Installation:** For the "Add to Home Screen" feature to work, the app must be served over **HTTPS**. The local Python server uses HTTP, so PWA installation only works when deployed to a hosting service.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Built with ❤️ using pure HTML, CSS & JavaScript</strong><br>
  <em>No frameworks. No dependencies. Just web fundamentals.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white" />
</p>
