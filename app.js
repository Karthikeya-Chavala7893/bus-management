/**
 * BusTrack SPA - Unified JavaScript
 * Single Page Application with hash-based routing
 */

// ============================================
// STATE & CONFIGURATION
// ============================================

const AppState = {
    currentView: 'landing',
    currentRole: null,
    isLoggedIn: false,
    user: null
};

const roleColors = {
    student: '#3b82f6',
    driver: '#10b981',
    admin: '#f59e0b'
};

const roleGradients = {
    student: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
    driver: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
    admin: 'linear-gradient(135deg, #fffbeb, #fef3c7)'
};

// ============================================
// BOOKING DATA MANAGEMENT
// ============================================

// Initialize booking data from localStorage or create new
function getBookingData() {
    const data = localStorage.getItem('busBookings');
    if (data) {
        return JSON.parse(data);
    }
    return { bookings: [], lastUpdated: null };
}

function saveBookingData(data) {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem('busBookings', JSON.stringify(data));
}

function getTodayDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
}

function getTodaysBookings() {
    const data = getBookingData();
    const today = getTodayDateString();
    return data.bookings.filter(booking => booking.date === today);
}

function getTodaysBookingCount() {
    return getTodaysBookings().length;
}

function addBooking(routeId, routeName, stopName, studentId) {
    const data = getBookingData();
    const booking = {
        id: Date.now(),
        routeId,
        routeName,
        stopName,
        studentId: studentId || localStorage.getItem('userId') || 'STU' + Math.floor(Math.random() * 1000),
        date: getTodayDateString(),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'confirmed'
    };
    data.bookings.push(booking);
    saveBookingData(data);

    // Trigger dashboard update if admin is viewing
    updateAdminBookingStats();

    return booking;
}

function cancelBooking(bookingId) {
    const data = getBookingData();
    const index = data.bookings.findIndex(b => b.id === bookingId);
    if (index !== -1) {
        data.bookings[index].status = 'cancelled';
        saveBookingData(data);
        updateAdminBookingStats();
        return true;
    }
    return false;
}

function getActiveBookingsToday() {
    return getTodaysBookings().filter(b => b.status === 'confirmed');
}


// ============================================
// ROUTER - Hash-based Navigation
// ============================================

function initRouter() {
    // Handle initial route
    handleRoute();

    // Listen for hash changes
    window.addEventListener('hashchange', handleRoute);
}

function handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const route = hash.replace('/', '');

    // Map routes to views
    const routeMap = {
        '': 'landing',
        'landing': 'landing',
        'student': 'student',
        'driver': 'driver',
        'admin': 'admin'
    };

    const view = routeMap[route] || 'landing';
    navigateTo(view, false);
}

function navigateTo(viewName, updateHash = true) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Show target view
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
        targetView.classList.add('active');
        AppState.currentView = viewName;

        // Update hash without triggering hashchange
        if (updateHash) {
            history.pushState(null, '', `#/${viewName}`);
        }

        // Initialize view-specific functionality
        initViewFunctions(viewName);

        // Scroll to top
        window.scrollTo(0, 0);
    }
}

function initViewFunctions(viewName) {
    switch (viewName) {
        case 'driver':
            updateDriverTime();
            break;
        case 'admin':
            initAdminCharts();
            // Load current booking count
            updateAdminBookingStats();
            break;
    }
}

// ============================================
// LOGIN MODAL
// ============================================

function openLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    showRoleSelection();
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function showRoleSelection() {
    document.getElementById('roleSelectionPanel').style.display = 'block';
    document.getElementById('loginFormPanel').style.display = 'none';
}

function selectLoginRole(role) {
    AppState.currentRole = role;

    document.getElementById('roleSelectionPanel').style.display = 'none';
    document.getElementById('loginFormPanel').style.display = 'block';

    // Update UI
    const roleTitle = document.getElementById('loginRoleTitle');
    roleTitle.textContent = role.charAt(0).toUpperCase() + role.slice(1) + ' Login';

    const roleIcon = document.getElementById('loginRoleIcon');
    roleIcon.style.background = roleGradients[role];

    const submitBtn = document.getElementById('loginSubmitBtn');
    submitBtn.style.background = roleColors[role];

    // Update placeholder
    const userIdInput = document.getElementById('loginUserId');
    if (role === 'student') {
        userIdInput.placeholder = 'Enter Student ID';
    } else if (role === 'driver') {
        userIdInput.placeholder = 'Enter Driver ID';
    } else {
        userIdInput.placeholder = 'Enter Email';
    }

    // Clear and focus
    userIdInput.value = '';
    document.getElementById('loginPassword').value = '';
    setTimeout(() => userIdInput.focus(), 100);
}

function handleLoginSubmit(e) {
    e.preventDefault();

    const userId = document.getElementById('loginUserId').value;
    const password = document.getElementById('loginPassword').value;

    if (!userId || !password) {
        showToast('Please fill in all fields');
        return;
    }

    // Store login state
    AppState.isLoggedIn = true;
    AppState.user = { id: userId, role: AppState.currentRole };
    localStorage.setItem('userRole', AppState.currentRole);
    localStorage.setItem('userId', userId);

    closeLoginModal();
    navigateTo(AppState.currentRole);
    showToast(`Welcome! Logged in as ${AppState.currentRole}`);
}

function loginAs(role) {
    AppState.currentRole = role;
    openLoginModal();
    selectLoginRole(role);
}

function logout() {
    AppState.isLoggedIn = false;
    AppState.user = null;
    AppState.currentRole = null;
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');

    navigateTo('landing');
    showToast('Logged out successfully');
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ============================================
// OFFLINE DETECTION
// ============================================

function updateOnlineStatus() {
    const banner = document.getElementById('offlineBanner');
    if (navigator.onLine) {
        banner.style.display = 'none';
    } else {
        banner.style.display = 'flex';
    }
}

// ============================================
// DRIVER PORTAL FUNCTIONS
// ============================================

let driverTripState = 'ready'; // ready, started, inprogress
let driverCurrentStop = 0; // 0 = not started, 1-7 = current stop number
const driverTotalStops = 7;

function toggleDriverMenu() {
    const overlay = document.getElementById('driverMenuOverlay');
    const sidebar = document.getElementById('driverMenuSidebar');

    overlay.classList.toggle('active');
    sidebar.classList.toggle('active');
}

function updateDriverTime() {
    const timeEl = document.getElementById('driverCurrentTime');
    if (timeEl) {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
}

function updateDriverStopList() {
    const stopItems = document.querySelectorAll('.driver-stop-item');
    const progressEl = document.querySelector('.driver-stop-progress');
    const statusCard = document.querySelector('.driver-status-card');
    const statusIcon = statusCard.querySelector('.driver-status-icon');
    const statusText = statusCard.querySelector('.driver-status-text');
    const statusSub = statusCard.querySelector('.driver-status-sub');

    // Update progress counter
    if (progressEl) {
        progressEl.textContent = `${driverCurrentStop}/${driverTotalStops}`;
    }

    // Update each stop item
    stopItems.forEach((item, index) => {
        const stopNumber = index + 1;
        item.classList.remove('completed', 'current', 'upcoming');

        if (stopNumber < driverCurrentStop) {
            // Completed stops
            item.classList.add('completed');
        } else if (stopNumber === driverCurrentStop) {
            // Current stop (just reached)
            item.classList.add('current');
        } else if (stopNumber === driverCurrentStop + 1 && driverCurrentStop < driverTotalStops) {
            // Next upcoming stop
            item.classList.add('upcoming');
        }
    });

    // Update status card based on progress
    if (driverCurrentStop === 0) {
        statusIcon.textContent = '🚌';
        statusText.textContent = 'Ready to start Route 5';
        statusSub.textContent = 'Engineering Loop • 7 stops';
    } else if (driverCurrentStop < driverTotalStops) {
        const stopNames = ['Main Gate', 'Library', 'Science Block', 'Medical Center', 'Admin Block', 'Engineering Block', 'Hostel Gate'];
        const nextStop = stopNames[driverCurrentStop] || 'Next Stop';
        statusIcon.textContent = '🚌';
        statusText.textContent = `At Stop ${driverCurrentStop} - ${stopNames[driverCurrentStop - 1]}`;
        statusSub.textContent = `Next: ${nextStop}`;
    } else {
        statusIcon.textContent = '✅';
        statusText.textContent = 'Trip Completed!';
        statusSub.textContent = 'All 7 stops visited';
    }
}

function handleDriverAction() {
    const button = document.querySelector('.driver-action-button');
    const icon = button.querySelector('.driver-action-icon');
    const text = button.querySelector('.driver-action-text');

    if (driverTripState === 'ready') {
        // Start the trip
        driverTripState = 'started';
        driverCurrentStop = 1;
        icon.textContent = '✓';
        text.textContent = 'REACHED STOP';
        button.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
        showToast('Trip started! At Stop 1 - Main Gate');
        updateDriverStopList();
    } else if (driverCurrentStop < driverTotalStops) {
        // Mark current stop and move to next
        driverCurrentStop++;
        const stopNames = ['Main Gate', 'Library', 'Science Block', 'Medical Center', 'Admin Block', 'Engineering Block', 'Hostel Gate'];
        showToast(`Stop ${driverCurrentStop} - ${stopNames[driverCurrentStop - 1]} reached!`);
        updateDriverStopList();

        // Check if trip is complete
        if (driverCurrentStop === driverTotalStops) {
            icon.textContent = '🏁';
            text.textContent = 'TRIP COMPLETE';
            button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            showToast('🎉 Trip completed! All stops visited.');
        }
    } else {
        // Reset for new trip
        driverTripState = 'ready';
        driverCurrentStop = 0;
        icon.textContent = '▶';
        text.textContent = 'START TRIP';
        button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        showToast('Ready for a new trip!');
        updateDriverStopList();
    }
}

// Update time every minute
setInterval(updateDriverTime, 60000);

// ============================================
// ADMIN PORTAL FUNCTIONS
// ============================================

let passengerChart = null;
let routeChart = null;
let ridershipChart = null;

function toggleAdminSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    sidebar.classList.toggle('open');
}

function showAdminPage(pageName, event) {
    // Prevent default link behavior (href="#" was causing navigation to landing)
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Update nav
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pageName) {
            item.classList.add('active');
        }
    });

    // Update pages
    document.querySelectorAll('.admin-page').forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(`admin-page-${pageName}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Update title
    const titles = {
        dashboard: 'Dashboard',
        fleet: 'Live Fleet',
        routes: 'Routes',
        analytics: 'Analytics'
    };
    document.querySelector('.admin-page-title').textContent = titles[pageName] || 'Dashboard';

    // Initialize charts if analytics
    if (pageName === 'analytics') {
        initAnalyticsChart();
    }

    // Close mobile sidebar
    document.getElementById('adminSidebar').classList.remove('open');
}

function refreshAdminData() {
    showToast('Data refreshed');
    document.querySelector('.admin-last-updated').textContent = 'Updated just now';
}

function initAdminCharts() {
    // Only init if elements exist and Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.log('Chart.js not loaded yet');
        return;
    }

    initPassengerChart();
    initRouteChart();
}

function initPassengerChart() {
    const ctx = document.getElementById('adminPassengerChart');
    if (!ctx) return;

    // Destroy existing chart
    if (passengerChart) {
        passengerChart.destroy();
    }

    passengerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Passengers',
                data: [1245, 1380, 1156, 1420, 1289, 890, 650],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function initRouteChart() {
    const ctx = document.getElementById('adminRouteChart');
    if (!ctx) return;

    // Destroy existing chart
    if (routeChart) {
        routeChart.destroy();
    }

    routeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Route 5', 'Route 3', 'Route 1', 'Route 7', 'Other'],
            datasets: [{
                data: [28, 24, 20, 15, 13],
                backgroundColor: [
                    '#3b82f6',
                    '#10b981',
                    '#8b5cf6',
                    '#f59e0b',
                    '#94a3b8'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 16 }
                }
            },
            cutout: '65%'
        }
    });
}

function initAnalyticsChart() {
    const ctx = document.getElementById('adminRidershipChart');
    if (!ctx || typeof Chart === 'undefined') return;

    if (ridershipChart) {
        ridershipChart.destroy();
    }

    // Generate 30 days of data
    const labels = [];
    const data = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        data.push(Math.floor(Math.random() * 500) + 900);
    }

    ridershipChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Passengers',
                data: data,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// ============================================
// STUDENT PORTAL FUNCTIONS
// ============================================

let currentStudentPage = 'home'; // home, routes, alerts, settings

function showStudentNotifications() {
    showStudentPage('alerts');
}

function showStudentPage(pageName) {
    currentStudentPage = pageName;

    // Update nav buttons
    document.querySelectorAll('.student-nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Find and activate the correct nav item by matching the span text
    document.querySelectorAll('.student-nav-item').forEach(item => {
        const spanText = item.querySelector('span');
        if (spanText && spanText.textContent.toLowerCase() === pageName) {
            item.classList.add('active');
        }
    });

    // Update main content
    const studentMain = document.querySelector('.student-main');
    const statusCard = studentMain.querySelector('.student-status-card');
    const pageHeader = studentMain.querySelector('.student-page-header');
    const routeCards = studentMain.querySelector('.student-route-cards');

    // Create or get dynamic content container
    let dynamicContent = studentMain.querySelector('.student-dynamic-content');
    if (!dynamicContent) {
        dynamicContent = document.createElement('div');
        dynamicContent.className = 'student-dynamic-content';
        studentMain.insertBefore(dynamicContent, studentMain.querySelector('.student-bottom-nav'));
    }

    // Show/hide elements based on page
    if (pageName === 'home') {
        if (statusCard) statusCard.style.display = 'flex';
        if (pageHeader) pageHeader.style.display = 'block';
        if (routeCards) routeCards.style.display = 'flex';
        dynamicContent.innerHTML = '';
        dynamicContent.style.display = 'none';
    } else {
        if (statusCard) statusCard.style.display = 'none';
        if (pageHeader) pageHeader.style.display = 'none';
        if (routeCards) routeCards.style.display = 'none';
        dynamicContent.style.display = 'block';

        // Render dynamic content based on page
        dynamicContent.innerHTML = getStudentPageContent(pageName);
    }

    showToast(`Viewing ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}`);
}

function getStudentPageContent(pageName) {
    switch (pageName) {
        case 'routes':
            const myBookings = getActiveBookingsToday();
            const bookedRouteIds = myBookings.map(b => b.routeId);
            return `
                <div class="student-page-content">
                    <div class="student-page-header">
                        <h1>All Routes</h1>
                        <p>Browse available bus routes and book your seat</p>
                    </div>
                    ${myBookings.length > 0 ? `
                    <div class="student-my-bookings-banner" onclick="showStudentPage('bookings')">
                        <span class="booking-icon">🎫</span>
                        <span class="booking-text">You have ${myBookings.length} booking(s) today</span>
                        <span class="booking-arrow">→</span>
                    </div>
                    ` : ''}
                    <div class="student-routes-list">
                        <div class="student-route-list-item">
                            <span class="route-badge blue">1</span>
                            <div class="route-info">
                                <span class="route-name">Main Campus Loop</span>
                                <span class="route-meta">8 stops • Every 15 mins</span>
                            </div>
                            ${bookedRouteIds.includes('R001') ?
                    `<span class="route-booked">✓ Booked</span>` :
                    `<button class="book-seat-btn" onclick="event.stopPropagation(); bookSeat('R001', 'Main Campus Loop', 'Engineering Block')">Book Seat</button>`
                }
                        </div>
                        <div class="student-route-list-item">
                            <span class="route-badge green">3</span>
                            <div class="route-info">
                                <span class="route-name">Hostel Express</span>
                                <span class="route-meta">6 stops • Every 20 mins</span>
                            </div>
                            ${bookedRouteIds.includes('R002') ?
                    `<span class="route-booked">✓ Booked</span>` :
                    `<button class="book-seat-btn" onclick="event.stopPropagation(); bookSeat('R002', 'Hostel Express', 'Hostel Gate')">Book Seat</button>`
                }
                        </div>
                        <div class="student-route-list-item">
                            <span class="route-badge purple">5</span>
                            <div class="route-info">
                                <span class="route-name">Engineering Loop</span>
                                <span class="route-meta">7 stops • Every 10 mins</span>
                            </div>
                            ${bookedRouteIds.includes('R005') ?
                    `<span class="route-booked">✓ Booked</span>` :
                    `<button class="book-seat-btn" onclick="event.stopPropagation(); bookSeat('R005', 'Engineering Loop', 'Engineering Block')">Book Seat</button>`
                }
                        </div>
                        <div class="student-route-list-item">
                            <span class="route-badge orange">7</span>
                            <div class="route-info">
                                <span class="route-name">City Center Shuttle</span>
                                <span class="route-meta">10 stops • Weekends only</span>
                            </div>
                            <span class="route-status inactive">Inactive</span>
                        </div>
                    </div>
                </div>
            `;
        case 'bookings':
            const todayBookings = getActiveBookingsToday();
            return `
                <div class="student-page-content">
                    <div class="student-page-header">
                        <h1>My Bookings</h1>
                        <p>Today's seat reservations</p>
                    </div>
                    ${todayBookings.length === 0 ? `
                    <div class="empty-bookings">
                        <span class="empty-icon">🎫</span>
                        <h3>No Bookings Yet</h3>
                        <p>Book a seat on your favorite route to get started</p>
                        <button class="btn btn-primary" onclick="showStudentPage('routes')">Browse Routes</button>
                    </div>
                    ` : `
                    <div class="student-bookings-list">
                        ${todayBookings.map(booking => `
                        <div class="student-booking-card">
                            <div class="booking-header">
                                <span class="booking-route">${booking.routeName}</span>
                                <span class="booking-status confirmed">Confirmed</span>
                            </div>
                            <div class="booking-details">
                                <div class="booking-detail">
                                    <span class="detail-label">Your Stop</span>
                                    <span class="detail-value">${booking.stopName}</span>
                                </div>
                                <div class="booking-detail">
                                    <span class="detail-label">Booked At</span>
                                    <span class="detail-value">${booking.time}</span>
                                </div>
                            </div>
                            <button class="cancel-booking-btn" onclick="cancelStudentBooking(${booking.id})">Cancel Booking</button>
                        </div>
                        `).join('')}
                    </div>
                    `}
                </div>
            `;
        case 'alerts':
            return `
                <div class="student-page-content">
                    <div class="student-page-header">
                        <h1>Notifications</h1>
                        <p>Your recent alerts and updates</p>
                    </div>
                    <div class="student-alerts-list">
                        <div class="student-alert-item unread">
                            <div class="alert-icon info">🚌</div>
                            <div class="alert-content">
                                <span class="alert-title">Route 5 Arriving Soon</span>
                                <span class="alert-message">Bus will reach Engineering Block in 5 minutes</span>
                                <span class="alert-time">2 mins ago</span>
                            </div>
                        </div>
                        <div class="student-alert-item unread">
                            <div class="alert-icon warning">⚠️</div>
                            <div class="alert-content">
                                <span class="alert-title">Route 3 Delayed</span>
                                <span class="alert-message">Hostel Express is running 5 minutes behind schedule</span>
                                <span class="alert-time">10 mins ago</span>
                            </div>
                        </div>
                        <div class="student-alert-item unread">
                            <div class="alert-icon success">✅</div>
                            <div class="alert-content">
                                <span class="alert-title">SMS Alert Enabled</span>
                                <span class="alert-message">You will receive SMS notifications for Route 5</span>
                                <span class="alert-time">1 hour ago</span>
                            </div>
                        </div>
                        <div class="student-alert-item">
                            <div class="alert-icon info">📋</div>
                            <div class="alert-content">
                                <span class="alert-title">Schedule Updated</span>
                                <span class="alert-message">Evening timings have been updated for all routes</span>
                                <span class="alert-time">Yesterday</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        case 'settings':
            return `
                <div class="student-page-content">
                    <div class="student-page-header">
                        <h1>Settings</h1>
                        <p>Manage your preferences</p>
                    </div>
                    <div class="student-settings-list">
                        <div class="settings-section">
                            <h3>Notifications</h3>
                            <div class="settings-item" onclick="showToast('Push notifications toggled')">
                                <span class="settings-label">Push Notifications</span>
                                <span class="settings-toggle on">ON</span>
                            </div>
                            <div class="settings-item" onclick="showToast('SMS alerts toggled')">
                                <span class="settings-label">SMS Alerts</span>
                                <span class="settings-toggle on">ON</span>
                            </div>
                            <div class="settings-item" onclick="showToast('Email notifications toggled')">
                                <span class="settings-label">Email Notifications</span>
                                <span class="settings-toggle off">OFF</span>
                            </div>
                        </div>
                        <div class="settings-section">
                            <h3>My Stop</h3>
                            <div class="settings-item" onclick="showToast('Default stop selection')">
                                <span class="settings-label">Default Stop</span>
                                <span class="settings-value">Engineering Block</span>
                            </div>
                            <div class="settings-item" onclick="showToast('Alert timing changed')">
                                <span class="settings-label">Alert Before Arrival</span>
                                <span class="settings-value">5 minutes</span>
                            </div>
                        </div>
                        <div class="settings-section">
                            <h3>Account</h3>
                            <div class="settings-item" onclick="showToast('Phone: +91 98765 43210')">
                                <span class="settings-label">Phone Number</span>
                                <span class="settings-value">+91 98765 43210</span>
                            </div>
                            <div class="settings-item logout" onclick="logout()">
                                <span class="settings-label">Logout</span>
                                <span class="settings-icon">→</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        default:
            return '<div class="student-page-content"><p>Page not found</p></div>';
    }
}

function initStudentNavigation() {
    document.querySelectorAll('.student-nav-item').forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const spanText = this.querySelector('span');
            if (spanText) {
                const pageName = spanText.textContent.toLowerCase();
                showStudentPage(pageName);
            }
        });
    });
}

// ============================================
// BOOKING HANDLERS
// ============================================

function bookSeat(routeId, routeName, stopName) {
    const booking = addBooking(routeId, routeName, stopName);
    showToast(`🎫 Seat booked on ${routeName}!`);

    // Refresh the routes page to show updated booking status
    setTimeout(() => {
        showStudentPage('routes');
    }, 500);
}

function cancelStudentBooking(bookingId) {
    if (cancelBooking(bookingId)) {
        showToast('Booking cancelled');
        // Refresh bookings page
        setTimeout(() => {
            showStudentPage('bookings');
        }, 300);
    } else {
        showToast('Failed to cancel booking');
    }
}

// Update admin dashboard with booking stats
function updateAdminBookingStats() {
    const bookingCount = getActiveBookingsToday().length;

    // Update the "Passengers Today" metric card if it exists
    const metricCards = document.querySelectorAll('.admin-metric-card');
    metricCards.forEach(card => {
        const label = card.querySelector('.admin-metric-label');
        if (label && label.textContent.includes('Bookings Today')) {
            const valueEl = card.querySelector('.admin-metric-value');
            if (valueEl) {
                valueEl.textContent = bookingCount;
                // Add animation
                valueEl.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    valueEl.style.transform = 'scale(1)';
                }, 300);
            }
        }
    });

    // Also update the booking count in the live indicator if admin is viewing
    const bookingIndicator = document.getElementById('adminBookingCount');
    if (bookingIndicator) {
        bookingIndicator.textContent = bookingCount;
    }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', function (e) {
    // Close modal on Escape
    if (e.key === 'Escape') {
        const loginModal = document.getElementById('loginModal');
        if (loginModal.classList.contains('active')) {
            closeLoginModal();
        }
    }
});

// ============================================
// SMOOTH SCROLL FOR LANDING PAGE
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1 && !href.startsWith('#/')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// ============================================
// INITIALIZE APP
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    // Initialize router
    initRouter();

    // Check for saved login
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
        AppState.currentRole = savedRole;
        AppState.isLoggedIn = true;
    }

    // Online/offline detection
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    // Update driver time
    updateDriverTime();

    // Initialize student navigation
    initStudentNavigation();

    // Initialize admin navigation with proper event handling
    initAdminNavigation();

    console.log('BusTrack SPA Initialized');
});

// Initialize admin sidebar navigation to prevent default link behavior
function initAdminNavigation() {
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const pageName = this.dataset.page;
            if (pageName) {
                showAdminPage(pageName, e);
            }
        });
    });
}

// Make functions global for onclick handlers
window.navigateTo = navigateTo;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.showRoleSelection = showRoleSelection;
window.selectLoginRole = selectLoginRole;
window.handleLoginSubmit = handleLoginSubmit;
window.loginAs = loginAs;
window.logout = logout;
window.toggleDriverMenu = toggleDriverMenu;
window.handleDriverAction = handleDriverAction;
window.toggleAdminSidebar = toggleAdminSidebar;
window.showAdminPage = showAdminPage;
window.refreshAdminData = refreshAdminData;
window.showStudentNotifications = showStudentNotifications;
window.showStudentPage = showStudentPage;
window.bookSeat = bookSeat;
window.cancelStudentBooking = cancelStudentBooking;
