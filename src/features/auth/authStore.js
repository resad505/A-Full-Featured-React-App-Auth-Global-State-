import { reactive, computed } from 'vue';
import { createMockJwt, decodeJwt, isTokenExpired, getTokenRemainingSeconds } from '../../shared/utils/token.js';

const STORAGE_KEY = 'flin_auth_token';
const USER_KEY = 'flin_user_data';
const REMEMBER_KEY = 'flin_remember_me';

// Initial state restored from localStorage for session persistence across page refreshes
function getInitialState() {
  const savedToken = localStorage.getItem(STORAGE_KEY);
  const savedUser = localStorage.getItem(USER_KEY);
  
  if (savedToken && !isTokenExpired(savedToken)) {
    try {
      const decoded = decodeJwt(savedToken);
      return {
        token: savedToken,
        user: savedUser ? JSON.parse(savedUser) : (decoded?.payload || null),
        routeNotice: null,
        sessionSecondsRemaining: getTokenRemainingSeconds(savedToken)
      };
    } catch {
      // Corrupt state fallback
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(USER_KEY);
    }
  } else if (savedToken && isTokenExpired(savedToken)) {
    // Clean expired token on startup
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
  }

  return {
    token: null,
    user: null,
    routeNotice: null,
    sessionSecondsRemaining: 0
  };
}

const state = reactive(getInitialState());

// Timer to tick down remaining session time
let sessionTimer = null;

function startSessionTimer() {
  if (sessionTimer) clearInterval(sessionTimer);
  if (!state.token) return;

  state.sessionSecondsRemaining = getTokenRemainingSeconds(state.token);

  sessionTimer = setInterval(() => {
    if (!state.token) {
      clearInterval(sessionTimer);
      return;
    }
    const remaining = getTokenRemainingSeconds(state.token);
    state.sessionSecondsRemaining = remaining;
    if (remaining <= 0) {
      clearInterval(sessionTimer);
      authStore.logout('Sessiyanın vaxtı bitdi. Zəhmət olmasa yenidən daxil olun.');
    }
  }, 1000);
}

// Start timer if token was restored from localStorage
if (state.token) {
  startSessionTimer();
}

export const authStore = {
  state,
  
  isAuthenticated: computed(() => !!state.token && !isTokenExpired(state.token)),
  
  user: computed(() => state.user),
  
  routeNotice: computed(() => state.routeNotice),

  sessionSecondsRemaining: computed(() => state.sessionSecondsRemaining),

  decodedToken: computed(() => decodeJwt(state.token)),

  setNotice(message, type = 'warning') {
    state.routeNotice = { message, type, id: Date.now() };
  },

  clearNotice() {
    state.routeNotice = null;
  },

  /**
   * Login method supporting credentials, role selection and remember me
   */
  login(email = 'developer@flin.io', password = '', role = 'Frontend Architect', rememberMe = true) {
    const ttlSeconds = rememberMe ? 86400 * 7 : 3600; // 7 days vs 1 hour
    const displayName = email.includes('@') ? email.split('@')[0] : email;

    const userData = {
      username: email,
      displayName: displayName.charAt(0).toUpperCase() + displayName.slice(1),
      role: role || 'Frontend Architect',
      rememberMe: !!rememberMe,
      loginAt: new Date().toLocaleTimeString(),
      loginTimestamp: Date.now()
    };

    const token = createMockJwt({
      email,
      displayName: userData.displayName,
      role: userData.role
    }, ttlSeconds);

    state.token = token;
    state.user = userData;

    // Secure persistence to localStorage
    localStorage.setItem(STORAGE_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(REMEMBER_KEY, JSON.stringify(rememberMe));

    startSessionTimer();
    this.setNotice(`Xoş gəldiniz, ${userData.displayName}! Sessiya uğurla başladıldı.`, 'success');

    return { success: true, user: userData, token };
  },

  /**
   * Complete clean logout - wipes all sensitive state to prevent back-button access (Quality Check 3)
   * and prevents data leakage across demo accounts
   */
  logout(reason = 'Çıxış edildi. Qorunan marşrutlar aktiv guard altındadır.') {
    if (sessionTimer) {
      clearInterval(sessionTimer);
      sessionTimer = null;
    }

    state.token = null;
    state.user = null;
    state.sessionSecondsRemaining = 0;

    // Clear all storage traces including tasks, cart, and profile data
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    localStorage.removeItem('flin_tasks_state');
    localStorage.removeItem('flin_cart_state');
    localStorage.removeItem('flin_profile_data');

    if (reason) {
      this.setNotice(reason, 'info');
    }
  },

  /**
   * Simulates refreshing the JWT token with a renewed TTL
   */
  refreshToken() {
    if (!state.token || !state.user) return false;

    const renewedToken = createMockJwt({
      email: state.user.username,
      displayName: state.user.displayName,
      role: state.user.role
    }, 3600);

    state.token = renewedToken;
    localStorage.setItem(STORAGE_KEY, renewedToken);
    startSessionTimer();

    this.setNotice('Sessiya tokeni uğurla yeniləndi (Token Refreshed).', 'success');
    return true;
  },

  /**
   * Test simulator: Manually forces token expiry to test 401 handling & guard protection (Quality Check 1)
   */
  simulateTokenExpiry() {
    // Generate an expired token (issued in past, exp = -100 seconds ago)
    const expiredToken = createMockJwt({
      email: state.user?.username || 'developer@flin.io',
      displayName: state.user?.displayName || 'Developer',
      role: state.user?.role || 'Frontend Architect'
    }, -100);

    state.token = expiredToken;
    localStorage.setItem(STORAGE_KEY, expiredToken);
    state.sessionSecondsRemaining = 0;

    this.setNotice('⚠️ Simulyasiya: Token müddəti bitdi kimi təyin edildi.', 'warning');
  },

  /**
   * Quick toggle helper for navbar buttons
   */
  toggleMockAuth() {
    if (this.isAuthenticated.value) {
      this.logout();
    } else {
      this.login('sarah.architect@flin.io', 'pass123', 'Frontend Architect', true);
    }
  },

  /**
   * Helper to retrieve authorization header for API calls
   */
  getAuthHeader() {
    return state.token ? `Bearer ${state.token}` : null;
  }
};
