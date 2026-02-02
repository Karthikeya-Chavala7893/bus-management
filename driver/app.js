// Bus Tracker Driver App - Vanilla JavaScript
// Ultra-simple, works 100% offline, bulletproof reliability

// ============================================
// Application State
// ============================================
const App = {
    // Driver info
    driver: {
        id: '',
        name: 'Driver',
        busNumber: '101'
    },

    // Current trip state
    trip: {
        active: false,
        routeId: 'route5',
        routeName: 'Engineering Loop',
        startTime: null,
        currentStop: 0,
        totalStops: 7,
        passengers: 0,
        checkIns: []
    },

    // Route data
    stops: [
        { id: 1, name: 'Main Gate', address: 'College entrance' },
        { id: 2, name: 'Library', address: 'Central Library' },
        { id: 3, name: 'Science Block', address: 'Near Labs' },
        { id: 4, name: 'Medical Center', address: 'Hospital campus' },
        { id: 5, name: 'Admin Block', address: 'Main office' },
        { id: 6, name: 'Engineering Block', address: 'Tech campus' },
        { id: 7, name: 'Hostel Gate', address: 'Depot return' }
    ],

    // Settings
    settings: {
        vibration: true,
        sound: false,
        wifiOnly: true,
        brightness: false
    },

    // Sync state
    sync: {
        pending: [],
        lastSync: null,
        isOnline: navigator.onLine
    }
};

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Hide splash after 1.5 seconds
    setTimeout(() => {
        document.getElementById('splashScreen').style.display = 'none';
        checkLoginState();
    }, 1500);

    // Load saved data
    loadSavedData();

    // Start clock
    updateClock();
    setInterval(updateClock, 1000);

    // Setup offline detection
    setupOfflineDetection();

    // Register service worker
    registerServiceWorker();

    // Recover from crash if needed
    recoverTrip();
}

function checkLoginState() {
    const savedDriver = localStorage.getItem('driver_data');
    const seenOnboarding = localStorage.getItem('seen_onboarding');

    if (savedDriver) {
        App.driver = JSON.parse(savedDriver);
        showScreen('mainScreen');
        updateDriverInfo();
        renderStops();
    } else if (!seenOnboarding) {
        showScreen('onboardingScreen');
    } else {
        showScreen('loginScreen');
    }
}

function loadSavedData() {
    // Load settings
    const savedSettings = localStorage.getItem('driver_settings');
    if (savedSettings) {
        App.settings = JSON.parse(savedSettings);
        applySettings();
    }

    // Load pending sync data
    const pendingData = localStorage.getItem('pending_sync');
    if (pendingData) {
        App.sync.pending = JSON.parse(pendingData);
    }

    // Load last sync time
    const lastSync = localStorage.getItem('last_sync');
    if (lastSync) {
        App.sync.lastSync = new Date(lastSync);
        updateSyncInfo();
    }
}

function applySettings() {
    document.getElementById('vibrationSetting').checked = App.settings.vibration;
    document.getElementById('soundSetting').checked = App.settings.sound;
    document.getElementById('wifiOnlySetting').checked = App.settings.wifiOnly;
    document.getElementById('brightnessSetting').checked = App.settings.brightness;
}

// ============================================
// Screen Navigation
// ============================================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(screenId).style.display = 'block';
}

// ============================================
// Onboarding
// ============================================
let currentSlide = 1;

function nextSlide() {
    if (currentSlide < 3) {
        currentSlide++;
        updateSlide();
    } else {
        skipOnboarding();
    }
}

function goToSlide(num) {
    currentSlide = num;
    updateSlide();
}

function updateSlide() {
    // Update slides
    document.querySelectorAll('.onboarding-slide').forEach((s, i) => {
        s.classList.toggle('active', i + 1 === currentSlide);
    });

    // Update dots
    document.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i + 1 === currentSlide);
    });

    // Update button text
    const btn = document.getElementById('onboardingBtn');
    btn.textContent = currentSlide === 3 ? "GOT IT!" : "NEXT";
}

function skipOnboarding() {
    localStorage.setItem('seen_onboarding', 'true');
    showScreen('loginScreen');
}

// ============================================
// Login
// ============================================
function handleLogin(e) {
    e.preventDefault();

    const driverId = document.getElementById('driverId').value;
    const pin = document.getElementById('driverPin').value;
    const remember = document.getElementById('rememberMe').checked;

    // Simple validation (in production, verify against server)
    if (driverId && pin.length === 4) {
        App.driver = {
            id: driverId,
            name: 'Ravi Kumar', // Would come from server
            busNumber: '101'
        };

        if (remember) {
            localStorage.setItem('driver_data', JSON.stringify(App.driver));
        }

        showScreen('mainScreen');
        updateDriverInfo();
        renderStops();
        showToast('Welcome, ' + App.driver.name + '!');
    } else {
        showToast('Invalid credentials');
    }
}

function updateDriverInfo() {
    document.getElementById('driverName').textContent = App.driver.name;
    document.getElementById('busNumber').textContent = 'Bus ' + App.driver.busNumber;
}

function logout() {
    if (App.trip.active) {
        showToast('Complete current trip first');
        return;
    }

    showConfirm('Logout', 'Are you sure you want to logout?', () => {
        localStorage.removeItem('driver_data');
        App.driver = { id: '', name: 'Driver', busNumber: '101' };
        toggleMenu();
        showScreen('loginScreen');
    });
}

// ============================================
// Main Action Button
// ============================================
function handleMainAction() {
    if (!App.trip.active) {
        // Start trip
        startTrip();
    } else if (App.trip.currentStop < App.trip.totalStops) {
        // Check in at stop
        checkInStop();
    } else {
        // End trip
        endTrip();
    }
}

function startTrip() {
    App.trip.active = true;
    App.trip.startTime = new Date();
    App.trip.currentStop = 0;
    App.trip.checkIns = [];
    App.trip.passengers = 0;

    // Save trip state for crash recovery
    saveTripState();

    // Feedback
    vibrate();
    showSuccess('Trip Started!');

    // Update UI
    setTimeout(() => {
        updateTripUI();
    }, 1500);
}

function checkInStop() {
    const stopIndex = App.trip.currentStop;
    const stop = App.stops[stopIndex];
    const now = new Date();

    // Record check-in
    const checkIn = {
        stopId: stop.id,
        stopName: stop.name,
        timestamp: now.toISOString(),
        passengers: App.trip.passengers
    };

    App.trip.checkIns.push(checkIn);
    App.trip.currentStop++;

    // Save to local storage (offline first)
    saveCheckIn(checkIn);
    saveTripState();

    // Feedback
    vibrate();
    showSuccess(stop.name + ' ✓');

    // Update UI
    setTimeout(() => {
        updateTripUI();
        renderStops();
    }, 1500);
}

function endTrip() {
    const endTime = new Date();

    // Complete trip record
    const tripRecord = {
        id: Date.now(),
        routeId: App.trip.routeId,
        routeName: App.trip.routeName,
        busNumber: App.driver.busNumber,
        driverId: App.driver.id,
        startTime: App.trip.startTime.toISOString(),
        endTime: endTime.toISOString(),
        stops: App.trip.checkIns,
        totalPassengers: App.trip.passengers,
        synced: false
    };

    // Save to pending sync
    App.sync.pending.push(tripRecord);
    localStorage.setItem('pending_sync', JSON.stringify(App.sync.pending));

    // Clear trip state
    localStorage.removeItem('active_trip');

    // Feedback
    vibrate();

    // Show completion screen
    showCompletionScreen(tripRecord);

    // Try to sync
    if (App.sync.isOnline) {
        attemptSync();
    }
}

function showCompletionScreen(trip) {
    const start = new Date(trip.startTime);
    const end = new Date(trip.endTime);
    const duration = Math.floor((end - start) / 60000);
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;

    document.getElementById('completeTime').textContent = formatTime(end);
    document.getElementById('summaryStart').textContent = formatTime(start);
    document.getElementById('summaryEnd').textContent = formatTime(end);
    document.getElementById('summaryDuration').textContent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    document.getElementById('summaryStops').textContent = trip.stops.length + '/' + App.trip.totalStops + ' ✓';

    if (trip.totalPassengers > 0) {
        document.getElementById('passengerSummary').style.display = 'flex';
        document.getElementById('summaryPassengers').textContent = trip.totalPassengers;
    }

    updateSyncCard();
    showScreen('completeScreen');

    // Reset trip state
    App.trip.active = false;
    App.trip.currentStop = 0;
    App.trip.checkIns = [];
}

function updateSyncCard() {
    const card = document.getElementById('syncCard');
    const icon = document.getElementById('syncCardIcon');
    const text = document.getElementById('syncCardText');
    const sub = document.getElementById('syncCardSub');

    if (App.sync.isOnline) {
        card.className = 'sync-card success';
        icon.textContent = '✓';
        text.textContent = 'Data synced to server';
        sub.textContent = '';
    } else {
        card.className = 'sync-card';
        icon.textContent = '☁️';
        text.textContent = 'Will sync when WiFi available';
        sub.textContent = App.sync.pending.length + ' trip(s) waiting to sync';
    }
}

function startNewTrip() {
    App.trip.active = false;
    App.trip.currentStop = 0;
    showScreen('mainScreen');
    updateTripUI();
    renderStops();
}

function goHome() {
    App.trip.active = false;
    App.trip.currentStop = 0;
    showScreen('mainScreen');
    updateTripUI();
    renderStops();
}

// ============================================
// Trip UI Updates
// ============================================
function updateTripUI() {
    const btn = document.getElementById('actionButton');
    const icon = document.getElementById('actionIcon');
    const text = document.getElementById('actionText');
    const statusCard = document.getElementById('statusCard');
    const statusIcon = document.getElementById('statusIcon');
    const statusText = document.getElementById('statusText');
    const statusSub = document.getElementById('statusSub');
    const progress = document.getElementById('stopProgress');

    if (!App.trip.active) {
        // Ready to start
        btn.className = 'action-button start';
        icon.textContent = '▶';
        text.textContent = 'START TRIP';

        statusCard.className = 'status-card ready';
        statusIcon.textContent = '🚌';
        statusText.textContent = 'Ready to start Route 5';
        statusSub.textContent = 'Engineering Loop • 7 stops';

        progress.textContent = '0/' + App.trip.totalStops;

    } else if (App.trip.currentStop < App.trip.totalStops) {
        // Trip in progress
        const nextStop = App.stops[App.trip.currentStop];

        btn.className = 'action-button checkin';
        icon.textContent = '✓';
        text.textContent = 'REACHED ' + nextStop.name.toUpperCase();

        statusCard.className = 'status-card active';
        statusIcon.textContent = '🚌';
        statusText.textContent = 'Trip in Progress';
        statusSub.textContent = 'Stop ' + App.trip.currentStop + ' of ' + App.trip.totalStops + ' completed';

        progress.textContent = App.trip.currentStop + '/' + App.trip.totalStops;

    } else {
        // Ready to end
        btn.className = 'action-button end';
        icon.textContent = '■';
        text.textContent = 'END TRIP';

        statusCard.className = 'status-card complete';
        statusIcon.textContent = '✅';
        statusText.textContent = 'All stops completed!';
        statusSub.textContent = 'Tap to end trip and save data';

        progress.textContent = App.trip.totalStops + '/' + App.trip.totalStops;
    }
}

function renderStops() {
    const container = document.getElementById('stopList');

    const html = App.stops.map((stop, index) => {
        let className = 'stop-item';
        let statusText = '';
        let statusClass = '';

        if (index < App.trip.currentStop) {
            className += ' completed';
            const checkIn = App.trip.checkIns[index];
            statusText = checkIn ? formatTime(new Date(checkIn.timestamp)) : '✓';
            statusClass = 'completed';
        } else if (index === App.trip.currentStop && App.trip.active) {
            className += ' current';
            statusText = 'NEXT →';
            statusClass = 'current';
        } else {
            statusText = 'Pending';
        }

        return `
      <div class="${className}">
        <div class="stop-number">${index < App.trip.currentStop ? '✓' : index + 1}</div>
        <div class="stop-info">
          <span class="stop-name">${stop.name}</span>
          <span class="stop-address">${stop.address}</span>
        </div>
        <span class="stop-status ${statusClass}">${statusText}</span>
      </div>
    `;
    }).join('');

    container.innerHTML = html;

    // Auto-scroll to current stop
    if (App.trip.active && App.trip.currentStop > 0) {
        const currentItem = container.children[App.trip.currentStop];
        if (currentItem) {
            currentItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

// ============================================
// Passenger Count
// ============================================
function togglePassengerCount() {
    const controls = document.getElementById('passengerControls');
    const icon = document.getElementById('toggleIcon');

    if (controls.style.display === 'none') {
        controls.style.display = 'block';
        icon.textContent = '−';
    } else {
        controls.style.display = 'none';
        icon.textContent = '+';
    }
}

function adjustCount(delta) {
    App.trip.passengers = Math.max(0, Math.min(100, App.trip.passengers + delta));
    document.getElementById('passengerCount').textContent = App.trip.passengers;
    vibrate(50);
}

function setCount(value) {
    App.trip.passengers = value;
    document.getElementById('passengerCount').textContent = App.trip.passengers;
    vibrate(50);
}

function savePassengerCount() {
    showToast('Passenger count saved: ' + App.trip.passengers);
    togglePassengerCount();
}

// ============================================
// Data Storage & Sync
// ============================================
function saveCheckIn(checkIn) {
    // Save to local storage immediately
    const key = 'checkin_' + Date.now();
    localStorage.setItem(key, JSON.stringify(checkIn));
}

function saveTripState() {
    localStorage.setItem('active_trip', JSON.stringify({
        active: App.trip.active,
        routeId: App.trip.routeId,
        startTime: App.trip.startTime,
        currentStop: App.trip.currentStop,
        checkIns: App.trip.checkIns,
        passengers: App.trip.passengers
    }));
}

function recoverTrip() {
    const saved = localStorage.getItem('active_trip');
    if (saved) {
        const tripData = JSON.parse(saved);
        if (tripData.active) {
            // Restore trip state
            Object.assign(App.trip, tripData);
            App.trip.startTime = new Date(tripData.startTime);

            // Ask to continue
            showConfirm(
                'Resume Trip?',
                'A trip was in progress. Continue from Stop ' + (App.trip.currentStop + 1) + '?',
                () => {
                    updateTripUI();
                    renderStops();
                },
                () => {
                    // Discard and start fresh
                    localStorage.removeItem('active_trip');
                    App.trip.active = false;
                    App.trip.currentStop = 0;
                    updateTripUI();
                    renderStops();
                }
            );
        }
    }
}

async function attemptSync() {
    if (App.sync.pending.length === 0) return;
    if (App.settings.wifiOnly && !isWiFiConnected()) return;

    updateSyncStatus('syncing');

    try {
        // Simulate sync (in production, send to server)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mark as synced
        App.sync.pending.forEach(trip => trip.synced = true);
        App.sync.pending = [];
        localStorage.setItem('pending_sync', JSON.stringify(App.sync.pending));

        // Update last sync time
        App.sync.lastSync = new Date();
        localStorage.setItem('last_sync', App.sync.lastSync.toISOString());

        updateSyncStatus('synced');
        updateSyncInfo();
        showToast('Data synced successfully!');

    } catch (error) {
        console.error('Sync failed:', error);
        updateSyncStatus('offline');
        showToast('Sync failed - will retry later');
    }
}

function manualSync() {
    toggleMenu();
    if (!App.sync.isOnline) {
        showToast('No internet connection');
        return;
    }
    attemptSync();
}

function updateSyncStatus(status) {
    const icon = document.querySelector('.sync-icon');
    const text = document.querySelector('.sync-text');

    icon.className = 'sync-icon ' + status;

    switch (status) {
        case 'offline':
            icon.textContent = '☁';
            text.textContent = 'Offline';
            break;
        case 'syncing':
            icon.textContent = '↻';
            text.textContent = 'Syncing...';
            break;
        case 'synced':
            icon.textContent = '✓';
            text.textContent = 'Synced';
            break;
    }
}

function updateSyncInfo() {
    const el = document.getElementById('syncInfo');
    const pendingEl = document.getElementById('pendingCount');

    if (App.sync.lastSync) {
        const diff = Math.floor((Date.now() - App.sync.lastSync.getTime()) / 60000);
        if (diff < 1) {
            el.textContent = 'Last synced: Just now';
        } else if (diff < 60) {
            el.textContent = 'Last synced: ' + diff + ' mins ago';
        } else {
            el.textContent = 'Last synced: ' + Math.floor(diff / 60) + ' hours ago';
        }
    } else {
        el.textContent = 'Last synced: Never';
    }

    if (pendingEl) {
        pendingEl.textContent = App.sync.pending.length + ' trips';
    }
}

function isWiFiConnected() {
    // Check connection type if available
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
        return connection.type === 'wifi';
    }
    return true; // Assume WiFi if can't detect
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
    App.sync.isOnline = true;
    updateSyncStatus('offline'); // Show as ready to sync
    showToast('Internet connected');

    // Auto-sync pending data
    if (App.sync.pending.length > 0) {
        setTimeout(attemptSync, 1000);
    }
}

function handleOffline() {
    App.sync.isOnline = false;
    updateSyncStatus('offline');
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
// Clock
// ============================================
function updateClock() {
    const now = new Date();
    document.getElementById('currentTime').textContent = formatTime(now);
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// ============================================
// UI Helpers
// ============================================
function vibrate(duration = 200) {
    if (App.settings.vibration && navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

function showSuccess(message) {
    const overlay = document.getElementById('successOverlay');
    document.getElementById('successText').textContent = message;
    overlay.classList.add('visible');

    setTimeout(() => {
        overlay.classList.remove('visible');
    }, 1500);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('visible');

    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

let confirmCallback = null;
let cancelCallback = null;

function showConfirm(title, message, onConfirm, onCancel) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = onConfirm;
    cancelCallback = onCancel;
    document.getElementById('confirmModal').classList.add('visible');
}

function confirmAction() {
    document.getElementById('confirmModal').classList.remove('visible');
    if (confirmCallback) confirmCallback();
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('visible');
    if (cancelCallback) cancelCallback();
}

// ============================================
// Menu
// ============================================
function toggleMenu() {
    document.getElementById('menuOverlay').classList.toggle('visible');
    document.getElementById('menuSidebar').classList.toggle('visible');
}

// ============================================
// Screens Navigation
// ============================================
function showHelp() {
    toggleMenu();
    showScreen('helpScreen');
}

function closeHelp() {
    showScreen('mainScreen');
}

function showSettings() {
    toggleMenu();
    updateSyncInfo();
    showScreen('settingsScreen');
}

function closeSettings() {
    showScreen('mainScreen');
}

function showSchedule() {
    toggleMenu();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    document.getElementById('scheduleDate').textContent =
        days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
    showScreen('scheduleScreen');
}

function closeSchedule() {
    showScreen('mainScreen');
}

function showHistory() {
    toggleMenu();
    showToast('Trip history: ' + App.sync.pending.length + ' trips recorded');
}

// ============================================
// Settings
// ============================================
function saveSetting(key) {
    const el = document.getElementById(key + 'Setting');
    if (el) {
        App.settings[key] = el.checked;
        localStorage.setItem('driver_settings', JSON.stringify(App.settings));
        showToast('Setting saved');
    }
}

function clearOldData() {
    showConfirm('Clear Data', 'Delete data older than 7 days?', () => {
        // In production, filter by date
        showToast('Old data cleared');
    });
}

// ============================================
// Emergency
// ============================================
function callEmergency() {
    toggleMenu();
    window.location.href = 'tel:+919876543210';
}

// ============================================
// Global Functions
// ============================================
window.handleLogin = handleLogin;
window.handleMainAction = handleMainAction;
window.nextSlide = nextSlide;
window.goToSlide = goToSlide;
window.skipOnboarding = skipOnboarding;
window.toggleMenu = toggleMenu;
window.showHelp = showHelp;
window.closeHelp = closeHelp;
window.showSettings = showSettings;
window.closeSettings = closeSettings;
window.showSchedule = showSchedule;
window.closeSchedule = closeSchedule;
window.showHistory = showHistory;
window.logout = logout;
window.manualSync = manualSync;
window.saveSetting = saveSetting;
window.clearOldData = clearOldData;
window.callEmergency = callEmergency;
window.togglePassengerCount = togglePassengerCount;
window.adjustCount = adjustCount;
window.setCount = setCount;
window.savePassengerCount = savePassengerCount;
window.confirmAction = confirmAction;
window.closeConfirmModal = closeConfirmModal;
window.startNewTrip = startNewTrip;
window.goHome = goHome;
