import { reactive, computed } from 'vue';

const STORAGE_KEY = 'flin_auth_token';
const USER_KEY = 'flin_user_data';

// Initial state from localStorage for session persistence
const savedToken = localStorage.getItem(STORAGE_KEY);
const savedUser = localStorage.getItem(USER_KEY);

const state = reactive({
  token: savedToken || null,
  user: savedUser ? JSON.parse(savedUser) : null,
  routeNotice: null // { message: string, type: 'warning' | 'info' | 'success' }
});

export const authStore = {
  state,
  
  isAuthenticated: computed(() => !!state.token),
  
  user: computed(() => state.user),
  
  routeNotice: computed(() => state.routeNotice),

  setNotice(message, type = 'warning') {
    state.routeNotice = { message, type };
  },

  clearNotice() {
    state.routeNotice = null;
  },

  login(username = 'developer@flin.io', role = 'Frontend Lead') {
    const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2) + Date.now();
    const userData = {
      username,
      displayName: username.split('@')[0],
      role,
      loginAt: new Date().toLocaleTimeString()
    };

    state.token = mockToken;
    state.user = userData;

    localStorage.setItem(STORAGE_KEY, mockToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    
    this.setNotice(`Daxil oldunuz — ${userData.displayName}`, 'success');
  },

  logout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
    this.setNotice('Çıxış edildi. Qorunan marşrutlar aktiv guard altındadır.', 'info');
  },

  toggleMockAuth() {
    if (this.isAuthenticated.value) {
      this.logout();
    } else {
      this.login('demo.developer@flin.io', 'Senior Frontend Engineer');
    }
  }
};
