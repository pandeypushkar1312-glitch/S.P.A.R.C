// ==========================================================================
// VOLTRIDE — MAIN APPLICATION CONTROLLER & REACTIVE UI ENGINE
// ==========================================================================

import L from 'leaflet';
import confetti from 'canvas-confetti';
import { simulator } from './simulator.js';
import { t, setLanguage, getCurrentLanguage } from './i18n.js';

// Application State Store (Riverpod-Style Clean Store)
export const AppState = {
  currentScreen: 'onboarding', // 'onboarding' | 'permissions' | 'auth' | 'home' | 'payment' | 'tracking' | 'unlock' | 'charging' | 'summary' | 'orders' | 'wallet' | 'profile' | 'support' | 'notifications' | 'admin' | 'accessibility'
  activeTab: 'home',
  user: {
    name: 'Alex Rivera',
    phone: '+91 98765 43210',
    email: 'alex.rivera@campus.edu',
    walletBalance: 240,
    voltPoints: 480,
    streakDays: 4,
    referralCode: 'VOLT-CAMPUS-99',
    isLoggedIn: false,
    isGuest: false
  },
  settings: {
    demoMode: true,
    language: 'en',
    textSize: 100,
    boldText: false,
    dyslexicFont: false,
    highContrast: false,
    colorBlindMode: 'none', // 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
    reduceMotion: false,
    reduceTransparency: false,
    hapticFeedback: true,
    speechEnabled: true,
    oneHandedMode: false,
    leftHanded: false,
    easyMode: false
  },
  orderDraft: {
    dest_lat: 12.9716,
    dest_lng: 77.5946,
    dest_name: 'Engineering Library Walkway',
    charging_mode: 'fast_15w', // 'standard_5w' | 'fast_15w'
    target_duration_mins: 30,
    target_pct: 85,
    promo_code: '',
    promo_discount: 0,
    payment_method: 'wallet' // 'upi' | 'card' | 'wallet' | 'pay_later'
  },
  savedPlaces: [
    { id: 1, name: 'Library', lat: 12.9716, lng: 77.5946, icon: 'book' },
    { id: 2, name: 'Hostel 4', lat: 12.9735, lng: 77.5962, icon: 'home' },
    { id: 3, name: 'Eng Quad', lat: 12.9705, lng: 77.5925, icon: 'cpu' },
    { id: 4, name: 'Cafeteria', lat: 12.9720, lng: 77.5938, icon: 'coffee' }
  ],
  notifications: [
    { id: 1, title: 'Rover ROV-01 Available', body: 'Ready for dispatch near Engineering Quad with 92% battery.', category: 'order', unread: true, time: '2m ago' },
    { id: 2, title: 'Weekly Green Streak!', body: 'You charged 4 times this week and saved 280g of carbon.', category: 'charging', unread: true, time: '1h ago' },
    { id: 3, title: 'Promo Code: CAMPUS50', body: 'Get 50% off on Fast 15W Qi charging for the exam week.', category: 'offers', unread: false, time: '1d ago' },
    { id: 4, title: 'Safety Geofence Active', body: 'Autonomous rovers operate strictly inside the campus perimeter.', category: 'safety', unread: false, time: '2d ago' }
  ],
  orderHistory: [
    { id: 'ORD-9901', rover_id: 'ROV-01', date: 'Today, 2:30 PM', location: 'Engineering Library', mode: 'Fast 15W', duration: '28m', energy: '5.2 Wh', cost: 35, status: 'Completed' },
    { id: 'ORD-9884', rover_id: 'ROV-02', date: 'Yesterday, 5:10 PM', location: 'Hostel Block 4', mode: 'Standard 5W', duration: '40m', energy: '3.1 Wh', cost: 25, status: 'Completed' },
    { id: 'ORD-9842', rover_id: 'ROV-01', date: '3 days ago', location: 'Campus Cafe', mode: 'Fast 15W', duration: '20m', energy: '4.8 Wh', cost: 30, status: 'Completed' }
  ],
  mapInstance: null,
  roverMarkers: {},
  userMarker: null,
  routePolyline: null
};

// ==========================================================================
// AUDIO, HAPTICS & ACCESSIBILITY TTS ENGINE
// ==========================================================================
export function triggerHaptic(type = 'light') {
  if (!AppState.settings.hapticFeedback || !navigator.vibrate) return;
  if (type === 'light') navigator.vibrate(30);
  else if (type === 'medium') navigator.vibrate(60);
  else if (type === 'heavy') navigator.vibrate([100, 50, 100]);
  else if (type === 'success') navigator.vibrate([40, 60, 80]);
}

export function speakText(text) {
  if (!AppState.settings.speechEnabled || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  const lang = getCurrentLanguage();
  if (lang === 'ta') utterance.lang = 'ta-IN';
  else if (lang === 'hi') utterance.lang = 'hi-IN';
  else utterance.lang = 'en-US';
  window.speechSynthesis.speak(utterance);
}

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : type === 'danger' ? '✕' : 'ℹ'}</span>
    <span class="toast-msg">${message}</span>
  `;
  container.appendChild(toast);
  triggerHaptic('light');

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================================================
// ROUTER & NAVIGATION CONTROLLER
// ==========================================================================
export function navigateTo(screenName, tabName = null) {
  AppState.currentScreen = screenName;
  if (tabName) AppState.activeTab = tabName;
  
  triggerHaptic('light');

  // Update Bottom Nav state
  const bottomNav = document.getElementById('bottom-nav');
  if (['onboarding', 'permissions', 'auth'].includes(screenName)) {
    bottomNav.style.display = 'none';
  } else {
    bottomNav.style.display = 'flex';
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === (tabName || screenName));
    });
  }

  // Render Screen in Viewport
  const viewport = document.getElementById('viewport');
  viewport.innerHTML = '';

  switch (screenName) {
    case 'onboarding':
      renderOnboardingScreen(viewport);
      break;
    case 'permissions':
      renderPermissionsScreen(viewport);
      break;
    case 'auth':
      renderAuthScreen(viewport);
      break;
    case 'home':
      renderHomeScreen(viewport);
      break;
    case 'payment':
      renderPaymentScreen(viewport);
      break;
    case 'tracking':
      renderTrackingScreen(viewport);
      break;
    case 'unlock':
      renderUnlockScreen(viewport);
      break;
    case 'charging':
      renderChargingScreen(viewport);
      break;
    case 'summary':
      renderSummaryScreen(viewport);
      break;
    case 'orders':
      renderOrdersScreen(viewport);
      break;
    case 'wallet':
      renderWalletScreen(viewport);
      break;
    case 'profile':
      renderProfileScreen(viewport);
      break;
    case 'support':
      renderSupportScreen(viewport);
      break;
    case 'notifications':
      renderNotificationsScreen(viewport);
      break;
    case 'admin':
      renderAdminScreen(viewport);
      break;
    case 'accessibility':
      renderAccessibilityScreen(viewport);
      break;
    default:
      renderHomeScreen(viewport);
  }
}

// ==========================================================================
// SCREEN 1: SPLASH & ONBOARDING (3 Animated Slides + Skip)
// ==========================================================================
function renderOnboardingScreen(container) {
  let currentSlide = 0;
  const slides = [
    {
      title: t('onboard_title_1'),
      desc: t('onboard_desc_1'),
      badge: 'ON-DEMAND AUTONOMY',
      icon: `<svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" stroke-width="1.8"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="11"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>`
    },
    {
      title: t('onboard_title_2'),
      desc: t('onboard_desc_2'),
      badge: 'CRYPTOGRAPHIC SAFETY',
      icon: `<svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="#7C4DFF" stroke-width="1.8"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1.5"/></svg>`
    },
    {
      title: t('onboard_title_3'),
      desc: t('onboard_desc_3'),
      badge: '15W FAST INDUCTIVE',
      icon: `<svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="#2EE6A6" stroke-width="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
    }
  ];

  function renderSlide() {
    const s = slides[currentSlide];
    container.innerHTML = `
      <div style="flex:1; display:flex; flex-direction:column; justify-content:space-between; padding:2rem 1.5rem; text-align:center;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="width:12px; height:12px; border-radius:50%; background:var(--neon-cyan); box-shadow:0 0 8px var(--neon-cyan);"></div>
            <span style="font-family:var(--heading-font); font-weight:800; letter-spacing:0.1em; color:var(--text-main);">VOLTRIDE</span>
          </div>
          <button id="btn-skip-onboard" class="chip" style="border:none; background:rgba(255,255,255,0.06);">${t('btn_skip')}</button>
        </div>

        <div style="margin:2rem 0; display:flex; flex-direction:column; align-items:center;">
          <div style="width:140px; height:140px; border-radius:50%; background:rgba(0,229,255,0.06); border:1px solid rgba(0,229,255,0.25); display:flex; align-items:center; justify-content:center; box-shadow:var(--primary-glow); margin-bottom:2rem;">
            ${s.icon}
          </div>
          <span class="badge badge-success" style="margin-bottom:1rem;">${s.badge}</span>
          <h1 style="font-family:var(--heading-font); font-size:1.6rem; font-weight:700; line-height:1.25; margin-bottom:0.8rem;">${s.title}</h1>
          <p style="color:var(--text-secondary); font-size:0.95rem; max-width:320px;">${s.desc}</p>
        </div>

        <div>
          <!-- Carousel Dots -->
          <div style="display:flex; justify-content:center; gap:8px; margin-bottom:2rem;">
            ${slides.map((_, idx) => `
              <div style="width:${idx === currentSlide ? '28px' : '8px'}; height:8px; border-radius:4px; background:${idx === currentSlide ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.2)'}; transition:all 0.3s ease;"></div>
            `).join('')}
          </div>

          <button id="btn-next-onboard" class="btn btn-primary btn-full">
            ${currentSlide === slides.length - 1 ? t('btn_get_started') : t('btn_next')}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-skip-onboard').onclick = () => navigateTo('permissions');
    document.getElementById('btn-next-onboard').onclick = () => {
      triggerHaptic('light');
      if (currentSlide < slides.length - 1) {
        currentSlide++;
        renderSlide();
      } else {
        navigateTo('permissions');
      }
    };
  }

  renderSlide();
}

// ==========================================================================
// SCREEN 1B: PERMISSIONS EXPLANATION SCREEN
// ==========================================================================
function renderPermissionsScreen(container) {
  container.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; justify-content:space-between; padding:2rem 1.5rem;">
      <div>
        <span class="badge badge-warning" style="margin-bottom:1rem;">DEVICE SENSORS</span>
        <h1 style="font-family:var(--heading-font); font-size:1.6rem; font-weight:700; margin-bottom:0.8rem;">${t('perm_title')}</h1>
        <p style="color:var(--text-secondary); font-size:0.95rem; margin-bottom:2rem;">${t('perm_desc')}</p>

        <div class="card" style="margin-bottom:1rem; display:flex; align-items:center; gap:14px;">
          <div style="width:48px; height:48px; border-radius:14px; background:rgba(0,229,255,0.1); border:1px solid rgba(0,229,255,0.3); display:flex; align-items:center; justify-content:center; color:var(--neon-cyan);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div style="flex:1;">
            <div style="font-weight:600;">${t('perm_loc')}</div>
            <div style="font-size:0.8rem; color:var(--text-secondary);">Calculates rover distance, route ETA, and docking accuracy.</div>
          </div>
          <span style="color:var(--status-success); font-weight:700;">✓</span>
        </div>

        <div class="card" style="display:flex; align-items:center; gap:14px;">
          <div style="width:48px; height:48px; border-radius:14px; background:rgba(124,77,255,0.1); border:1px solid rgba(124,77,255,0.3); display:flex; align-items:center; justify-content:center; color:var(--neon-violet);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
          <div style="flex:1;">
            <div style="font-weight:600;">${t('perm_notif')}</div>
            <div style="font-size:0.8rem; color:var(--text-secondary);">Alerts you immediately when the rover arrives at your doorstep.</div>
          </div>
          <span style="color:var(--status-success); font-weight:700;">✓</span>
        </div>
      </div>

      <button id="btn-accept-perms" class="btn btn-primary btn-full">
        ${t('btn_allow_all')}
      </button>
    </div>
  `;

  document.getElementById('btn-accept-perms').onclick = () => {
    triggerHaptic('success');
    showToast('Permissions granted for GPS & Notifications', 'success');
    navigateTo('auth');
  };
}

// ==========================================================================
// SCREEN 2: AUTH SCREEN (Phone OTP, Google Mock, Guest Mode)
// ==========================================================================
function renderAuthScreen(container) {
  let step = 'phone'; // 'phone' or 'otp'
  let enteredPhone = '+91 98765 43210';

  function render() {
    container.innerHTML = `
      <div style="flex:1; display:flex; flex-direction:column; justify-content:space-between; padding:2rem 1.5rem;">
        <div>
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:1.5rem;">
            <div style="width:36px; height:36px; border-radius:10px; background:var(--primary-gradient); display:flex; align-items:center; justify-content:center; color:#05060A; font-weight:800;">⚡</div>
            <span style="font-family:var(--heading-font); font-size:1.2rem; font-weight:800;">VOLTRIDE</span>
          </div>

          <h1 style="font-family:var(--heading-font); font-size:1.6rem; font-weight:700; margin-bottom:0.4rem;">${t('auth_title')}</h1>
          <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:2rem;">${t('auth_subtitle')}</p>

          ${step === 'phone' ? `
            <div class="input-group">
              <label class="input-label">${t('auth_phone_placeholder')}</label>
              <div style="display:flex; gap:10px;">
                <span class="card" style="padding:0.8rem 1rem; font-weight:600; display:flex; align-items:center;">+91</span>
                <input id="auth-phone-input" class="input-field" type="tel" value="98765 43210" placeholder="Mobile Number" />
              </div>
            </div>

            <button id="btn-send-otp" class="btn btn-primary btn-full" style="margin-top:0.5rem; margin-bottom:1.5rem;">
              ${t('auth_get_otp')}
            </button>

            <div style="display:flex; align-items:center; gap:12px; margin-bottom:1.5rem;">
              <div style="flex:1; height:1px; background:var(--border-glass);"></div>
              <span style="font-size:0.8rem; color:var(--text-muted);">OR</span>
              <div style="flex:1; height:1px; background:var(--border-glass);"></div>
            </div>

            <button id="btn-google-auth" class="btn btn-secondary btn-full" style="margin-bottom:1rem;">
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"/><path fill="#FBBC05" d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4L1.9 7C.7 9.4 0 10.6 0 12.3s.7 2.9 1.9 5.3l3.7-2.9z"/><path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16.4C3.7 20.2 7.5 23.5 12 23.5z"/></svg>
              ${t('auth_google_btn')}
            </button>

            <button id="btn-guest-auth" class="btn btn-secondary btn-full" style="border:none; background:transparent; color:var(--text-secondary);">
              ${t('auth_guest_btn')}
            </button>
          ` : `
            <div class="input-group">
              <label class="input-label">${t('auth_enter_otp')}</label>
              <div style="display:flex; justify-content:space-between; gap:8px;">
                ${[4, 8, 2, 9, 1, 0].map(digit => `
                  <input class="input-field" style="text-align:center; font-size:1.3rem; font-weight:700; width:44px;" value="${digit}" readonly />
                `).join('')}
              </div>
              <p style="font-size:0.8rem; color:var(--neon-cyan); margin-top:8px;">Auto-filled Demo OTP (482910)</p>
            </div>

            <button id="btn-verify-otp" class="btn btn-primary btn-full" style="margin-top:1rem;">
              ${t('auth_verify_btn')}
            </button>
          `}
        </div>

        <div style="text-align:center; font-size:0.75rem; color:var(--text-muted);">
          Protected by Campus IoT Security & End-to-End Encryption
        </div>
      </div>
    `;

    if (step === 'phone') {
      document.getElementById('btn-send-otp').onclick = () => {
        step = 'otp';
        triggerHaptic('medium');
        showToast('OTP sent to phone: 482910', 'info');
        render();
      };
      document.getElementById('btn-google-auth').onclick = () => {
        AppState.user.isLoggedIn = true;
        triggerHaptic('success');
        showToast('Signed in via Google', 'success');
        navigateTo('home');
      };
      document.getElementById('btn-guest-auth').onclick = () => {
        AppState.user.isGuest = true;
        triggerHaptic('light');
        navigateTo('home');
      };
    } else {
      document.getElementById('btn-verify-otp').onclick = () => {
        AppState.user.isLoggedIn = true;
        triggerHaptic('success');
        showToast('Welcome, Alex! Phone verified.', 'success');
        navigateTo('home');
      };
    }
  }

  render();
}

// ==========================================================================
// SCREEN 3: HOME / ORDER SCREEN (Full Leaflet Dark Map & Dynamic Order Drawer)
// ==========================================================================
function renderHomeScreen(container) {
  container.innerHTML = `
    <div class="map-screen-container">
      <!-- Fullscreen Leaflet Map Container -->
      <div id="map-view"></div>

      <!-- Top Floating Search & Saved Places -->
      <div class="map-floating-header">
        <div class="search-bar-glass">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input id="home-search-input" class="search-input" placeholder="${t('home_search_placeholder')}" value="${AppState.orderDraft.dest_name}" />
          <button id="btn-quick-notifs" class="icon-btn" style="width:32px; height:32px; border:none; background:rgba(255,255,255,0.08);" title="Notifications">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
        </div>

        <!-- Saved Places Chips -->
        <div class="saved-places-scroll">
          ${AppState.savedPlaces.map(p => `
            <div class="chip ${p.name === 'Library' ? 'active' : ''}" data-place-id="${p.id}" data-lat="${p.lat}" data-lng="${p.lng}">
              <span>📍</span> ${p.name}
            </div>
          `).join('')}
          <div class="chip" id="btn-add-place">+ Add</div>
        </div>
      </div>

      <!-- Right Floating Action Controls -->
      <div class="map-action-controls">
        <button id="btn-locate-me" class="icon-btn" title="Center My Location">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>
        </button>
        <button id="btn-fleet-overview" class="icon-btn" title="Fleet Dashboard">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--neon-violet)" stroke-width="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
        </button>
      </div>

      <!-- Bottom Order Sheet / Drawer -->
      <div class="home-bottom-drawer">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <div>
            <div style="font-size:0.75rem; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.05em;">Dispatch To</div>
            <div style="font-weight:700; font-size:1.05rem;" id="selected-dest-label">${AppState.orderDraft.dest_name}</div>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span class="badge badge-success">3 ROVERS NEARBY</span>
          </div>
        </div>

        <!-- Charging Mode Switcher (5W Standard vs 15W Fast) -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:1rem;">
          <div class="card ${AppState.orderDraft.charging_mode === 'standard_5w' ? 'card-glowing' : ''}" id="mode-opt-std" style="padding:0.8rem; cursor:pointer; border-color:${AppState.orderDraft.charging_mode === 'standard_5w' ? 'var(--neon-cyan)' : 'var(--border-glass)'};">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:600; font-size:0.85rem;">Standard 5W</span>
              <span style="font-size:0.8rem; color:var(--neon-cyan);">₹15</span>
            </div>
            <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Gentle overnight / steady charge</div>
          </div>

          <div class="card ${AppState.orderDraft.charging_mode === 'fast_15w' ? 'card-glowing' : ''}" id="mode-opt-fast" style="padding:0.8rem; cursor:pointer; border-color:${AppState.orderDraft.charging_mode === 'fast_15w' ? 'var(--neon-cyan)' : 'var(--border-glass)'};">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:600; font-size:0.85rem;">Turbo 15W Qi</span>
              <span style="font-size:0.8rem; color:var(--neon-cyan);">₹30</span>
            </div>
            <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">High-speed multi-coil induction</div>
          </div>
        </div>

        <!-- Duration / Target Slider -->
        <div style="margin-bottom:1.25rem;">
          <div style="display:flex; justify-content:space-between; font-size:0.82rem; margin-bottom:6px;">
            <span style="color:var(--text-secondary);">${t('home_target_pct')}</span>
            <span style="font-weight:700; color:var(--neon-cyan);" id="target-pct-label">${AppState.orderDraft.target_pct}% (~${AppState.orderDraft.target_duration_mins} mins)</span>
          </div>
          <input type="range" class="range-slider" id="target-pct-slider" min="50" max="100" step="5" value="${AppState.orderDraft.target_pct}" />
        </div>

        <!-- Action Buttons -->
        <div style="display:flex; gap:10px;">
          <button id="btn-schedule-order" class="btn btn-secondary" style="flex:1;">
            📅 Schedule
          </button>
          <button id="btn-confirm-order-flow" class="btn btn-primary" style="flex:2;">
            ${t('btn_order_now')}
          </button>
        </div>
      </div>
    </div>
  `;

  // Initialize Map
  setTimeout(() => initHomeMap(), 50);

  // Bind Events
  document.getElementById('btn-quick-notifs').onclick = () => navigateTo('notifications');
  document.getElementById('btn-fleet-overview').onclick = () => navigateTo('admin');
  document.getElementById('btn-add-place').onclick = () => showAddPlaceModal();
  
  document.querySelectorAll('.saved-places-scroll .chip[data-lat]').forEach(chip => {
    chip.onclick = () => {
      document.querySelectorAll('.saved-places-scroll .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const lat = parseFloat(chip.getAttribute('data-lat'));
      const lng = parseFloat(chip.getAttribute('data-lng'));
      const name = chip.textContent.trim().replace('📍', '').trim();
      AppState.orderDraft.dest_lat = lat;
      AppState.orderDraft.dest_lng = lng;
      AppState.orderDraft.dest_name = name;
      document.getElementById('selected-dest-label').textContent = name;
      document.getElementById('home-search-input').value = name;
      if (AppState.mapInstance) {
        AppState.mapInstance.flyTo([lat, lng], 17);
        if (AppState.userMarker) AppState.userMarker.setLatLng([lat, lng]);
      }
      triggerHaptic('light');
    };
  });

  const stdOpt = document.getElementById('mode-opt-std');
  const fastOpt = document.getElementById('mode-opt-fast');
  stdOpt.onclick = () => {
    AppState.orderDraft.charging_mode = 'standard_5w';
    stdOpt.classList.add('card-glowing');
    stdOpt.style.borderColor = 'var(--neon-cyan)';
    fastOpt.classList.remove('card-glowing');
    fastOpt.style.borderColor = 'var(--border-glass)';
    triggerHaptic('light');
  };
  fastOpt.onclick = () => {
    AppState.orderDraft.charging_mode = 'fast_15w';
    fastOpt.classList.add('card-glowing');
    fastOpt.style.borderColor = 'var(--neon-cyan)';
    stdOpt.classList.remove('card-glowing');
    stdOpt.style.borderColor = 'var(--border-glass)';
    triggerHaptic('light');
  };

  const slider = document.getElementById('target-pct-slider');
  slider.oninput = (e) => {
    const val = parseInt(e.target.value);
    AppState.orderDraft.target_pct = val;
    AppState.orderDraft.target_duration_mins = Math.round((val - 20) * 0.7);
    document.getElementById('target-pct-label').textContent = `${val}% (~${AppState.orderDraft.target_duration_mins} mins)`;
  };

  document.getElementById('btn-schedule-order').onclick = () => {
    triggerHaptic('medium');
    showToast('Scheduled for 4:00 PM today at ' + AppState.orderDraft.dest_name, 'info');
  };

  document.getElementById('btn-confirm-order-flow').onclick = () => {
    triggerHaptic('medium');
    navigateTo('payment');
  };
}

function initHomeMap() {
  const mapEl = document.getElementById('map-view');
  if (!mapEl) return;

  // Cleanup old map instance if needed
  if (AppState.mapInstance) {
    AppState.mapInstance.remove();
    AppState.mapInstance = null;
  }

  const campusCenter = [AppState.orderDraft.dest_lat, AppState.orderDraft.dest_lng];
  const map = L.map('map-view', {
    zoomControl: false,
    attributionControl: false
  }).setView(campusCenter, 16);

  AppState.mapInstance = map;

  // Ultra-Dark High-Performance Tile Layer (CartoDB Dark Matter)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd'
  }).addTo(map);

  // User Pickup Destination Marker (Draggable Pin)
  const userIcon = L.divIcon({
    className: 'user-pin-marker',
    html: `
      <div style="position:relative; width:36px; height:36px; display:flex; align-items:center; justify-content:center;">
        <div style="width:20px; height:20px; border-radius:50%; background:var(--neon-cyan); border:3px solid #0B0D12; box-shadow:0 0 15px var(--neon-cyan);"></div>
        <div style="position:absolute; width:44px; height:44px; border-radius:50%; border:1.5px solid var(--neon-cyan); animation:radarWave 2s infinite ease-out;"></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

  const userMarker = L.marker(campusCenter, { draggable: true, icon: userIcon }).addTo(map);
  AppState.userMarker = userMarker;

  userMarker.on('dragend', (e) => {
    const pos = e.target.getLatLng();
    AppState.orderDraft.dest_lat = pos.lat;
    AppState.orderDraft.dest_lng = pos.lng;
    AppState.orderDraft.dest_name = 'Custom Pinned Location';
    document.getElementById('selected-dest-label').textContent = 'Custom Pinned Location';
    document.getElementById('home-search-input').value = 'Custom Pinned Location';
    triggerHaptic('light');
    showToast('Pickup location pin adjusted', 'info');
  });

  // Render Fleet Rovers from Simulator
  const fleet = simulator.getFleet();
  AppState.roverMarkers = {};

  fleet.forEach(rover => {
    const roverIcon = L.divIcon({
      className: 'rover-marker-icon',
      html: `
        <div class="rover-marker-pulse"></div>
        <div class="rover-marker-body" style="transform: rotate(${rover.heading}deg);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" stroke-width="2.5"><polygon points="12 2 19 21 12 17 5 21 12 2"/></svg>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });

    const m = L.marker([rover.lat, rover.lng], { icon: roverIcon }).addTo(map);
    m.bindPopup(`
      <div style="background:#141821; color:#fff; padding:6px; border-radius:8px; font-family:Inter; font-size:12px;">
        <b>${rover.rover_id}</b> — ${rover.battery_pct}% Battery<br/>
        <span style="color:#2EE6A6;">${rover.status.toUpperCase()}</span> (${rover.eta_seconds}s away)
      </div>
    `);
    AppState.roverMarkers[rover.rover_id] = m;
  });

  // Locate Me Button action
  const locateBtn = document.getElementById('btn-locate-me');
  if (locateBtn) {
    locateBtn.onclick = () => {
      triggerHaptic('medium');
      map.flyTo(campusCenter, 17);
    };
  }
}

// ==========================================================================
// SCREEN 4: ORDER CONFIRMATION & PAYMENT
// ==========================================================================
function renderPaymentScreen(container) {
  const isFast = AppState.orderDraft.charging_mode === 'fast_15w';
  const basePrice = isFast ? 30 : 15;
  const convenienceFee = 5;
  const discount = AppState.orderDraft.promo_discount || 0;
  const totalPrice = Math.max(0, basePrice + convenienceFee - discount);

  container.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; justify-content:space-between; padding:1.5rem;">
      <div>
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:1.5rem;">
          <button id="btn-back-to-home" class="icon-btn" style="width:38px; height:38px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1 style="font-family:var(--heading-font); font-size:1.3rem; font-weight:700;">Order Summary & Checkout</h1>
        </div>

        <!-- Order Summary Card -->
        <div class="card card-glowing" style="margin-bottom:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
            <div>
              <span class="badge badge-success">AUTONOMOUS DISPATCH</span>
              <h2 style="font-size:1.1rem; font-weight:700; margin-top:6px;">${isFast ? 'Turbo 15W Qi Fast Charge' : 'Standard 5W Qi Charge'}</h2>
              <div style="font-size:0.82rem; color:var(--text-secondary); margin-top:2px;">Target: ${AppState.orderDraft.target_pct}% (~${AppState.orderDraft.target_duration_mins} mins)</div>
            </div>
            <div style="text-align:right;">
              <span style="font-family:var(--mono-font); font-size:1.3rem; font-weight:800; color:var(--neon-cyan);">₹${totalPrice}</span>
            </div>
          </div>

          <div style="font-size:0.85rem; color:var(--text-secondary); border-top:1px solid var(--border-glass); padding-top:10px; display:flex; align-items:center; gap:8px;">
            <span>📍 Meeting Point:</span>
            <strong style="color:var(--text-main);">${AppState.orderDraft.dest_name}</strong>
          </div>
        </div>

        <!-- Promo Code Input -->
        <div class="card" style="margin-bottom:1.25rem; padding:0.8rem 1rem;">
          <div style="display:flex; gap:10px;">
            <input id="promo-input" class="input-field" style="min-height:38px; padding:6px 12px; font-size:0.85rem;" placeholder="Try CAMPUS50 or VOLTNEW" value="${AppState.orderDraft.promo_code}" />
            <button id="btn-apply-promo" class="btn btn-secondary btn-sm" style="min-height:38px;">Apply</button>
          </div>
        </div>

        <!-- Price Breakdown -->
        <div class="card" style="margin-bottom:1.25rem;">
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:var(--text-secondary); margin-bottom:8px;">
            <span>Inductive Power Transfer</span>
            <span>₹${basePrice}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:var(--text-secondary); margin-bottom:8px;">
            <span>Autonomous Rover Dispatch</span>
            <span>₹${convenienceFee}</span>
          </div>
          ${discount > 0 ? `
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:var(--status-success); margin-bottom:8px;">
              <span>Promo Discount</span>
              <span>-₹${discount}</span>
            </div>
          ` : ''}
          <div style="border-top:1px solid var(--border-glass); padding-top:8px; display:flex; justify-content:space-between; font-weight:700;">
            <span>Total Payable</span>
            <span style="color:var(--neon-cyan);">₹${totalPrice}</span>
          </div>
        </div>

        <!-- Payment Method Options -->
        <div class="input-group">
          <label class="input-label">Select Payment Method</label>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div class="chip ${AppState.orderDraft.payment_method === 'wallet' ? 'active' : ''}" id="pay-opt-wallet" style="justify-content:center; padding:10px;">
              ⚡ VoltWallet (₹${AppState.user.walletBalance})
            </div>
            <div class="chip ${AppState.orderDraft.payment_method === 'upi' ? 'active' : ''}" id="pay-opt-upi" style="justify-content:center; padding:10px;">
              📱 UPI / GPay
            </div>
          </div>
        </div>
      </div>

      <div>
        <button id="btn-pay-and-dispatch" class="btn btn-primary btn-full" style="font-size:1.05rem;">
          Confirm & Dispatch Rover
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-back-to-home').onclick = () => navigateTo('home');

  document.getElementById('btn-apply-promo').onclick = () => {
    const code = document.getElementById('promo-input').value.trim().toUpperCase();
    if (code === 'CAMPUS50') {
      AppState.orderDraft.promo_code = code;
      AppState.orderDraft.promo_discount = 15;
      triggerHaptic('success');
      showToast('CAMPUS50 Applied! ₹15 saved.', 'success');
      renderPaymentScreen(container);
    } else if (code === 'VOLTNEW') {
      AppState.orderDraft.promo_code = code;
      AppState.orderDraft.promo_discount = 10;
      triggerHaptic('success');
      showToast('VOLTNEW Applied! ₹10 saved.', 'success');
      renderPaymentScreen(container);
    } else {
      showToast('Invalid promo code. Try CAMPUS50', 'danger');
    }
  };

  document.getElementById('pay-opt-wallet').onclick = () => {
    AppState.orderDraft.payment_method = 'wallet';
    triggerHaptic('light');
    renderPaymentScreen(container);
  };
  document.getElementById('pay-opt-upi').onclick = () => {
    AppState.orderDraft.payment_method = 'upi';
    triggerHaptic('light');
    renderPaymentScreen(container);
  };

  document.getElementById('btn-pay-and-dispatch').onclick = () => {
    triggerHaptic('heavy');
    // Dispatch via simulator engine
    simulator.dispatchOrder({
      order_id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      dest_lat: AppState.orderDraft.dest_lat,
      dest_lng: AppState.orderDraft.dest_lng,
      dest_name: AppState.orderDraft.dest_name,
      charging_mode: AppState.orderDraft.charging_mode,
      target_duration_mins: AppState.orderDraft.target_duration_mins
    });
    speakText("Rover dispatched. Calculating optimal path to your location.");
    navigateTo('tracking');
  };
}

// ==========================================================================
// SCREEN 5: LIVE TRACKING SCREEN (Autonomous Rover Movement & Timeline)
// ==========================================================================
function renderTrackingScreen(container) {
  const rover = simulator.assignedRover || simulator.getFleet()[0];

  container.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; padding:1.25rem;">
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <div>
          <span class="badge badge-success" id="track-status-pill">MISSION ACTIVE</span>
          <h1 style="font-family:var(--heading-font); font-size:1.3rem; font-weight:700; margin-top:4px;">Rover Live Tracking</h1>
        </div>
        <button id="btn-support-quick" class="icon-btn" title="24/7 Chat Support">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>

      <!-- Live Mini Map Preview Container -->
      <div id="track-mini-map" style="height:190px; border-radius:var(--radius-lg); overflow:hidden; border:1px solid var(--border-glass-bright); margin-bottom:1rem; position:relative;"></div>

      <!-- Obstacle Alert Banner (Hidden by default, shown when obstacle detected) -->
      <div id="obstacle-banner" class="card card-glowing" style="display:none; background:rgba(255,176,32,0.12); border-color:var(--status-warning); padding:0.8rem 1rem; margin-bottom:1rem;">
        <div style="display:flex; align-items:center; gap:10px; color:var(--status-warning); font-weight:600; font-size:0.85rem;">
          <span>⚠️</span>
          <span id="obstacle-banner-text">${t('track_obstacle_alert')}</span>
        </div>
      </div>

      <!-- ETA & Distance Hero Card -->
      <div class="card card-glowing" style="margin-bottom:1rem;">
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; text-align:center; gap:8px;">
          <div>
            <div style="font-size:0.75rem; color:var(--text-secondary); text-transform:uppercase;">ETA</div>
            <div style="font-family:var(--mono-font); font-size:1.4rem; font-weight:800; color:var(--neon-cyan);" id="track-eta-val">${rover.eta_seconds}s</div>
          </div>
          <div>
            <div style="font-size:0.75rem; color:var(--text-secondary); text-transform:uppercase;">Distance</div>
            <div style="font-family:var(--mono-font); font-size:1.4rem; font-weight:800; color:var(--text-main);" id="track-dist-val">${rover.distance_remaining_m}m</div>
          </div>
          <div>
            <div style="font-size:0.75rem; color:var(--text-secondary); text-transform:uppercase;">Rover Battery</div>
            <div style="font-family:var(--mono-font); font-size:1.4rem; font-weight:800; color:var(--status-success);" id="track-batt-val">${rover.battery_pct}%</div>
          </div>
        </div>
      </div>

      <!-- Mission Timeline -->
      <div class="timeline" style="margin-bottom:1.25rem;">
        <div class="timeline-step completed" id="step-assigned">
          <div class="timeline-dot">1</div>
          <div>
            <div style="font-weight:600; font-size:0.85rem;">${t('track_status_assigned')}</div>
            <div style="font-size:0.75rem; color:var(--text-secondary);">Route planned via LiDAR & campus GPS</div>
          </div>
        </div>
        <div class="timeline-step active" id="step-enroute">
          <div class="timeline-dot">2</div>
          <div>
            <div style="font-weight:600; font-size:0.85rem;">${t('track_status_enroute')}</div>
            <div style="font-size:0.75rem; color:var(--neon-cyan);" id="step-enroute-sub">Cruising autonomously at 1.2 m/s</div>
          </div>
        </div>
        <div class="timeline-step" id="step-arrived">
          <div class="timeline-dot">3</div>
          <div>
            <div style="font-weight:600; font-size:0.85rem;">${t('track_status_arrived')}</div>
            <div style="font-size:0.75rem; color:var(--text-secondary);">Awaiting cryptographic 4-digit PIN unlock</div>
          </div>
        </div>
      </div>

      <!-- Action Row: Share Link, Locate Ping & Cancel -->
      <div style="display:flex; gap:8px; margin-top:auto;">
        <button id="btn-share-link" class="btn btn-secondary btn-sm" style="flex:1;">
          🔗 Share Link
        </button>
        <button id="btn-locate-ping" class="btn btn-secondary btn-sm" style="flex:1;" title="Flash lights and chime buzzer">
          🔔 Ping Rover
        </button>
        <button id="btn-cancel-trip" class="btn btn-danger btn-sm" style="flex:1;">
          Cancel
        </button>
      </div>

      <!-- Persistent Hold-to-Confirm Emergency SOS Halt -->
      <div style="margin-top:1rem; display:flex; align-items:center; justify-content:space-between; background:rgba(255,84,112,0.08); border:1px solid rgba(255,84,112,0.25); border-radius:var(--radius-md); padding:8px 14px;">
        <div style="font-size:0.8rem; color:var(--status-danger);">
          <strong>Emergency Stop</strong><br/>
          <span style="font-size:0.72rem; color:var(--text-muted);">Hold button to brake rover</span>
        </div>
        <div class="sos-hold-btn" id="sos-btn" role="button" aria-label="Hold to Emergency Stop Rover">
          <span>SOS</span>
          <svg class="sos-progress-svg" viewBox="0 0 72 72">
            <circle class="sos-progress-circle" id="sos-circle" cx="36" cy="36" r="34"></circle>
          </svg>
        </div>
      </div>
    </div>
  `;

  // Mini Map Initializer
  let miniMap = null;
  let roverMarker = null;
  setTimeout(() => {
    miniMap = L.map('track-mini-map', { zoomControl: false, attributionControl: false }).setView([rover.lat, rover.lng], 17);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(miniMap);
    
    // User destination marker
    L.circleMarker([AppState.orderDraft.dest_lat, AppState.orderDraft.dest_lng], {
      color: '#00E5FF',
      radius: 8,
      fillOpacity: 0.8
    }).addTo(miniMap);

    const roverIcon = L.divIcon({
      className: 'rover-marker-icon',
      html: `
        <div class="rover-marker-pulse"></div>
        <div class="rover-marker-body" id="mini-rover-body" style="transform: rotate(${rover.heading}deg);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" stroke-width="2.5"><polygon points="12 2 19 21 12 17 5 21 12 2"/></svg>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });
    roverMarker = L.marker([rover.lat, rover.lng], { icon: roverIcon }).addTo(miniMap);
  }, 100);

  // Subscribe to simulator events
  const unsubscribe = simulator.subscribe((event, data) => {
    if (AppState.currentScreen !== 'tracking') {
      unsubscribe();
      return;
    }

    if (event === 'telemetry_update') {
      const r = data.rover;
      const etaEl = document.getElementById('track-eta-val');
      const distEl = document.getElementById('track-dist-val');
      if (etaEl) etaEl.textContent = `${r.eta_seconds}s`;
      if (distEl) distEl.textContent = `${r.distance_remaining_m}m`;
      
      if (roverMarker && miniMap) {
        roverMarker.setLatLng([r.lat, r.lng]);
        miniMap.panTo([r.lat, r.lng]);
        const bodyEl = document.getElementById('mini-rover-body');
        if (bodyEl) bodyEl.style.transform = `rotate(${r.heading}deg)`;
      }
    } else if (event === 'obstacle_detected') {
      const banner = document.getElementById('obstacle-banner');
      if (banner) banner.style.display = 'block';
      triggerHaptic('medium');
      showToast('Obstacle detected! Rover pausing to calculate safe detour.', 'warning');
      speakText('Obstacle detected. Rover recalculating trajectory.');
    } else if (event === 'obstacle_cleared') {
      const banner = document.getElementById('obstacle-banner');
      if (banner) banner.style.display = 'none';
      showToast('Path clear. Autonomous cruising resumed.', 'info');
    } else if (event === 'rover_arrived') {
      unsubscribe();
      triggerHaptic('success');
      speakText('Rover has arrived at your location. Please enter your PIN to unlock.');
      navigateTo('unlock');
    }
  });

  // Buttons wiring
  document.getElementById('btn-support-quick').onclick = () => navigateTo('support');
  document.getElementById('btn-share-link').onclick = () => {
    navigator.clipboard?.writeText(window.location.href);
    triggerHaptic('light');
    showToast('Tracking link copied to clipboard!', 'success');
  };
  document.getElementById('btn-locate-ping').onclick = () => {
    simulator.pingLocate();
    triggerHaptic('medium');
    showToast('Signal sent! Rover pulsing neon LEDs & beeping.', 'info');
  };
  document.getElementById('btn-cancel-trip').onclick = () => {
    simulator.cancelOrder();
    triggerHaptic('light');
    showToast('Order cancelled. Rover returning to base.', 'info');
    navigateTo('home');
  };

  // SOS Hold-to-Confirm Handler (2 seconds hold)
  setupSosHoldButton();
}

function setupSosHoldButton() {
  const sosBtn = document.getElementById('sos-btn');
  const circle = document.getElementById('sos-circle');
  if (!sosBtn || !circle) return;

  let holdTimer = null;
  let startTime = 0;
  const holdDuration = 2000;

  function startHold(e) {
    e.preventDefault();
    startTime = Date.now();
    triggerHaptic('medium');
    circle.style.transition = 'stroke-dashoffset 2s linear';
    circle.style.strokeDashoffset = '0';

    holdTimer = setTimeout(() => {
      triggerHaptic('heavy');
      simulator.emergencyStop();
      showToast('EMERGENCY BRAKE ACTUATED. Rover halted.', 'danger');
      speakText('Emergency stop engaged. Hardware brake locked.');
    }, holdDuration);
  }

  function cancelHold() {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
      circle.style.transition = 'stroke-dashoffset 0.2s ease';
      circle.style.strokeDashoffset = '213';
    }
  }

  sosBtn.addEventListener('mousedown', startHold);
  sosBtn.addEventListener('touchstart', startHold);
  window.addEventListener('mouseup', cancelHold);
  window.addEventListener('touchend', cancelHold);
}

// ==========================================================================
// SCREEN 6: ARRIVAL & SECURE UNLOCK (4-Digit PIN & QR Display)
// ==========================================================================
function renderUnlockScreen(container) {
  const rover = simulator.assignedRover || simulator.getFleet()[0];
  const pin = rover.pin_code || '4829';

  container.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; justify-content:space-between; padding:1.5rem; text-align:center;">
      <div>
        <div style="width:72px; height:72px; border-radius:50%; background:rgba(46,230,166,0.15); border:2px solid var(--status-success); display:flex; align-items:center; justify-content:center; margin:0 auto 1.25rem; color:var(--status-success);">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>

        <span class="badge badge-success" style="margin-bottom:0.8rem;">ROVER AT DESTINATION</span>
        <h1 style="font-family:var(--heading-font); font-size:1.5rem; font-weight:700; margin-bottom:0.4rem;">${t('unlock_title')}</h1>
        <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:1.5rem;">${t('unlock_desc')}</p>

        <!-- 4-Digit PIN Security Display -->
        <div class="pin-display-card" style="margin-bottom:1.5rem;">
          <div style="font-size:0.75rem; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:6px;">One-Time Unlock PIN</div>
          <div class="pin-code-text" id="unlock-pin-value">${pin}</div>
          <div style="font-size:0.75rem; color:var(--neon-cyan); margin-top:8px;">Only you can unlock the Qi charging coil</div>
        </div>

        <!-- QR Code Simulation -->
        <div class="card" style="display:inline-block; padding:12px; background:#fff; border-radius:16px; margin-bottom:1.5rem;">
          <!-- SVG Mock QR Code -->
          <svg width="100" height="100" viewBox="0 0 100 100" fill="#0B0D12">
            <rect width="30" height="30" x="5" y="5"/>
            <rect width="18" height="18" x="11" y="11" fill="#fff"/>
            <rect width="8" height="8" x="16" y="16"/>
            <rect width="30" height="30" x="65" y="5"/>
            <rect width="18" height="18" x="71" y="11" fill="#fff"/>
            <rect width="8" height="8" x="76" y="16"/>
            <rect width="30" height="30" x="5" y="65"/>
            <rect width="18" height="18" x="11" y="71" fill="#fff"/>
            <rect width="8" height="8" x="16" y="76"/>
            <rect width="8" height="8" x="46" y="46"/>
            <rect width="12" height="12" x="44" y="14"/>
            <rect width="12" height="12" x="70" y="55"/>
          </svg>
        </div>

        <div>
          <button id="btn-ping-here" class="btn btn-secondary btn-sm" style="margin-bottom:1rem;">
            🔔 ${t('unlock_locate_btn')}
          </button>
        </div>
      </div>

      <div>
        <button id="btn-confirm-pad-placed" class="btn btn-primary btn-full" style="font-size:1.05rem;">
          Phone Placed on Pad — Unlock & Charge
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-ping-here').onclick = () => {
    simulator.pingLocate();
    triggerHaptic('medium');
    showToast('Rover LEDs strobing & buzzer sounding', 'info');
  };

  document.getElementById('btn-confirm-pad-placed').onclick = () => {
    triggerHaptic('success');
    simulator.unlockRover(pin);
    speakText("PIN verified. Inductive charging coils energized. Charging initiated.");
    navigateTo('charging');
  };
}

// ==========================================================================
// SCREEN 7: CHARGING SESSION SCREEN (Animated Ring, Live Watts & Sensors)
// ==========================================================================
function renderChargingScreen(container) {
  const rover = simulator.assignedRover || simulator.getFleet()[0];
  let isPaused = false;

  container.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; justify-content:space-between; padding:1.25rem;">
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span class="badge badge-success" id="charging-status-badge">QI COILS ENERGIZED</span>
          <h1 style="font-family:var(--heading-font); font-size:1.3rem; font-weight:700; margin-top:4px;">Active Wireless Charge</h1>
        </div>
        <div class="chip" id="alignment-status-chip" style="color:var(--status-success); border-color:var(--status-success);">
          ⚡ Coil Aligned
        </div>
      </div>

      <!-- Big Animated Circular Progress Ring -->
      <div class="charging-gauge-container">
        <svg class="charging-svg-ring" viewBox="0 0 250 250">
          <defs>
            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#00E5FF"/>
              <stop offset="100%" stop-color="#7C4DFF"/>
            </linearGradient>
          </defs>
          <circle class="charging-svg-bg" cx="125" cy="125" r="110"/>
          <circle class="charging-svg-meter" id="charging-meter-circle" cx="125" cy="125" r="110"/>
        </svg>

        <div class="charging-center-info">
          <div style="font-size:0.75rem; color:var(--text-secondary); text-transform:uppercase;">Device Battery</div>
          <div class="charging-percentage" id="charge-pct-text">85%</div>
          <div style="font-size:0.85rem; font-family:var(--mono-font); color:var(--neon-cyan); margin-top:4px;" id="charge-watts-text">14.8 W</div>
        </div>
      </div>

      <!-- Live Physics & Sensor Telemetry Grid -->
      <div class="card card-glowing" style="margin-bottom:1rem;">
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; text-align:center; gap:8px;">
          <div>
            <div style="font-size:0.7rem; color:var(--text-secondary);">Energy Transferred</div>
            <div style="font-family:var(--mono-font); font-size:1.15rem; font-weight:700; color:var(--text-main);" id="sensor-wh-val">0.0 Wh</div>
          </div>
          <div>
            <div style="font-size:0.7rem; color:var(--text-secondary);">Pad Temp</div>
            <div style="font-family:var(--mono-font); font-size:1.15rem; font-weight:700; color:var(--status-success);" id="sensor-temp-val">29.5°C</div>
          </div>
          <div>
            <div style="font-size:0.7rem; color:var(--text-secondary);">Session Cost</div>
            <div style="font-family:var(--mono-font); font-size:1.15rem; font-weight:700; color:var(--neon-cyan);" id="sensor-cost-val">₹30</div>
          </div>
        </div>
      </div>

      <!-- Action Controls: Pause, +10 Mins, Stop -->
      <div>
        <div style="display:flex; gap:10px; margin-bottom:10px;">
          <button id="btn-toggle-pause" class="btn btn-secondary" style="flex:1;">
            ⏸ Pause
          </button>
          <button id="btn-add-ten" class="btn btn-secondary" style="flex:1;">
            +10 Mins
          </button>
        </div>

        <button id="btn-end-session" class="btn btn-primary btn-full" style="background:linear-gradient(135deg, #FF5470 0%, #7C4DFF 100%);">
          Stop & Complete Session
        </button>
      </div>
    </div>
  `;

  // Animate initial stroke offset
  setTimeout(() => {
    const meter = document.getElementById('charging-meter-circle');
    if (meter) meter.style.strokeDashoffset = '180'; // ~75% filled
  }, 100);

  // Read native Battery API if supported
  if ('getBattery' in navigator) {
    navigator.getBattery().then(b => {
      const pct = Math.round(b.level * 100);
      const textEl = document.getElementById('charge-pct-text');
      if (textEl) textEl.textContent = `${pct}%`;
    }).catch(() => {});
  }

  // Subscribe to charging ticks from simulator
  const unsubscribe = simulator.subscribe((event, data) => {
    if (AppState.currentScreen !== 'charging') {
      unsubscribe();
      return;
    }

    if (event === 'charging_tick') {
      const r = data.rover;
      const o = data.order;
      
      const whEl = document.getElementById('sensor-wh-val');
      const tempEl = document.getElementById('sensor-temp-val');
      const wattsEl = document.getElementById('charge-watts-text');
      const costEl = document.getElementById('sensor-cost-val');

      if (whEl) whEl.textContent = `${r.session_energy_wh.toFixed(2)} Wh`;
      if (tempEl) tempEl.textContent = `${r.pad_temp_c.toFixed(1)}°C`;
      if (wattsEl) wattsEl.textContent = `${r.charging_power_w.toFixed(1)} W`;
      if (costEl && o) costEl.textContent = `₹${Math.max(15, Math.round(o.elapsedSeconds * 0.25))}`;
    }
  });

  // Buttons wiring
  const pauseBtn = document.getElementById('btn-toggle-pause');
  pauseBtn.onclick = () => {
    isPaused = !isPaused;
    if (isPaused) {
      simulator.pauseCharging();
      pauseBtn.textContent = '▶ Resume';
      showToast('Wireless charging paused', 'info');
    } else {
      simulator.resumeCharging();
      pauseBtn.textContent = '⏸ Pause';
      showToast('Wireless charging resumed', 'success');
    }
    triggerHaptic('light');
  };

  document.getElementById('btn-add-ten').onclick = () => {
    simulator.addChargingTime(600);
    triggerHaptic('medium');
    showToast('Added 10 extra minutes to session', 'success');
  };

  document.getElementById('btn-end-session').onclick = () => {
    unsubscribe();
    triggerHaptic('heavy');
    const summary = simulator.endChargingSession();
    speakText("Charging session completed. Here is your receipt.");
    navigateTo('summary');
  };
}

// ==========================================================================
// SCREEN 8: SESSION SUMMARY RECEIPT (Confetti, Star Rating & PDF Download)
// ==========================================================================
function renderSummaryScreen(container) {
  // Fire celebration confetti!
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch (e) {}

  container.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; justify-content:space-between; padding:1.5rem; text-align:center;">
      <div>
        <div style="width:68px; height:68px; border-radius:50%; background:var(--primary-gradient); display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; color:#05060A; font-weight:800; font-size:1.8rem; box-shadow:var(--primary-glow);">
          ⚡
        </div>

        <h1 style="font-family:var(--heading-font); font-size:1.5rem; font-weight:700; margin-bottom:0.3rem;">${t('summary_title')}</h1>
        <p style="color:var(--text-secondary); font-size:0.85rem; margin-bottom:1.5rem;">${t('summary_thanks')}</p>

        <!-- Receipt Card -->
        <div class="card card-glowing" style="text-align:left; margin-bottom:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-glass); padding-bottom:10px; margin-bottom:10px;">
            <div>
              <div style="font-weight:700;">ORD-${Date.now().toString().slice(-4)}</div>
              <div style="font-size:0.75rem; color:var(--text-secondary);">Autonomous Rover ROV-01</div>
            </div>
            <span class="badge badge-success">PAID</span>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:8px; color:var(--text-secondary);">
            <span>Energy Delivered</span>
            <strong style="color:var(--text-main);">5.4 Wh</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:8px; color:var(--text-secondary);">
            <span>Charging Duration</span>
            <strong style="color:var(--text-main);">26 mins</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:8px; color:var(--text-secondary);">
            <span>CO2 Offset vs Fossil Grid</span>
            <strong style="color:var(--status-success);">🌱 32 grams</strong>
          </div>
          <div style="border-top:1px solid var(--border-glass); padding-top:10px; display:flex; justify-content:space-between; font-size:1.1rem; font-weight:800;">
            <span>Total Charged</span>
            <span style="color:var(--neon-cyan);">₹30.00</span>
          </div>
        </div>

        <!-- Star Rating -->
        <div class="card" style="margin-bottom:1.25rem;">
          <div style="font-size:0.85rem; font-weight:600; margin-bottom:8px;">${t('summary_rating_prompt')}</div>
          <div style="display:flex; justify-content:center; gap:10px;" id="star-rating-container">
            ${[1, 2, 3, 4, 5].map(star => `
              <span class="star-btn" data-star="${star}" style="font-size:1.6rem; cursor:pointer; color:${star <= 5 ? '#FFD700' : 'var(--text-muted)'};">★</span>
            `).join('')}
          </div>
        </div>
      </div>

      <div>
        <div style="display:flex; gap:10px; margin-bottom:10px;">
          <button id="btn-download-pdf" class="btn btn-secondary" style="flex:1;">
            📥 ${t('btn_download_receipt')}
          </button>
          <button id="btn-share-receipt" class="btn btn-secondary" style="flex:1;">
            🔗 Share
          </button>
        </div>

        <button id="btn-summary-home" class="btn btn-primary btn-full">
          ${t('btn_back_home')}
        </button>
      </div>
    </div>
  `;

  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.onclick = () => {
      triggerHaptic('light');
      showToast('Thank you for your rating!', 'success');
    };
  });

  document.getElementById('btn-download-pdf').onclick = () => {
    triggerHaptic('medium');
    showToast('Receipt saved to device documents', 'success');
  };

  document.getElementById('btn-share-receipt').onclick = () => {
    triggerHaptic('light');
    showToast('Receipt link copied!', 'info');
  };

  document.getElementById('btn-summary-home').onclick = () => navigateTo('home');
}

// ==========================================================================
// SCREEN 9: ORDERS HISTORY SCREEN
// ==========================================================================
function renderOrdersScreen(container) {
  container.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; padding:1.25rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h1 style="font-family:var(--heading-font); font-size:1.3rem; font-weight:700;">${t('history_title')}</h1>
        <div style="display:flex; gap:6px;">
          <span class="chip active">${t('history_filter_all')}</span>
          <span class="chip">${t('history_filter_week')}</span>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:12px; overflow-y:auto;">
        ${AppState.orderHistory.map(ord => `
          <div class="card" style="display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong style="font-size:0.95rem;">${ord.location}</strong>
                <div style="font-size:0.75rem; color:var(--text-secondary);">${ord.date} • ${ord.rover_id}</div>
              </div>
              <span class="badge badge-success">${ord.status}</span>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-glass); padding-top:8px; font-size:0.85rem;">
              <span style="color:var(--text-secondary);">${ord.mode} • ${ord.duration} • ${ord.energy}</span>
              <strong style="color:var(--neon-cyan);">₹${ord.cost}</strong>
            </div>

            <button class="btn btn-secondary btn-sm btn-reorder" data-loc="${ord.location}" style="margin-top:4px;">
              ⚡ ${t('history_reorder')}
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.querySelectorAll('.btn-reorder').forEach(btn => {
    btn.onclick = () => {
      triggerHaptic('medium');
      const loc = btn.getAttribute('data-loc');
      AppState.orderDraft.dest_name = loc;
      showToast(`Selected ${loc} for reorder`, 'success');
      navigateTo('home');
    };
  });
}

// ==========================================================================
// SCREEN 10 & 11: WALLET & REWARDS
// ==========================================================================
function renderWalletScreen(container) {
  container.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; padding:1.25rem;">
      <h1 style="font-family:var(--heading-font); font-size:1.3rem; font-weight:700; margin-bottom:1rem;">${t('wallet_title')}</h1>

      <!-- Wallet Balance Hero Card -->
      <div class="card card-glowing" style="background:var(--primary-gradient); color:#05060A; margin-bottom:1.25rem;">
        <div style="font-size:0.8rem; font-weight:600; text-transform:uppercase;">${t('wallet_balance')}</div>
        <div style="font-family:var(--mono-font); font-size:2.4rem; font-weight:800; margin:6px 0;">₹${AppState.user.walletBalance}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; font-weight:600;">
          <span>⚡ VoltPoints: ${AppState.user.voltPoints}</span>
          <button id="btn-topup-modal" class="btn" style="background:#05060A; color:#fff; min-height:34px; padding:4px 14px; font-size:0.82rem;">
            + Top Up
          </button>
        </div>
      </div>

      <!-- Streak & Badges -->
      <div class="card" style="margin-bottom:1.25rem; display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="font-size:2rem;">🔥</div>
          <div>
            <div style="font-weight:700;">4-Day Green Charge Streak</div>
            <div style="font-size:0.75rem; color:var(--text-secondary);">1 more charge to unlock 50 VoltPoints bonus</div>
          </div>
        </div>
        <span class="badge badge-warning">ACTIVE</span>
      </div>

      <!-- Referral Code -->
      <div class="card" style="margin-bottom:1.25rem;">
        <div style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:4px;">${t('wallet_referral')}</div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-family:var(--mono-font); font-size:1.1rem; font-weight:700; color:var(--neon-cyan);">${AppState.user.referralCode}</span>
          <button id="btn-copy-ref" class="btn btn-secondary btn-sm">Copy</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-topup-modal').onclick = () => {
    AppState.user.walletBalance += 100;
    triggerHaptic('success');
    showToast('₹100 added to VoltWallet!', 'success');
    renderWalletScreen(container);
  };

  document.getElementById('btn-copy-ref').onclick = () => {
    navigator.clipboard?.writeText(AppState.user.referralCode);
    triggerHaptic('light');
    showToast('Referral code copied! Share with classmates.', 'info');
  };
}

// ==========================================================================
// SCREEN 12 & 18: PROFILE & SETTINGS
// ==========================================================================
function renderProfileScreen(container) {
  container.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; padding:1.25rem; overflow-y:auto;">
      <!-- Profile Header -->
      <div style="display:flex; align-items:center; gap:14px; margin-bottom:1.5rem;">
        <div style="width:60px; height:60px; border-radius:50%; background:var(--primary-gradient); display:flex; align-items:center; justify-content:center; color:#05060A; font-size:1.5rem; font-weight:800;">
          AR
        </div>
        <div>
          <h1 style="font-family:var(--heading-font); font-size:1.2rem; font-weight:700;">${AppState.user.name}</h1>
          <div style="font-size:0.82rem; color:var(--text-secondary);">${AppState.user.phone}</div>
          <span class="badge badge-success" style="margin-top:4px;">CAMPUS RESIDENT</span>
        </div>
      </div>

      <!-- Settings Menu List -->
      <div class="card" style="display:flex; flex-direction:column; gap:10px; margin-bottom:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; cursor:pointer;" id="menu-a11y">
          <div style="display:flex; align-items:center; gap:10px;">
            <span>♿</span>
            <strong style="font-size:0.95rem;">${t('a11y_title')}</strong>
          </div>
          <span style="color:var(--neon-cyan);">›</span>
        </div>

        <div style="border-top:1px solid var(--border-glass); display:flex; justify-content:space-between; align-items:center; padding:10px 0; cursor:pointer;" id="menu-admin">
          <div style="display:flex; align-items:center; gap:10px;">
            <span>⚙️</span>
            <strong style="font-size:0.95rem;">Fleet Administration Dashboard</strong>
          </div>
          <span style="color:var(--neon-cyan);">›</span>
        </div>

        <div style="border-top:1px solid var(--border-glass); display:flex; justify-content:space-between; align-items:center; padding:10px 0; cursor:pointer;" id="menu-support">
          <div style="display:flex; align-items:center; gap:10px;">
            <span>💬</span>
            <strong style="font-size:0.95rem;">24/7 AI Support & Bot</strong>
          </div>
          <span style="color:var(--neon-cyan);">›</span>
        </div>
      </div>

      <!-- Preferences & Toggles -->
      <div class="card" style="display:flex; flex-direction:column; gap:14px; margin-bottom:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:600; font-size:0.9rem;">${t('demo_mode_label')}</div>
            <div style="font-size:0.75rem; color:var(--text-secondary);">Enables in-memory hardware simulation</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="toggle-demo-mode" ${AppState.settings.demoMode ? 'checked' : ''} />
            <span class="switch-slider"></span>
          </label>
        </div>

        <!-- Language Selector -->
        <div style="border-top:1px solid var(--border-glass); padding-top:10px;">
          <div style="font-size:0.85rem; font-weight:600; margin-bottom:8px;">App Language / மொழி / भाषा</div>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;">
            <button class="chip ${AppState.settings.language === 'en' ? 'active' : ''}" id="lang-en" style="justify-content:center;">English</button>
            <button class="chip ${AppState.settings.language === 'ta' ? 'active' : ''}" id="lang-ta" style="justify-content:center;">தமிழ்</button>
            <button class="chip ${AppState.settings.language === 'hi' ? 'active' : ''}" id="lang-hi" style="justify-content:center;">हिन्दी</button>
          </div>
        </div>
      </div>

      <div style="text-align:center; font-size:0.75rem; color:var(--text-muted); margin-top:auto;">
        VOLTRIDE Mobile Client v1.0.0 (Clean Architecture & Riverpod Spec)
      </div>
    </div>
  `;

  document.getElementById('menu-a11y').onclick = () => navigateTo('accessibility');
  document.getElementById('menu-admin').onclick = () => navigateTo('admin');
  document.getElementById('menu-support').onclick = () => navigateTo('support');

  document.getElementById('toggle-demo-mode').onchange = (e) => {
    AppState.settings.demoMode = e.target.checked;
    simulator.setDemoMode(e.target.checked);
    document.getElementById('demo-mode-pill').style.display = e.target.checked ? 'inline-block' : 'none';
    showToast(`Demo Mode ${e.target.checked ? 'Enabled' : 'Disabled'}`, 'info');
  };

  ['en', 'ta', 'hi'].forEach(lang => {
    document.getElementById(`lang-${lang}`).onclick = () => {
      AppState.settings.language = lang;
      setLanguage(lang);
      triggerHaptic('light');
      showToast(`Language set to ${lang.toUpperCase()}`, 'success');
      renderProfileScreen(container);
    };
  });
}

// ==========================================================================
// SCREEN 13: 24/7 INTERACTIVE SUPPORT BOT
// ==========================================================================
function renderSupportScreen(container) {
  const messages = [
    { sender: 'bot', text: 'Hello Alex! I am the VOLTRIDE Autonomous Assistant. How can I help you today?' }
  ];

  function render() {
    container.innerHTML = `
      <div style="flex:1; display:flex; flex-direction:column; justify-content:space-between; padding:1.25rem;">
        <div>
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:1rem;">
            <button id="btn-back-support" class="icon-btn" style="width:36px; height:36px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <h1 style="font-family:var(--heading-font); font-size:1.2rem; font-weight:700;">24/7 AI Fleet Support</h1>
          </div>

          <div id="chat-messages-box" style="display:flex; flex-direction:column; gap:10px; max-height:360px; overflow-y:auto; margin-bottom:1rem;">
            ${messages.map(m => `
              <div style="align-self:${m.sender === 'bot' ? 'flex-start' : 'flex-end'}; background:${m.sender === 'bot' ? 'var(--surface-2)' : 'var(--primary-gradient)'}; color:${m.sender === 'bot' ? 'var(--text-main)' : '#05060A'}; padding:10px 14px; border-radius:18px; max-width:80%; font-size:0.88rem;">
                ${m.text}
              </div>
            `).join('')}
          </div>

          <!-- Quick Reply Suggestion Chips -->
          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:1rem;">
            <button class="chip btn-quick-reply" data-msg="Rover not arriving?">Rover not arriving?</button>
            <button class="chip btn-quick-reply" data-msg="Pad not charging?">Pad not charging?</button>
            <button class="chip btn-quick-reply" data-msg="Refund request">Refund request</button>
          </div>
        </div>

        <div style="display:flex; gap:8px;">
          <input id="chat-input-field" class="input-field" placeholder="Type your issue..." />
          <button id="btn-send-chat" class="btn btn-primary" style="padding:0.8rem 1.2rem;">Send</button>
        </div>
      </div>
    `;

    document.getElementById('btn-back-support').onclick = () => navigateTo('home');

    document.querySelectorAll('.btn-quick-reply').forEach(btn => {
      btn.onclick = () => {
        const text = btn.getAttribute('data-msg');
        sendMessage(text);
      };
    });

    document.getElementById('btn-send-chat').onclick = () => {
      const input = document.getElementById('chat-input-field');
      if (input.value.trim()) {
        sendMessage(input.value.trim());
      }
    };
  }

  function sendMessage(text) {
    messages.push({ sender: 'user', text });
    triggerHaptic('light');
    render();

    setTimeout(() => {
      let reply = "I've checked the telemetry. Everything looks healthy!";
      if (text.includes('not arriving')) {
        reply = "Rover ROV-01 is currently 120m away navigating around walkway obstacles. Estimated arrival is in ~2 minutes.";
      } else if (text.includes('not charging')) {
        reply = "Make sure your phone is centered on the Qi crosshair mark and remove any thick metal cardholders.";
      } else if (text.includes('Refund')) {
        reply = "Your refund request of ₹30 has been processed to your VoltWallet balance.";
        AppState.user.walletBalance += 30;
      }
      messages.push({ sender: 'bot', text: reply });
      triggerHaptic('medium');
      render();
    }, 800);
  }

  render();
}

// ==========================================================================
// SCREEN 14: NOTIFICATIONS CENTER
// ==========================================================================
function renderNotificationsScreen(container) {
  container.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; padding:1.25rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <div style="display:flex; align-items:center; gap:10px;">
          <button id="btn-back-notif" class="icon-btn" style="width:36px; height:36px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1 style="font-family:var(--heading-font); font-size:1.2rem; font-weight:700;">Notifications</h1>
        </div>
        <button id="btn-clear-notifs" class="chip">Clear All</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px;">
        ${AppState.notifications.map(n => `
          <div class="card" style="border-left:3px solid ${n.unread ? 'var(--neon-cyan)' : 'var(--border-glass)'};">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <strong style="font-size:0.9rem;">${n.title}</strong>
              <span style="font-size:0.75rem; color:var(--text-muted);">${n.time}</span>
            </div>
            <p style="font-size:0.82rem; color:var(--text-secondary);">${n.body}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('btn-back-notif').onclick = () => navigateTo('home');
  document.getElementById('btn-clear-notifs').onclick = () => {
    AppState.notifications = [];
    triggerHaptic('light');
    showToast('Notifications cleared', 'info');
    renderNotificationsScreen(container);
  };
}

// ==========================================================================
// SCREEN 17: ADMIN & FLEET DASHBOARD
// ==========================================================================
function renderAdminScreen(container) {
  const fleet = simulator.getFleet();

  container.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; padding:1.25rem; overflow-y:auto;">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:1rem;">
        <button id="btn-back-admin" class="icon-btn" style="width:36px; height:36px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 style="font-family:var(--heading-font); font-size:1.2rem; font-weight:700;">Fleet Command Center</h1>
      </div>

      <!-- Quick Metrics -->
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:1.25rem;">
        <div class="card" style="text-align:center; padding:10px;">
          <div style="font-size:0.7rem; color:var(--text-secondary);">Active Fleet</div>
          <div style="font-size:1.3rem; font-weight:800; color:var(--neon-cyan);">3 Rovers</div>
        </div>
        <div class="card" style="text-align:center; padding:10px;">
          <div style="font-size:0.7rem; color:var(--text-secondary);">Avg Wait</div>
          <div style="font-size:1.3rem; font-weight:800; color:var(--status-success);">3.2m</div>
        </div>
        <div class="card" style="text-align:center; padding:10px;">
          <div style="font-size:0.7rem; color:var(--text-secondary);">Delivered</div>
          <div style="font-size:1.3rem; font-weight:800; color:var(--status-warning);">142 Wh</div>
        </div>
      </div>

      <!-- Rover List -->
      <div style="display:flex; flex-direction:column; gap:12px;">
        ${fleet.map(r => `
          <div class="card card-glowing" style="display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong>${r.rover_id}</strong> — <span style="color:var(--text-secondary); font-size:0.8rem;">${r.dock_name}</span>
              </div>
              <span class="badge ${r.status === 'idle' ? 'badge-success' : 'badge-warning'}">${r.status.toUpperCase()}</span>
            </div>

            <div style="display:flex; justify-content:space-between; font-size:0.82rem; color:var(--text-secondary);">
              <span>Battery: <strong>${r.battery_pct}%</strong></span>
              <span>Pad Temp: <strong>${r.pad_temp_c}°C</strong></span>
              <span>Speed: <strong>${r.speed} m/s</strong></span>
            </div>

            <div style="display:flex; gap:8px; margin-top:4px;">
              <button class="btn btn-secondary btn-sm btn-force-return" data-id="${r.rover_id}" style="flex:1;">
                Force Return
              </button>
              <button class="btn btn-danger btn-sm btn-admin-stop" data-id="${r.rover_id}" style="flex:1;">
                Emergency Halt
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('btn-back-admin').onclick = () => navigateTo('home');

  document.querySelectorAll('.btn-force-return').forEach(b => {
    b.onclick = () => {
      triggerHaptic('medium');
      showToast(`Command sent: ${b.getAttribute('data-id')} returning to dock.`, 'info');
    };
  });

  document.querySelectorAll('.btn-admin-stop').forEach(b => {
    b.onclick = () => {
      triggerHaptic('heavy');
      simulator.emergencyStop();
      showToast(`Emergency brake dispatched to ${b.getAttribute('data-id')}`, 'danger');
    };
  });
}

// ==========================================================================
// SCREEN 18B: UNIVERSAL ACCESSIBILITY HUB (Dedicated Screen & Sheet)
// ==========================================================================
export function renderAccessibilityScreen(container) {
  container.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; padding:1.25rem; overflow-y:auto;">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:1.25rem;">
        <button id="btn-back-a11y" class="icon-btn" style="width:36px; height:36px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 style="font-family:var(--heading-font); font-size:1.2rem; font-weight:700;">${t('a11y_title')}</h1>
      </div>

      <!-- Spoken Assistant / Voice Control -->
      <div class="card card-glowing" style="margin-bottom:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <strong style="font-size:0.95rem;">🗣 Spoken Screen Reader (TTS)</strong>
          <button id="btn-read-screen" class="btn btn-secondary btn-sm">🔊 Read Screen</button>
        </div>
        <p style="font-size:0.8rem; color:var(--text-secondary);">Reads live rover status, ETA, PIN code, and battery updates aloud.</p>
      </div>

      <!-- Text Scaling Slider -->
      <div class="card" style="margin-bottom:1.25rem;">
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:8px;">
          <span>${t('a11y_text_size')}</span>
          <strong style="color:var(--neon-cyan);" id="text-size-val">${AppState.settings.textSize}%</strong>
        </div>
        <input type="range" class="range-slider" id="text-size-slider" min="80" max="180" step="10" value="${AppState.settings.textSize}" />
      </div>

      <!-- Visual & Motor Adjustments -->
      <div class="card" style="display:flex; flex-direction:column; gap:14px; margin-bottom:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:600; font-size:0.9rem;">${t('a11y_dyslexia')}</div>
            <div style="font-size:0.75rem; color:var(--text-secondary);">Applies Lexend high-readability letterforms</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="toggle-dyslexia" ${AppState.settings.dyslexicFont ? 'checked' : ''} />
            <span class="switch-slider"></span>
          </label>
        </div>

        <div style="border-top:1px solid var(--border-glass); padding-top:10px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:600; font-size:0.9rem;">${t('a11y_contrast')}</div>
            <div style="font-size:0.75rem; color:var(--text-secondary);">Solid black backgrounds and maximum border pop</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="toggle-contrast" ${AppState.settings.highContrast ? 'checked' : ''} />
            <span class="switch-slider"></span>
          </label>
        </div>

        <div style="border-top:1px solid var(--border-glass); padding-top:10px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:600; font-size:0.9rem;">${t('a11y_bold')}</div>
            <div style="font-size:0.75rem; color:var(--text-secondary);">Thicker font weights across all interfaces</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="toggle-bold" ${AppState.settings.boldText ? 'checked' : ''} />
            <span class="switch-slider"></span>
          </label>
        </div>

        <div style="border-top:1px solid var(--border-glass); padding-top:10px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:600; font-size:0.9rem;">${t('a11y_easy_mode')}</div>
            <div style="font-size:0.75rem; color:var(--text-secondary);">Oversized buttons and simplified uncluttered view</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="toggle-easy-mode" ${AppState.settings.easyMode ? 'checked' : ''} />
            <span class="switch-slider"></span>
          </label>
        </div>
      </div>

      <!-- Color Vision Deficiency (Colorblind Modes) -->
      <div class="card" style="margin-bottom:1.25rem;">
        <div style="font-size:0.85rem; font-weight:600; margin-bottom:8px;">${t('a11y_colorblind')}</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <button class="chip ${AppState.settings.colorBlindMode === 'none' ? 'active' : ''}" id="cb-none" style="justify-content:center;">Standard Dark</button>
          <button class="chip ${AppState.settings.colorBlindMode === 'protanopia' ? 'active' : ''}" id="cb-protanopia" style="justify-content:center;">Protanopia (Red)</button>
          <button class="chip ${AppState.settings.colorBlindMode === 'deuteranopia' ? 'active' : ''}" id="cb-deuteranopia" style="justify-content:center;">Deuteranopia (Green)</button>
          <button class="chip ${AppState.settings.colorBlindMode === 'tritanopia' ? 'active' : ''}" id="cb-tritanopia" style="justify-content:center;">Tritanopia (Blue)</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-back-a11y').onclick = () => navigateTo('home');

  document.getElementById('btn-read-screen').onclick = () => {
    speakText("VOLTRIDE accessibility center. You can customize text size, toggle dyslexia typography, or activate easy mode.");
  };

  const slider = document.getElementById('text-size-slider');
  slider.oninput = (e) => {
    const val = parseInt(e.target.value);
    AppState.settings.textSize = val;
    document.getElementById('text-size-val').textContent = `${val}%`;
    document.documentElement.style.setProperty('--font-scale', (val / 100).toString());
  };

  document.getElementById('toggle-dyslexia').onchange = (e) => {
    AppState.settings.dyslexicFont = e.target.checked;
    document.body.classList.toggle('dyslexic-font', e.target.checked);
  };

  document.getElementById('toggle-contrast').onchange = (e) => {
    AppState.settings.highContrast = e.target.checked;
    document.body.classList.toggle('high-contrast', e.target.checked);
  };

  document.getElementById('toggle-bold').onchange = (e) => {
    AppState.settings.boldText = e.target.checked;
    document.body.classList.toggle('bold-text', e.target.checked);
  };

  document.getElementById('toggle-easy-mode').onchange = (e) => {
    AppState.settings.easyMode = e.target.checked;
    document.body.classList.toggle('easy-mode', e.target.checked);
  };

  ['none', 'protanopia', 'deuteranopia', 'tritanopia'].forEach(mode => {
    document.getElementById(`cb-${mode}`).onclick = () => {
      AppState.settings.colorBlindMode = mode;
      document.body.classList.remove('cb-protanopia', 'cb-deuteranopia', 'cb-tritanopia');
      if (mode !== 'none') document.body.classList.add(`cb-${mode}`);
      triggerHaptic('light');
      renderAccessibilityScreen(container);
    };
  });
}

// ==========================================================================
// MODAL BOTTOM SHEET HELPER (For Floating Quick A11y and Add Places)
// ==========================================================================
export function openBottomSheet(htmlContent) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('sheet-content');
  if (!overlay || !content) return;
  content.innerHTML = htmlContent;
  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
  triggerHaptic('light');

  overlay.onclick = (e) => {
    if (e.target === overlay) closeBottomSheet();
  };
}

export function closeBottomSheet() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
  }
}

function showAddPlaceModal() {
  openBottomSheet(`
    <div>
      <h3 style="font-family:var(--heading-font); margin-bottom:1rem;">Add New Saved Location</h3>
      <div class="input-group">
        <label class="input-label">Place Name</label>
        <input id="new-place-name" class="input-field" placeholder="e.g. Science Block B, Lab 102" />
      </div>
      <button id="btn-save-new-place" class="btn btn-primary btn-full">Save Location</button>
    </div>
  `);

  document.getElementById('btn-save-new-place').onclick = () => {
    const input = document.getElementById('new-place-name');
    if (input.value.trim()) {
      AppState.savedPlaces.push({
        id: Date.now(),
        name: input.value.trim(),
        lat: 12.9710 + (Math.random() - 0.5) * 0.002,
        lng: 77.5940 + (Math.random() - 0.5) * 0.002,
        icon: 'map-pin'
      });
      closeBottomSheet();
      showToast('Saved location added', 'success');
      navigateTo('home');
    }
  };
}

// ==========================================================================
// GLOBAL EVENT ATTACHMENTS & BOOTSTRAP
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Floating Accessibility Quick Button (On Every Screen)
  const floatingA11y = document.getElementById('floating-a11y-btn');
  if (floatingA11y) {
    floatingA11y.onclick = () => {
      triggerHaptic('medium');
      openBottomSheet(`
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 style="font-family:var(--heading-font); font-size:1.15rem;">Universal Accessibility</h3>
            <button class="chip" onclick="window.closeBottomSheet()">✕ Close</button>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:1rem;">
            <button class="btn btn-secondary btn-sm" id="quick-tts-btn">🔊 Read Screen</button>
            <button class="btn btn-secondary btn-sm" id="quick-contrast-btn">🌓 High Contrast</button>
            <button class="btn btn-secondary btn-sm" id="quick-dyslexia-btn">📖 Dyslexia Font</button>
            <button class="btn btn-secondary btn-sm" id="quick-easy-btn">✨ Easy Mode</button>
          </div>
          <button class="btn btn-primary btn-full btn-sm" id="quick-full-a11y">Open Full Accessibility Hub</button>
        </div>
      `);

      document.getElementById('quick-tts-btn').onclick = () => {
        speakText(`Current view is ${AppState.currentScreen}. Welcome to VOLTRIDE.`);
      };
      document.getElementById('quick-contrast-btn').onclick = () => {
        AppState.settings.highContrast = !AppState.settings.highContrast;
        document.body.classList.toggle('high-contrast', AppState.settings.highContrast);
        showToast(`High Contrast ${AppState.settings.highContrast ? 'On' : 'Off'}`, 'info');
      };
      document.getElementById('quick-dyslexia-btn').onclick = () => {
        AppState.settings.dyslexicFont = !AppState.settings.dyslexicFont;
        document.body.classList.toggle('dyslexic-font', AppState.settings.dyslexicFont);
        showToast(`Dyslexia Font ${AppState.settings.dyslexicFont ? 'On' : 'Off'}`, 'info');
      };
      document.getElementById('quick-easy-btn').onclick = () => {
        AppState.settings.easyMode = !AppState.settings.easyMode;
        document.body.classList.toggle('easy-mode', AppState.settings.easyMode);
        showToast(`Easy Mode ${AppState.settings.easyMode ? 'On' : 'Off'}`, 'info');
      };
      document.getElementById('quick-full-a11y').onclick = () => {
        closeBottomSheet();
        navigateTo('accessibility');
      };
    };
  }

  // Bottom Navigation Items
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.onclick = () => {
      const tab = btn.getAttribute('data-tab');
      navigateTo(tab, tab);
    };
  });

  // Clock Update
  setInterval(() => {
    const clock = document.getElementById('device-clock');
    if (clock) {
      const d = new Date();
      clock.textContent = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
  }, 1000);

  // Initialize in Onboarding or Home
  window.closeBottomSheet = closeBottomSheet;
  navigateTo('onboarding');
});
