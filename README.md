# BusTrack - Project Workflow Documentation

## 📋 Project Overview

**BusTrack** is a Single Page Application (SPA) for campus bus management with three user roles: **Student**, **Driver**, and **Admin**. The system enables real-time bus tracking, seat booking, and notification management.

---

## 🔄 System Architecture

```mermaid
flowchart LR
    subgraph Users["🧑‍💻 USERS"]
        S["👨‍🎓 Student"]
        D["🚌 Driver"]
        A["👨‍💼 Admin"]
    end

    subgraph App["📱 BusTrack App"]
        SP["Student Portal<br/>📍 Track • 🎫 Book"]
        DP["Driver Portal<br/>▶️ Start • ✓ Mark"]
        AP["Admin Dashboard<br/>📊 Stats • 📢 Notify"]
    end

    subgraph DB["💾 Data Storage"]
        DATA[("Bookings<br/>Notifications<br/>Users")]
    end

    S --> SP
    D --> DP
    A --> AP
    
    SP <--> DATA
    DP <--> DATA
    AP <--> DATA

    style S fill:#3b82f6,color:#fff
    style D fill:#10b981,color:#fff
    style A fill:#f59e0b,color:#fff
    style SP fill:#eff6ff,stroke:#3b82f6
    style DP fill:#ecfdf5,stroke:#10b981
    style AP fill:#fffbeb,stroke:#f59e0b
    style DATA fill:#f1f5f9,stroke:#64748b
```

---

## 👥 User Role Workflows

### 1️⃣ Student Workflow

```mermaid
flowchart LR
    A[Login as Student] --> B[View Home]
    B --> C{Choose Action}
    C --> D[Browse Routes]
    C --> E[View Notifications]
    C --> F[Check Bookings]
    C --> G[Settings]
    
    D --> H[Book Seat]
    H --> I[Previous Booking Auto-Cancelled]
    I --> J[New Booking Confirmed]
    
    F --> K[Cancel Booking]
```

**Student Features:**
| Feature | Description |
|---------|-------------|
| **View Routes** | Browse all available bus routes with schedules |
| **Book Seat** | Reserve a seat on any active route (one booking at a time) |
| **Auto-Cancel** | Previous booking automatically cancelled when booking new seat |
| **Notifications** | Receive alerts from Admin about delays, changes, etc. |
| **View Bookings** | See current active bookings and cancel if needed |

---

### 2️⃣ Driver Workflow

```mermaid
flowchart LR
    A[Login as Driver] --> B[View Dashboard]
    B --> C[Start Trip]
    C --> D[Mark Stop Reached]
    D --> E{More Stops?}
    E -->|Yes| D
    E -->|No| F[Trip Complete]
    F --> G[Ready for New Trip]
```

**Driver Features:**
| Feature | Description |
|---------|-------------|
| **Start Trip** | Begin route with single button click |
| **Mark Stops** | Update progress at each stop (7 stops total) |
| **Live Status** | Shows current stop and next destination |
| **Trip Completion** | Automatic status update when all stops visited |

---

### 3️⃣ Admin Workflow

```mermaid
flowchart LR
    A[Login as Admin] --> B[Dashboard]
    B --> C{Choose Section}
    C --> D[View Fleet Status]
    C --> E[Manage Routes]
    C --> F[View Analytics]
    C --> G[Send Notifications]
    
    G --> H[Compose Message]
    H --> I[Select Type]
    I --> J[Send to All Students]
```

**Admin Features:**
| Feature | Description |
|---------|-------------|
| **Dashboard Metrics** | Active buses, total passengers, bookings today |
| **Live Fleet** | Real-time bus locations and statuses |
| **Route Management** | View and manage all bus routes |
| **Analytics** | Charts showing passenger trends and route usage |
| **Notifications** | Send alerts to all students |

---

## 🔔 Notification Flow (Admin → Student)

```mermaid
sequenceDiagram
    participant A as Admin
    participant LS as LocalStorage
    participant S as Student
    
    A->>A: Compose Notification
    A->>A: Select Type (info/warning/alert)
    A->>LS: Save Notification
    Note over LS: Stored with timestamp
    S->>LS: Check Notifications
    LS->>S: Return All Notifications
    S->>S: Display in Alerts Page
    S->>LS: Mark as Read
```

---

## 🎫 Seat Booking Flow

```mermaid
sequenceDiagram
    participant S as Student
    participant App as BusTrack App
    participant LS as LocalStorage
    participant A as Admin Dashboard
    
    S->>App: Click "Book Seat" on Route
    App->>LS: Check Existing Bookings
    
    alt Has Existing Booking
        LS-->>App: Found Active Booking
        App->>LS: Cancel Previous Booking
        Note over App: Auto-cancel previous
    end
    
    App->>LS: Create New Booking
    LS-->>App: Booking Confirmed
    App->>S: Show Success Toast
    
    Note over A: Dashboard auto-updates
    A->>LS: Fetch Booking Count
    LS-->>A: Updated Stats
```

---

## 📁 Project File Structure

```
bus-management/
├── index.html          # Main SPA entry point
├── app.js              # Core application logic
├── styles.css          # Global styles
├── student/            # Student portal assets
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── sw.js          # Service worker for offline
├── driver/             # Driver portal assets
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── admin/              # Admin dashboard assets
│   ├── index.html
│   ├── app.js
│   └── styles.css
└── landing/            # Landing page assets
```

---

## 💾 Data Storage Structure

### Bookings (`localStorage.busBookings`)
```javascript
{
  bookings: [
    {
      id: 1706889600000,
      routeId: "R001",
      routeName: "Main Campus Loop",
      stopName: "Engineering Block",
      studentId: "STU123",
      date: "2026-02-02",
      time: "08:30 PM",
      status: "confirmed" // or "cancelled"
    }
  ],
  lastUpdated: "2026-02-02T15:00:00Z"
}
```

### Notifications (`localStorage.busNotifications`)
```javascript
[
  {
    id: 1706889600001,
    title: "Bus Delay Notice",
    message: "Route 5 delayed by 10 minutes",
    type: "warning",
    sender: "Admin",
    timestamp: "2026-02-02T14:30:00Z",
    read: false
  }
]
```

---

## 🚀 Key Features Summary

| Feature | Student | Driver | Admin |
|---------|:-------:|:------:|:-----:|
| View Routes | ✅ | - | ✅ |
| Book Seats | ✅ | - | - |
| Track Buses | ✅ | - | ✅ |
| Start/End Trip | - | ✅ | - |
| Mark Stops | - | ✅ | - |
| Send Notifications | - | - | ✅ |
| Receive Notifications | ✅ | - | - |
| View Analytics | - | - | ✅ |
| Manage Fleet | - | - | ✅ |

---

## 🔧 Technology Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (No frameworks)
- **Storage**: Browser LocalStorage
- **Charts**: Chart.js for analytics
- **Routing**: Hash-based SPA routing
- **Offline**: Service Workers for PWA support
- **Server**: Python HTTP Server (development)

---

*Documentation generated for BusTrack v1.0*
