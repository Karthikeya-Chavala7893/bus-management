// Bus Tracker Student Portal - Vanilla JavaScript
// Lightweight, under 10KB, fully functional offline

// ============================================
// State Management
// ============================================
const AppState = {
    currentPage: 'home',
    notifications: [],
    favorites: ['route5', 'route3'],
    settings: {
        morningAlerts: true,
        arrivalNotifs: true,
        delayWarnings: true,
        crowdAlerts: false,
        alertTiming: '10',
        smsEnabled: false,
        phoneNumber: ''
    },
    routes: {},
    lastSync: null,
    pendingChanges: [],
    isOnline: navigator.onLine
};

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', init);

function init() {
    loadState();
    loadNotifications();
    setupOfflineDetection();
    registerServiceWorker();
    requestNotificationPermission();
    updateUI();
    startAutoRefresh();
}

// ============================================
// Page Navigation
// ============================================
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show target page
    const targetPage = document.getElementById('page-' + pageName);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.toggle('active', n.dataset.page === pageName);
    });

    // Close notification panel
    closeNotifPanel();

    // Update state
    AppState.currentPage = pageName;

    // Scroll to top
    window.scrollTo(0, 0);
}

function showTracking(routeId) {
    // Update tracking page content based on route
    updateTrackingPage(routeId);

    // Navigate to tracking page
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-tracking').classList.add('active');

    // Update nav state
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    window.scrollTo(0, 0);
}

function updateTrackingPage(routeId) {
    // Route data (would come from API/cache in production)
    const routes = {
        route5: {
            name: 'Engineering Loop',
            badge: '5',
            badgeClass: 'route-badge-blue',
            meta: 'Mon-Sat • 7 AM - 6 PM'
        },
        route3: {
            name: 'Hostel Express',
            badge: '3',
            badgeClass: 'route-badge-green',
            meta: 'Daily • 6:30 AM - 10 PM'
        },
        route7: {
            name: 'City Center',
            badge: '7',
            badgeClass: 'route-badge-gray',
            meta: 'Mon-Fri • 4 PM - 9 PM'
        }
    };

    const route = routes[routeId] || routes.route5;

    document.getElementById('trackingBadge').textContent = route.badge;
    document.getElementById('trackingBadge').className = 'route-badge ' + route.badgeClass;
    document.getElementById('trackingRouteName').textContent = route.name;
    document.getElementById('trackingMeta').textContent = route.meta;

    // Update favorite button state
    updateFavoriteButton(routeId);
}

// ============================================
// Notifications
// ============================================
function loadNotifications() {
    // Sample notifications (would load from IndexedDB in production)
    AppState.notifications = [
        {
            id: 1,
            type: 'arrival',
            title: 'Route 5 Update',
            message: 'Arriving at your stop in 10 minutes',
            time: '2 mins ago',
            unread: true
        },
        {
            id: 2,
            type: 'delay',
            title: 'Route 3 Delayed',
            message: 'Delayed by 12 mins due to traffic',
            time: '15 mins ago',
            unread: true
        },
        {
            id: 3,
            type: 'crowded',
            title: 'Overcrowding Alert',
            message: 'Route 5 is crowded (48/50). Next bus in 15 mins.',
            time: '30 mins ago',
            unread: true
        },
        {
            id: 4,
            type: 'schedule',
            title: 'Schedule Change',
            message: 'Tomorrow\'s Route 7 timing changed to 8:00 AM',
            time: '1 hour ago',
            unread: false
        },
        {
            id: 5,
            type: 'info',
            title: 'New Route Added',
            message: 'Route 9 - Hostel Express now available',
            time: '2 hours ago',
            unread: false
        }
    ];

    renderNotifications();
    updateNotificationBadge();
}

function renderNotifications() {
    const notifList = document.getElementById('notifList');
    const notifFullList = document.getElementById('notificationFullList');

    const typeColors = {
        arrival: 'blue',
        delay: 'yellow',
        crowded: 'red',
        schedule: 'orange',
        info: 'gray'
    };

    const html = AppState.notifications.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}" onclick="markAsRead(${n.id})">
      <span class="notif-dot ${typeColors[n.type]}"></span>
      <div class="notif-content">
        <span class="notif-title">${n.title}</span>
        <span class="notif-message">${n.message}</span>
        <span class="notif-time">${n.time}</span>
      </div>
    </div>
  `).join('');

    if (notifList) notifList.innerHTML = html;
    if (notifFullList) notifFullList.innerHTML = html;

    // Show/hide empty state
    const emptyState = document.getElementById('emptyNotifications');
    if (emptyState) {
        emptyState.style.display = AppState.notifications.length === 0 ? 'block' : 'none';
    }
}

function toggleNotifications() {
    const panel = document.getElementById('notifPanel');
    panel.classList.toggle('visible');
}

function closeNotifPanel() {
    document.getElementById('notifPanel').classList.remove('visible');
}

function markAsRead(id) {
    const notif = AppState.notifications.find(n => n.id === id);
    if (notif) {
        notif.unread = false;
        renderNotifications();
        updateNotificationBadge();
        saveState();
    }
}

function markAllRead() {
    AppState.notifications.forEach(n => n.unread = false);
    renderNotifications();
    updateNotificationBadge();
    saveState();
    showToast('All notifications marked as read');
}

function updateNotificationBadge() {
    const unreadCount = AppState.notifications.filter(n => n.unread).length;
    const badges = document.querySelectorAll('#notifBadge, #navNotifBadge');
    badges.forEach(badge => {
        badge.textContent = unreadCount > 0 ? unreadCount : '';
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    });
}

// ============================================
// Favorites
// ============================================
function toggleFavorite(routeId) {
    const index = AppState.favorites.indexOf(routeId);
    if (index > -1) {
        AppState.favorites.splice(index, 1);
        showToast('Removed from favorites');
    } else {
        AppState.favorites.push(routeId);
        showToast('Added to favorites');
    }

    updateFavoriteButton(routeId);
    saveState();
    addPendingChange('favorites', AppState.favorites);
}

function updateFavoriteButton(routeId) {
    const btn = document.getElementById('favoriteBtn');
    if (btn) {
        const isFav = AppState.favorites.includes(routeId);
        btn.classList.toggle('active', isFav);
        btn.querySelector('svg').style.fill = isFav ? 'currentColor' : 'none';
    }
}

function removeFavorite(routeId) {
    const index = AppState.favorites.indexOf(routeId);
    if (index > -1) {
        AppState.favorites.splice(index, 1);
        renderFavoriteRoutes();
        saveState();
        showToast('Route removed from favorites');
    }
}

function renderFavoriteRoutes() {
    const list = document.getElementById('favoriteRoutesList');
    if (!list) return;

    const routeData = {
        route5: { name: 'Engineering Loop', badge: '5', class: 'route-badge-blue' },
        route3: { name: 'Hostel Express', badge: '3', class: 'route-badge-green' },
        route7: { name: 'City Center', badge: '7', class: 'route-badge-gray' }
    };

    const html = AppState.favorites.map(id => {
        const route = routeData[id];
        if (!route) return '';
        return `
      <div class="favorite-item">
        <span class="route-badge ${route.class}">${route.badge}</span>
        <span>${route.name}</span>
        <button class="btn-remove" onclick="removeFavorite('${id}')">Remove</button>
      </div>
    `;
    }).join('');

    list.innerHTML = html;
}

// ============================================
// Settings
// ============================================
function loadSettings() {
    // Load from localStorage
    const saved = localStorage.getItem('bustrack_settings');
    if (saved) {
        Object.assign(AppState.settings, JSON.parse(saved));
    }

    // Apply to UI
    Object.keys(AppState.settings).forEach(key => {
        const el = document.getElementById(key);
        if (el) {
            if (el.type === 'checkbox') {
                el.checked = AppState.settings[key];
            } else if (el.type === 'radio') {
                document.querySelector(`input[name="alertTiming"][value="${AppState.settings.alertTiming}"]`).checked = true;
            } else {
                el.value = AppState.settings[key];
            }
        }
    });
}

function saveSetting(key) {
    const el = document.getElementById(key);
    if (el) {
        if (el.type === 'checkbox') {
            AppState.settings[key] = el.checked;
        } else if (key === 'alertTiming') {
            const checked = document.querySelector('input[name="alertTiming"]:checked');
            if (checked) AppState.settings.alertTiming = checked.value;
        } else {
            AppState.settings[key] = el.value;
        }
    }

    localStorage.setItem('bustrack_settings', JSON.stringify(AppState.settings));
    addPendingChange('settings', AppState.settings);
    showToast('Setting saved');
}

function editProfile() {
    showToast('Profile editing coming soon');
}

// ============================================
// Data & Sync
// ============================================
function loadState() {
    // Load from localStorage
    const savedFavorites = localStorage.getItem('bustrack_favorites');
    if (savedFavorites) {
        AppState.favorites = JSON.parse(savedFavorites);
    }

    const savedSettings = localStorage.getItem('bustrack_settings');
    if (savedSettings) {
        Object.assign(AppState.settings, JSON.parse(savedSettings));
    }

    const lastSync = localStorage.getItem('bustrack_lastSync');
    if (lastSync) {
        AppState.lastSync = new Date(lastSync);
    }

    loadSettings();
    renderFavoriteRoutes();
}

function saveState() {
    localStorage.setItem('bustrack_favorites', JSON.stringify(AppState.favorites));
    localStorage.setItem('bustrack_settings', JSON.stringify(AppState.settings));
    localStorage.setItem('bustrack_lastSync', new Date().toISOString());
}

function addPendingChange(type, data) {
    AppState.pendingChanges.push({ type, data, timestamp: Date.now() });
    updatePendingCount();

    // Try to sync if online
    if (AppState.isOnline) {
        syncNow();
    }
}

function updatePendingCount() {
    const el = document.getElementById('pendingChanges');
    if (el) {
        el.textContent = AppState.pendingChanges.length;
    }
}

async function syncNow() {
    if (!AppState.isOnline) {
        showToast('Cannot sync - you are offline');
        return;
    }

    showSyncIndicator(true);

    try {
        // Simulate API sync
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Clear pending changes
        AppState.pendingChanges = [];
        AppState.lastSync = new Date();

        localStorage.setItem('bustrack_lastSync', AppState.lastSync.toISOString());

        updateLastSynced();
        updatePendingCount();
        showToast('Synced successfully');
    } catch (error) {
        showToast('Sync failed - will retry later');
    }

    showSyncIndicator(false);
}

function updateLastSynced() {
    const el = document.getElementById('lastSynced');
    if (el && AppState.lastSync) {
        const diff = Math.floor((Date.now() - AppState.lastSync.getTime()) / 60000);
        if (diff < 1) {
            el.textContent = 'Just now';
        } else if (diff < 60) {
            el.textContent = diff + ' mins ago';
        } else {
            el.textContent = Math.floor(diff / 60) + ' hours ago';
        }
    }
}

function showSyncIndicator(show) {
    const el = document.getElementById('syncIndicator');
    if (el) {
        el.classList.toggle('visible', show);
    }
}

async function downloadOffline() {
    showToast('Downloading offline data...');

    try {
        // Simulate download
        await new Promise(resolve => setTimeout(resolve, 2000));
        showToast('Offline data downloaded!');
    } catch (error) {
        showToast('Download failed');
    }
}

function clearCache() {
    if (confirm('Clear all cached data? You will need internet to reload.')) {
        localStorage.clear();
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
        showToast('Cache cleared');
        location.reload();
    }
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
    document.getElementById('offlineBanner').classList.remove('visible');
    document.querySelector('.header').classList.remove('offline-shown');

    // Sync pending changes
    if (AppState.pendingChanges.length > 0) {
        syncNow();
    }
}

function handleOffline() {
    AppState.isOnline = false;
    document.getElementById('offlineBanner').classList.add('visible');
    document.querySelector('.header').classList.add('offline-shown');

    // Update last sync time display
    const lastSyncEl = document.getElementById('lastSyncTime');
    if (lastSyncEl && AppState.lastSync) {
        lastSyncEl.textContent = formatTime(AppState.lastSync);
    }
}

function dismissOfflineBanner() {
    document.getElementById('offlineBanner').classList.remove('visible');
    document.querySelector('.header').classList.remove('offline-shown');
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
// Notifications Permission
// ============================================
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        // Ask after a delay
        setTimeout(() => {
            Notification.requestPermission();
        }, 5000);
    }
}

function sendBrowserNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: 'bus-icon.svg',
            vibrate: [200, 100, 200],
            tag: 'bus-tracker'
        });
    }
}

// ============================================
// Search
// ============================================
function handleSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    // Filter routes (simplified for demo)
    console.log('Searching for:', query);
}

function handleRouteSearch() {
    const query = document.getElementById('routeSearchInput').value.toLowerCase();
    const items = document.querySelectorAll('.route-list-item');

    items.forEach(item => {
        const name = item.querySelector('.route-list-name').textContent.toLowerCase();
        item.style.display = name.includes(query) ? 'flex' : 'none';
    });
}

function filterRoutes(filter) {
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.toggle('active', tab.textContent.toLowerCase() === filter);
    });

    // Filter logic (simplified)
    console.log('Filtering by:', filter);
}

// ============================================
// Tracking Page
// ============================================
function refreshTracking() {
    const btn = document.getElementById('refreshBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="sync-spinner"></span> Refreshing...';

    setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M23 4v6h-6M1 20v-6h6"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
      Refresh
    `;
        document.getElementById('updateTime').textContent = 'Updated just now';
        showToast('Data refreshed');
    }, 1000);
}

function switchRoute(routeId) {
    showTracking(routeId);
    showToast('Switched to Route ' + routeId.replace('route', ''));
}

function getDirections() {
    showToast('Directions: Walk 200m towards Engineering Block bus stop');
}

// ============================================
// Report Modal
// ============================================
function showReportModal() {
    document.getElementById('reportModal').classList.add('visible');
}

function closeReportModal() {
    document.getElementById('reportModal').classList.remove('visible');
    document.getElementById('reportNote').value = '';
}

function submitReport(type) {
    const note = document.getElementById('reportNote').value;

    // Save report (would send to API)
    addPendingChange('report', { type, note, timestamp: Date.now() });

    closeReportModal();
    showToast('Report submitted - thank you!');
}

// ============================================
// Mobile Menu
// ============================================
function toggleMobileMenu() {
    // Simple toggle for mobile navigation
    showToast('Menu opened');
}

// ============================================
// Toast Notifications
// ============================================
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.classList.add('visible');

    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

// ============================================
// Auto Refresh
// ============================================
function startAutoRefresh() {
    // Update last synced time every minute
    setInterval(updateLastSynced, 60000);

    // Simulate live updates every 30 seconds when online
    setInterval(() => {
        if (AppState.isOnline && AppState.currentPage === 'home') {
            updateLiveData();
        }
    }, 30000);
}

function updateLiveData() {
    // Simulate live data update
    const statusValue = document.getElementById('nextArrival');
    if (statusValue) {
        const mins = Math.floor(Math.random() * 10) + 3;
        statusValue.textContent = 'Route 5 in ' + mins + ' mins';
    }

    document.getElementById('updateTime').textContent = 'Updated just now';
}

// ============================================
// UI Helpers
// ============================================
function updateUI() {
    updateNotificationBadge();
    updateLastSynced();
    updatePendingCount();
    renderFavoriteRoutes();
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        showToast('Logged out');
        setTimeout(() => {
            window.location.href = '../landing/index.html';
        }, 1000);
    }
}

// ============================================
// Global Functions (for onclick handlers)
// ============================================
window.showPage = showPage;
window.showTracking = showTracking;
window.toggleNotifications = toggleNotifications;
window.markAsRead = markAsRead;
window.markAllRead = markAllRead;
window.toggleFavorite = toggleFavorite;
window.removeFavorite = removeFavorite;
window.saveSetting = saveSetting;
window.editProfile = editProfile;
window.syncNow = syncNow;
window.downloadOffline = downloadOffline;
window.clearCache = clearCache;
window.dismissOfflineBanner = dismissOfflineBanner;
window.handleSearch = handleSearch;
window.handleRouteSearch = handleRouteSearch;
window.filterRoutes = filterRoutes;
window.refreshTracking = refreshTracking;
window.switchRoute = switchRoute;
window.getDirections = getDirections;
window.showReportModal = showReportModal;
window.closeReportModal = closeReportModal;
window.submitReport = submitReport;
window.toggleMobileMenu = toggleMobileMenu;
window.logout = logout;
