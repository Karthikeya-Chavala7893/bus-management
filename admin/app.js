// Bus Tracker Admin Dashboard - Vanilla JavaScript
// Lightweight, no dependencies except Chart.js

// ============================================
// Application State
// ============================================
const AppState = {
    currentPage: 'dashboard',
    user: {
        name: 'Admin User',
        role: 'Super Admin'
    },
    lastRefresh: new Date(),
    refreshInterval: 30000,
    autoRefreshTimer: null,
    isOnline: navigator.onLine,

    // Data
    buses: [],
    routes: [],
    drivers: [],
    notifications: [],
    activities: [],

    // Charts
    charts: {}
};

// ============================================
// Sample Data
// ============================================
const SampleData = {
    buses: [
        { id: '101', route: 'Route 5 - Engineering Loop', driver: 'Ravi Kumar', status: 'active', passengers: 35, lastStop: 'Library', eta: '2 mins' },
        { id: '102', route: 'Route 3 - Hostel Express', driver: 'Suresh Babu', status: 'active', passengers: 42, lastStop: 'Main Gate', eta: '5 mins' },
        { id: '103', route: 'Route 7 - City Center', driver: 'Venkat Rao', status: 'idle', passengers: 0, lastStop: 'Depot', eta: '-' },
        { id: '104', route: 'Route 5 - Engineering Loop', driver: 'Krishna Murthy', status: 'active', passengers: 28, lastStop: 'Science Block', eta: '8 mins' },
        { id: '105', route: 'Route 8 - Staff Quarters', driver: 'Ramesh Naidu', status: 'maintenance', passengers: 0, lastStop: 'Depot', eta: '-' },
        { id: '106', route: 'Route 3 - Hostel Express', driver: 'Prasad Reddy', status: 'active', passengers: 45, lastStop: 'Admin Block', eta: '3 mins' }
    ],

    routes: [
        { id: 'R001', name: 'Engineering Loop', stops: 7, bus: '101, 104', status: 'active', schedule: '7:00 AM - 6:00 PM' },
        { id: 'R002', name: 'Hostel Express', stops: 5, bus: '102, 106', status: 'active', schedule: '6:30 AM - 10:00 PM' },
        { id: 'R003', name: 'City Center', stops: 8, bus: '103', status: 'inactive', schedule: '4:00 PM - 9:00 PM' },
        { id: 'R004', name: 'Staff Quarters', stops: 4, bus: '105', status: 'active', schedule: '8:00 AM - 5:00 PM' },
        { id: 'R005', name: 'Medical Campus', stops: 6, bus: '-', status: 'inactive', schedule: 'Not scheduled' }
    ],

    drivers: [
        { id: 'DRV001', name: 'Ravi Kumar', phone: '+91 98765 43210', bus: '101', status: 'active', trips: 3 },
        { id: 'DRV002', name: 'Suresh Babu', phone: '+91 98765 43211', bus: '102', status: 'active', trips: 4 },
        { id: 'DRV003', name: 'Venkat Rao', phone: '+91 98765 43212', bus: '103', status: 'off-duty', trips: 0 },
        { id: 'DRV004', name: 'Krishna Murthy', phone: '+91 98765 43213', bus: '104', status: 'active', trips: 2 },
        { id: 'DRV005', name: 'Ramesh Naidu', phone: '+91 98765 43214', bus: '105', status: 'on-leave', trips: 0 },
        { id: 'DRV006', name: 'Prasad Reddy', phone: '+91 98765 43215', bus: '106', status: 'active', trips: 5 }
    ],

    notifications: [
        { id: 1, type: 'warning', title: 'Bus 102 Delayed', message: 'Bus 102 on Route 3 is running 8 minutes behind schedule due to traffic.', time: '5 mins ago', read: false },
        { id: 2, type: 'info', title: 'Route 7 Schedule Change', message: 'City Center route timing changed to 5:00 PM start from tomorrow.', time: '1 hour ago', read: false },
        { id: 3, type: 'success', title: 'Sync Complete', message: 'All driver check-ins have been synced successfully.', time: '2 hours ago', read: true },
        { id: 4, type: 'danger', title: 'Bus 105 Maintenance', message: 'Bus 105 has been marked for maintenance. Brake inspection required.', time: '3 hours ago', read: false },
        { id: 5, type: 'info', title: 'New Driver Added', message: 'Driver Prasad Reddy has been added to the system.', time: 'Yesterday', read: true }
    ],

    activities: [
        { icon: '🚌', type: 'blue', text: 'Bus 101 completed Route 5 trip', time: '10 mins ago' },
        { icon: '✓', type: 'green', text: 'Driver Ravi Kumar checked in at Engineering Block', time: '15 mins ago' },
        { icon: '⚠', type: 'yellow', text: 'Bus 102 reported delay at Main Gate', time: '25 mins ago' },
        { icon: '📱', type: 'blue', text: 'SMS alert sent to 156 students for Route 3', time: '30 mins ago' },
        { icon: '🔧', type: 'red', text: 'Bus 105 marked for maintenance', time: '1 hour ago' },
        { icon: '👤', type: 'green', text: 'New driver Prasad Reddy registered', time: '2 hours ago' }
    ],

    users: [
        { name: 'Admin User', email: 'admin@college.edu', role: 'Super Admin', lastActive: 'Now' },
        { name: 'Transport Head', email: 'transport@college.edu', role: 'Admin', lastActive: '1 hour ago' },
        { name: 'Office Staff', email: 'staff@college.edu', role: 'Viewer', lastActive: '3 days ago' }
    ],

    routePerformance: [
        { name: 'Engineering Loop', trips: 847, passengers: 12450, onTime: 94, avgDelay: '2.3 min', trend: 'up' },
        { name: 'Hostel Express', trips: 1023, passengers: 18920, onTime: 91, avgDelay: '3.8 min', trend: 'down' },
        { name: 'City Center', trips: 412, passengers: 5840, onTime: 88, avgDelay: '5.2 min', trend: 'stable' },
        { name: 'Staff Quarters', trips: 565, passengers: 4230, onTime: 97, avgDelay: '1.1 min', trend: 'up' }
    ]
};

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', init);

function init() {
    loadData();
    setupOfflineDetection();
    registerServiceWorker();
    initCharts();
    renderDashboard();
    startAutoRefresh();
    updateClock();

    // Set analytics date range
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    document.getElementById('analyticsEnd').value = today.toISOString().split('T')[0];
    document.getElementById('analyticsStart').value = weekAgo.toISOString().split('T')[0];
}

function loadData() {
    // Load from localStorage or use sample data
    const savedRoutes = localStorage.getItem('admin_routes');
    const savedDrivers = localStorage.getItem('admin_drivers');

    AppState.buses = SampleData.buses;
    AppState.routes = savedRoutes ? JSON.parse(savedRoutes) : SampleData.routes;
    AppState.drivers = savedDrivers ? JSON.parse(savedDrivers) : SampleData.drivers;
    AppState.notifications = SampleData.notifications;
    AppState.activities = SampleData.activities;

    // Update UI counts
    document.getElementById('activeBusCount').textContent = AppState.buses.filter(b => b.status === 'active').length;
    document.getElementById('pendingNotifs').textContent = AppState.notifications.filter(n => !n.read).length;
}

// ============================================
// Page Navigation
// ============================================
function showPage(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show target page
    const targetPage = document.getElementById('page-' + page);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.toggle('active', n.dataset.page === page);
    });

    // Update title
    const titles = {
        dashboard: 'Dashboard',
        fleet: 'Live Fleet',
        routes: 'Routes',
        drivers: 'Drivers',
        analytics: 'Analytics',
        notifications: 'Notifications',
        settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';

    // Render page content
    switch (page) {
        case 'fleet':
            renderFleet();
            break;
        case 'routes':
            renderRoutes();
            break;
        case 'drivers':
            renderDrivers();
            break;
        case 'analytics':
            renderAnalytics();
            break;
        case 'notifications':
            renderNotifications();
            break;
        case 'settings':
            renderSettings();
            break;
    }

    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
        toggleSidebar(false);
    }

    AppState.currentPage = page;
}

// ============================================
// Sidebar
// ============================================
function toggleSidebar(show) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (typeof show === 'boolean') {
        sidebar.classList.toggle('visible', show);
        overlay.classList.toggle('visible', show);
    } else {
        sidebar.classList.toggle('visible');
        overlay.classList.toggle('visible');
    }
}

// ============================================
// Dashboard
// ============================================
function renderDashboard() {
    updateMetrics();
    renderFleetGrid();
    renderActivityList();
    renderNotificationDropdown();
}

function updateMetrics() {
    const activeBuses = AppState.buses.filter(b => b.status === 'active').length;
    const activeRoutes = AppState.routes.filter(r => r.status === 'active').length;
    const totalPassengers = AppState.buses.reduce((sum, b) => sum + b.passengers, 0);

    document.getElementById('totalBuses').textContent = AppState.buses.length;
    document.getElementById('activeRoutes').textContent = activeRoutes;
    document.getElementById('todayPassengers').textContent = (1245 + Math.floor(Math.random() * 100)).toLocaleString();
    document.getElementById('onTimeRate').textContent = (92 + Math.floor(Math.random() * 6)) + '%';
}

function renderFleetGrid() {
    const grid = document.getElementById('fleetGrid');
    const activeBuses = AppState.buses.filter(b => b.status === 'active').slice(0, 4);

    grid.innerHTML = activeBuses.map(bus => `
    <div class="fleet-card">
      <div class="fleet-card-header">
        <span class="fleet-bus-number">Bus ${bus.id}</span>
        <span class="fleet-status ${bus.status}">${bus.status}</span>
      </div>
      <div class="fleet-info">
        <div><strong>Route:</strong> ${bus.route.split(' - ')[1]}</div>
        <div><strong>Driver:</strong> ${bus.driver}</div>
        <div><strong>Last Stop:</strong> ${bus.lastStop}</div>
        <div><strong>Passengers:</strong> ${bus.passengers}</div>
      </div>
    </div>
  `).join('');
}

function renderActivityList() {
    const list = document.getElementById('activityList');

    list.innerHTML = AppState.activities.map(activity => `
    <div class="activity-item">
      <div class="activity-icon ${activity.type}">${activity.icon}</div>
      <div class="activity-content">
        <span class="activity-text">${activity.text}</span>
        <span class="activity-time">${activity.time}</span>
      </div>
    </div>
  `).join('');
}

// ============================================
// Charts
// ============================================
function initCharts() {
    // Passenger Trend Chart
    const passengerCtx = document.getElementById('passengerChart');
    if (passengerCtx) {
        AppState.charts.passenger = new Chart(passengerCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Passengers',
                    data: [1020, 1180, 1250, 1100, 1340, 650, 420],
                    borderColor: '#2563EB',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // Route Distribution Chart
    const routeCtx = document.getElementById('routeChart');
    if (routeCtx) {
        AppState.charts.route = new Chart(routeCtx, {
            type: 'doughnut',
            data: {
                labels: ['Engineering Loop', 'Hostel Express', 'City Center', 'Staff Quarters'],
                datasets: [{
                    data: [35, 40, 15, 10],
                    backgroundColor: ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });

        // Render legend
        const legend = document.getElementById('routeLegend');
        const colors = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6'];
        const labels = ['Engineering Loop', 'Hostel Express', 'City Center', 'Staff Quarters'];
        legend.innerHTML = labels.map((label, i) => `
      <div class="legend-item">
        <span class="legend-dot" style="background: ${colors[i]}"></span>
        <span>${label}</span>
      </div>
    `).join('');
    }
}

function updateTrendChart() {
    const period = document.getElementById('trendPeriod').value;
    let labels, data;

    switch (period) {
        case '30':
            labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
            data = Array.from({ length: 30 }, () => Math.floor(Math.random() * 500) + 800);
            break;
        case '90':
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'];
            data = Array.from({ length: 12 }, () => Math.floor(Math.random() * 2000) + 6000);
            break;
        default:
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            data = [1020, 1180, 1250, 1100, 1340, 650, 420];
    }

    if (AppState.charts.passenger) {
        AppState.charts.passenger.data.labels = labels;
        AppState.charts.passenger.data.datasets[0].data = data;
        AppState.charts.passenger.update();
    }
}

// ============================================
// Fleet Page
// ============================================
function renderFleet() {
    const list = document.getElementById('fleetList');
    document.getElementById('busCount').textContent = `(${AppState.buses.length})`;

    list.innerHTML = AppState.buses.map(bus => `
    <div class="fleet-list-item" onclick="showBusDetails('${bus.id}')">
      <div class="fleet-list-icon">🚌</div>
      <div class="fleet-list-info">
        <span class="fleet-list-name">Bus ${bus.id}</span>
        <span class="fleet-list-route">${bus.route}</span>
      </div>
      <span class="fleet-list-status fleet-status ${bus.status}">${bus.status}</span>
    </div>
  `).join('');
}

function filterFleet() {
    const search = document.getElementById('fleetSearch').value.toLowerCase();
    const status = document.getElementById('fleetStatusFilter').value;

    const filtered = AppState.buses.filter(bus => {
        const matchSearch = bus.id.toLowerCase().includes(search) ||
            bus.route.toLowerCase().includes(search) ||
            bus.driver.toLowerCase().includes(search);
        const matchStatus = !status || bus.status === status;
        return matchSearch && matchStatus;
    });

    const list = document.getElementById('fleetList');
    list.innerHTML = filtered.map(bus => `
    <div class="fleet-list-item">
      <div class="fleet-list-icon">🚌</div>
      <div class="fleet-list-info">
        <span class="fleet-list-name">Bus ${bus.id}</span>
        <span class="fleet-list-route">${bus.route}</span>
      </div>
      <span class="fleet-list-status fleet-status ${bus.status}">${bus.status}</span>
    </div>
  `).join('');

    document.getElementById('busCount').textContent = `(${filtered.length})`;
}

function showBusDetails(busId) {
    showToast('Bus ' + busId + ' details', 'info');
}

// ============================================
// Routes Page
// ============================================
function renderRoutes() {
    const tbody = document.getElementById('routesBody');

    tbody.innerHTML = AppState.routes.map(route => `
    <tr>
      <td>${route.id}</td>
      <td><strong>${route.name}</strong></td>
      <td>${route.stops}</td>
      <td>${route.bus}</td>
      <td><span class="status-badge ${route.status}">${route.status}</span></td>
      <td>${route.schedule}</td>
      <td>
        <div class="table-actions">
          <button class="action-btn" onclick="editRoute('${route.id}')" aria-label="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-btn danger" onclick="deleteRoute('${route.id}')" aria-label="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterRoutes() {
    const search = document.getElementById('routeSearch').value.toLowerCase();

    const rows = document.querySelectorAll('#routesBody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
    });
}

function openRouteModal(routeId = null) {
    const modal = document.getElementById('routeModal');
    const title = document.getElementById('routeModalTitle');
    const form = document.getElementById('routeForm');

    form.reset();

    if (routeId) {
        title.textContent = 'Edit Route';
        const route = AppState.routes.find(r => r.id === routeId);
        if (route) {
            document.getElementById('routeId').value = route.id;
            document.getElementById('routeName').value = route.name;
        }
    } else {
        title.textContent = 'Add New Route';
    }

    modal.classList.add('visible');
}

function saveRoute(e) {
    e.preventDefault();

    const routeData = {
        id: document.getElementById('routeId').value,
        name: document.getElementById('routeName').value,
        stops: document.getElementById('routeStops').value.split(',').length,
        bus: '-',
        status: document.getElementById('routeStatus').value,
        schedule: document.getElementById('routeStartTime').value + ' - ' + document.getElementById('routeEndTime').value
    };

    // Check if editing or adding
    const existingIndex = AppState.routes.findIndex(r => r.id === routeData.id);
    if (existingIndex >= 0) {
        AppState.routes[existingIndex] = { ...AppState.routes[existingIndex], ...routeData };
    } else {
        AppState.routes.push(routeData);
    }

    // Save to localStorage
    localStorage.setItem('admin_routes', JSON.stringify(AppState.routes));

    closeModal('routeModal');
    renderRoutes();
    showToast('Route saved successfully', 'success');
}

function editRoute(routeId) {
    openRouteModal(routeId);
}

function deleteRoute(routeId) {
    showConfirm('Delete Route', 'Are you sure you want to delete this route?', () => {
        AppState.routes = AppState.routes.filter(r => r.id !== routeId);
        localStorage.setItem('admin_routes', JSON.stringify(AppState.routes));
        renderRoutes();
        showToast('Route deleted', 'success');
    });
}

// ============================================
// Drivers Page
// ============================================
function renderDrivers() {
    const tbody = document.getElementById('driversBody');

    tbody.innerHTML = AppState.drivers.map(driver => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="user-avatar" style="width: 32px; height: 32px; font-size: 12px;">${driver.name.charAt(0)}</div>
          <strong>${driver.name}</strong>
        </div>
      </td>
      <td>${driver.id}</td>
      <td>${driver.phone}</td>
      <td>Bus ${driver.bus}</td>
      <td><span class="status-badge ${driver.status === 'active' ? 'active' : 'inactive'}">${driver.status}</span></td>
      <td>${driver.trips}</td>
      <td>
        <div class="table-actions">
          <button class="action-btn" onclick="editDriver('${driver.id}')" aria-label="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-btn danger" onclick="deleteDriver('${driver.id}')" aria-label="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterDrivers() {
    const search = document.getElementById('driverSearch').value.toLowerCase();

    const rows = document.querySelectorAll('#driversBody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
    });
}

function openDriverModal(driverId = null) {
    const modal = document.getElementById('driverModal');
    const title = document.getElementById('driverModalTitle');
    const form = document.getElementById('driverForm');

    form.reset();

    if (driverId) {
        title.textContent = 'Edit Driver';
        const driver = AppState.drivers.find(d => d.id === driverId);
        if (driver) {
            document.getElementById('driverName').value = driver.name;
            document.getElementById('driverIdInput').value = driver.id;
            document.getElementById('driverPhone').value = driver.phone;
            document.getElementById('driverBus').value = driver.bus;
            document.getElementById('driverStatus').value = driver.status;
        }
    } else {
        title.textContent = 'Add New Driver';
    }

    modal.classList.add('visible');
}

function saveDriver(e) {
    e.preventDefault();

    const driverData = {
        id: document.getElementById('driverIdInput').value,
        name: document.getElementById('driverName').value,
        phone: document.getElementById('driverPhone').value,
        bus: document.getElementById('driverBus').value || '-',
        status: document.getElementById('driverStatus').value,
        trips: 0
    };

    const existingIndex = AppState.drivers.findIndex(d => d.id === driverData.id);
    if (existingIndex >= 0) {
        AppState.drivers[existingIndex] = { ...AppState.drivers[existingIndex], ...driverData };
    } else {
        AppState.drivers.push(driverData);
    }

    localStorage.setItem('admin_drivers', JSON.stringify(AppState.drivers));

    closeModal('driverModal');
    renderDrivers();
    showToast('Driver saved successfully', 'success');
}

function editDriver(driverId) {
    openDriverModal(driverId);
}

function deleteDriver(driverId) {
    showConfirm('Delete Driver', 'Are you sure you want to delete this driver?', () => {
        AppState.drivers = AppState.drivers.filter(d => d.id !== driverId);
        localStorage.setItem('admin_drivers', JSON.stringify(AppState.drivers));
        renderDrivers();
        showToast('Driver deleted', 'success');
    });
}

// ============================================
// Analytics Page
// ============================================
function renderAnalytics() {
    // Render charts if not already
    const ridershipCtx = document.getElementById('ridershipChart');
    if (ridershipCtx && !AppState.charts.ridership) {
        AppState.charts.ridership = new Chart(ridershipCtx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Passengers',
                    data: [1150, 1280, 1320, 1190, 1450, 720, 480],
                    backgroundColor: '#2563EB'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    const peakCtx = document.getElementById('peakHoursChart');
    if (peakCtx && !AppState.charts.peak) {
        AppState.charts.peak = new Chart(peakCtx, {
            type: 'bar',
            data: {
                labels: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM'],
                datasets: [{
                    label: 'Passengers',
                    data: [50, 180, 320, 240, 120, 80, 100, 140, 90, 110, 280, 350, 290, 160, 80],
                    backgroundColor: '#10B981'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    // Render route performance table
    const tbody = document.getElementById('routePerformanceBody');
    tbody.innerHTML = SampleData.routePerformance.map(route => `
    <tr>
      <td><strong>${route.name}</strong></td>
      <td>${route.trips.toLocaleString()}</td>
      <td>${route.passengers.toLocaleString()}</td>
      <td>${route.onTime}%</td>
      <td>${route.avgDelay}</td>
      <td>${route.trend === 'up' ? '📈 Improving' : route.trend === 'down' ? '📉 Declining' : '➡️ Stable'}</td>
    </tr>
  `).join('');
}

function updateAnalytics() {
    showToast('Analytics updated for selected date range', 'info');
}

function exportReport() {
    showToast('Report export started. Download will begin shortly.', 'info');

    // Simulate export
    setTimeout(() => {
        showToast('Report exported successfully!', 'success');
    }, 2000);
}

// ============================================
// Notifications
// ============================================
function renderNotifications() {
    const list = document.getElementById('notificationsList');

    list.innerHTML = AppState.notifications.map(notif => `
    <div class="notification-item ${notif.read ? '' : 'unread'}">
      <div class="notification-icon ${notif.type}">
        ${notif.type === 'warning' ? '⚠' : notif.type === 'danger' ? '🚨' : notif.type === 'success' ? '✓' : 'ℹ'}
      </div>
      <div class="notification-content">
        <span class="notification-title">${notif.title}</span>
        <span class="notification-message">${notif.message}</span>
        <span class="notification-meta">${notif.time}</span>
      </div>
    </div>
  `).join('');
}

function renderNotificationDropdown() {
    const list = document.getElementById('notifList');
    const unread = AppState.notifications.filter(n => !n.read).slice(0, 5);

    if (unread.length === 0) {
        list.innerHTML = '<div style="padding: 24px; text-align: center; color: #6B7280;">No new notifications</div>';
    } else {
        list.innerHTML = unread.map(notif => `
      <div class="activity-item" style="padding: 12px 16px; cursor: pointer;" onclick="markAsRead(${notif.id})">
        <div class="activity-icon ${notif.type === 'warning' ? 'yellow' : notif.type === 'danger' ? 'red' : 'blue'}">
          ${notif.type === 'warning' ? '⚠' : notif.type === 'danger' ? '🚨' : 'ℹ'}
        </div>
        <div class="activity-content">
          <span class="activity-text">${notif.title}</span>
          <span class="activity-time">${notif.time}</span>
        </div>
      </div>
    `).join('');
    }

    // Update badge
    const count = unread.length;
    document.getElementById('headerNotifDot').style.display = count > 0 ? 'block' : 'none';
}

function toggleNotifications() {
    const dropdown = document.getElementById('notifDropdown');
    dropdown.classList.toggle('visible');
}

function markAsRead(id) {
    const notif = AppState.notifications.find(n => n.id === id);
    if (notif) {
        notif.read = true;
        renderNotificationDropdown();
        document.getElementById('pendingNotifs').textContent = AppState.notifications.filter(n => !n.read).length;
    }
}

function markAllRead() {
    AppState.notifications.forEach(n => n.read = true);
    renderNotificationDropdown();
    renderNotifications();
    document.getElementById('pendingNotifs').textContent = '0';
    showToast('All notifications marked as read', 'success');
}

function filterNotifications(type) {
    // Update tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.toggle('active', tab.textContent.toLowerCase() === type);
    });

    showToast('Showing ' + type + ' notifications', 'info');
}

function openBroadcastModal() {
    document.getElementById('broadcastModal').classList.add('visible');

    // Handle audience checkbox change
    document.querySelectorAll('input[name="audience"]').forEach(cb => {
        cb.onchange = () => {
            const routeSelect = document.getElementById('routeSelectGroup');
            const routeChecked = document.querySelector('input[name="audience"][value="route"]').checked;
            routeSelect.style.display = routeChecked ? 'block' : 'none';
        };
    });
}

function sendBroadcast(e) {
    e.preventDefault();

    const type = document.getElementById('broadcastType').value;
    const message = document.getElementById('broadcastMessage').value;
    const sendSms = document.getElementById('sendSms').checked;

    closeModal('broadcastModal');
    showToast('Broadcast message sent' + (sendSms ? ' (including SMS)' : ''), 'success');

    // Add to notifications
    AppState.notifications.unshift({
        id: Date.now(),
        type: type === 'emergency' ? 'danger' : type === 'warning' || type === 'delay' ? 'warning' : 'info',
        title: 'Broadcast Sent',
        message: message.substring(0, 50) + '...',
        time: 'Just now',
        read: true
    });
}

// ============================================
// Settings
// ============================================
function renderSettings() {
    // Render users table
    const tbody = document.getElementById('usersBody');
    tbody.innerHTML = SampleData.users.map(user => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="user-avatar" style="width: 32px; height: 32px; font-size: 12px;">${user.name.charAt(0)}</div>
          <strong>${user.name}</strong>
        </div>
      </td>
      <td>${user.email}</td>
      <td><span class="status-badge active">${user.role}</span></td>
      <td>${user.lastActive}</td>
      <td>
        <div class="table-actions">
          <button class="action-btn" aria-label="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function saveSettings() {
    showToast('Settings saved successfully', 'success');
}

function openUserModal() {
    showToast('User management feature coming soon', 'info');
}

function exportAllData() {
    showToast('Exporting all data...', 'info');
    setTimeout(() => {
        showToast('Data exported successfully', 'success');
    }, 2000);
}

function importData() {
    showToast('Import feature coming soon', 'info');
}

function clearCache() {
    showConfirm('Clear Cache', 'This will clear all cached data. Continue?', () => {
        localStorage.clear();
        showToast('Cache cleared', 'success');
    });
}

// ============================================
// Modals
// ============================================
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('visible');
}

let confirmCallback = null;

function showConfirm(title, message, callback) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = callback;
    document.getElementById('confirmModal').classList.add('visible');
}

function confirmAction() {
    closeModal('confirmModal');
    if (confirmCallback) {
        confirmCallback();
        confirmCallback = null;
    }
}

// ============================================
// Toast Notifications
// ============================================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastMessage = document.getElementById('toastMessage');

    toast.className = 'toast visible ' + type;
    toastIcon.textContent = type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ';
    toastMessage.textContent = message;

    setTimeout(hideToast, 5000);
}

function hideToast() {
    document.getElementById('toast').classList.remove('visible');
}

// ============================================
// Data Refresh
// ============================================
function refreshData() {
    showToast('Refreshing data...', 'info');

    // Simulate refresh
    setTimeout(() => {
        AppState.lastRefresh = new Date();
        updateLastUpdated();
        renderDashboard();
        showToast('Data refreshed', 'success');
    }, 1000);
}

function startAutoRefresh() {
    if (AppState.autoRefreshTimer) {
        clearInterval(AppState.autoRefreshTimer);
    }

    AppState.autoRefreshTimer = setInterval(() => {
        if (AppState.currentPage === 'dashboard' || AppState.currentPage === 'fleet') {
            updateMetrics();
            updateLastUpdated();
        }
    }, AppState.refreshInterval);
}

function updateLastUpdated() {
    const diff = Math.floor((Date.now() - AppState.lastRefresh.getTime()) / 1000);
    let text;

    if (diff < 10) {
        text = 'Updated just now';
    } else if (diff < 60) {
        text = 'Updated ' + diff + ' seconds ago';
    } else {
        text = 'Updated ' + Math.floor(diff / 60) + ' minutes ago';
    }

    document.getElementById('lastUpdated').textContent = text;
}

function updateClock() {
    setInterval(updateLastUpdated, 10000);
}

// ============================================
// Offline Detection
// ============================================
function setupOfflineDetection() {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
        handleOffline();
    }
}

function handleOnline() {
    AppState.isOnline = true;
    dismissOfflineBanner();
    showToast('Connection restored', 'success');
}

function handleOffline() {
    AppState.isOnline = false;
    document.getElementById('offlineBanner').classList.add('visible');
}

function dismissOfflineBanner() {
    document.getElementById('offlineBanner').classList.remove('visible');
}

// ============================================
// Service Worker
// ============================================
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW registered'))
            .catch(err => console.log('SW failed:', err));
    }
}

// ============================================
// Sorting
// ============================================
function sortTable(table, column) {
    showToast('Sorting by ' + column, 'info');
}

// ============================================
// Logout
// ============================================
function logout() {
    showConfirm('Logout', 'Are you sure you want to logout?', () => {
        localStorage.removeItem('admin_session');
        window.location.href = '../landing/index.html';
    });
}

// ============================================
// Global Functions
// ============================================
window.showPage = showPage;
window.toggleSidebar = toggleSidebar;
window.refreshData = refreshData;
window.toggleNotifications = toggleNotifications;
window.markAllRead = markAllRead;
window.markAsRead = markAsRead;
window.updateTrendChart = updateTrendChart;
window.filterFleet = filterFleet;
window.filterRoutes = filterRoutes;
window.filterDrivers = filterDrivers;
window.filterNotifications = filterNotifications;
window.openRouteModal = openRouteModal;
window.saveRoute = saveRoute;
window.editRoute = editRoute;
window.deleteRoute = deleteRoute;
window.openDriverModal = openDriverModal;
window.saveDriver = saveDriver;
window.editDriver = editDriver;
window.deleteDriver = deleteDriver;
window.openBroadcastModal = openBroadcastModal;
window.sendBroadcast = sendBroadcast;
window.closeModal = closeModal;
window.confirmAction = confirmAction;
window.showToast = showToast;
window.hideToast = hideToast;
window.saveSettings = saveSettings;
window.openUserModal = openUserModal;
window.exportAllData = exportAllData;
window.importData = importData;
window.clearCache = clearCache;
window.exportReport = exportReport;
window.updateAnalytics = updateAnalytics;
window.dismissOfflineBanner = dismissOfflineBanner;
window.sortTable = sortTable;
window.logout = logout;
window.showBusDetails = showBusDetails;
