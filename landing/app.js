// Bus Tracker - Minimal JavaScript (<5KB)
// No libraries, no animations, just essential functionality

// DOM Elements
const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modalOverlay');
const openBtn = document.getElementById('openLogin');
const heroBtn = document.getElementById('heroLogin');
const closeBtn = document.getElementById('closeModal');
const roleSelection = document.getElementById('roleSelection');
const loginForm = document.getElementById('loginForm');
const roleTitle = document.getElementById('roleTitle');
const loginRoleIcon = document.getElementById('loginRoleIcon');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');
const offlineBanner = document.getElementById('offlineBanner');

// Current selected role
let currentRole = '';

// Role colors
const roleColors = {
  Student: '#3b82f6',
  Driver: '#10b981',
  Admin: '#f59e0b'
};

const roleGradients = {
  Student: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
  Driver: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
  Admin: 'linear-gradient(135deg, #fffbeb, #fef3c7)'
};

// Open modal
function openModal() {
  modal.style.display = 'flex';
  showRoleSelection();
  document.body.style.overflow = 'hidden';
}

if (openBtn) openBtn.onclick = openModal;
if (heroBtn) heroBtn.onclick = openModal;

// Close modal
function closeModal() {
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

if (closeBtn) closeBtn.onclick = closeModal;
if (modalOverlay) modalOverlay.onclick = closeModal;

// Close on escape key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && modal.style.display === 'flex') {
    closeModal();
  }
});

// Show role selection
function showRoleSelection() {
  roleSelection.style.display = 'block';
  loginForm.style.display = 'none';
}

// Select role and show login form
function selectRole(role) {
  currentRole = role;
  roleSelection.style.display = 'none';
  loginForm.style.display = 'block';
  roleTitle.textContent = role + ' Login';

  // Update icon styling
  loginRoleIcon.style.background = roleGradients[role];

  // Update submit button color
  loginSubmitBtn.style.background = roleColors[role];

  // Update placeholder based on role
  const userIdInput = document.getElementById('userId');
  if (role === 'Student') {
    userIdInput.placeholder = 'Enter Student ID';
  } else if (role === 'Driver') {
    userIdInput.placeholder = 'Enter Driver ID';
  } else {
    userIdInput.placeholder = 'Enter Email';
  }

  // Clear form
  userIdInput.value = '';
  document.getElementById('password').value = '';

  // Focus first input
  setTimeout(() => userIdInput.focus(), 100);
}

// Handle login form submission
function handleLogin(e) {
  e.preventDefault();

  const userId = document.getElementById('userId').value;
  const password = document.getElementById('password').value;

  // Basic validation
  if (!userId || !password) {
    alert('Please fill in all fields');
    return;
  }

  // Store role for redirect
  localStorage.setItem('userRole', currentRole);
  localStorage.setItem('userId', userId);

  // Redirect based on role
  if (currentRole === 'Student') {
    window.location.href = '../student/index.html';
  } else if (currentRole === 'Driver') {
    window.location.href = '../driver/index.html';
  } else if (currentRole === 'Admin') {
    window.location.href = '../admin/index.html';
  }
}

// Make functions global
window.selectRole = selectRole;
window.showRoleSelection = showRoleSelection;
window.handleLogin = handleLogin;

// Offline detection
function updateOnlineStatus() {
  if (navigator.onLine) {
    offlineBanner.style.display = 'none';
  } else {
    offlineBanner.style.display = 'flex';
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(function (reg) {
      console.log('SW registered');
    })
    .catch(function (err) {
      console.log('SW failed:', err);
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && href.length > 1) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});
