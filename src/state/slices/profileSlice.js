import { reactive, computed } from 'vue';
import { toastSlice } from './toastSlice.js';

const STORAGE_KEY = 'flin_profile_data';

function loadProfile() {
  try {
    // First try dedicated profile storage
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);

    // Fallback: bootstrap from auth user data
    const authRaw = localStorage.getItem('flin_user_data');
    if (authRaw) {
      const authUser = JSON.parse(authRaw);
      return {
        displayName: authUser.displayName || '',
        bio: '',
        role: authUser.role || 'Frontend Architect',
        website: ''
      };
    }
  } catch (err) {
    console.warn('[Profile] Storage read error:', err);
  }
  return {
    displayName: '',
    bio: '',
    role: 'Frontend Architect',
    website: ''
  };
}

const state = reactive({
  profile: loadProfile(),
  lastUpdated: null
});

function persistProfile() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.profile));
  } catch (e) {
    console.warn('[Profile] Persist failed:', e);
  }
}

export const profileSlice = {
  state,

  profile: computed(() => state.profile),
  lastUpdated: computed(() => state.lastUpdated),

  /**
   * Action: Update profile fields
   * @param {{ displayName, bio, role, website }} payload
   */
  updateProfile(payload) {
    state.profile = {
      ...state.profile,
      displayName: payload.displayName || state.profile.displayName,
      bio: payload.bio !== undefined ? payload.bio : state.profile.bio,
      role: payload.role || state.profile.role,
      website: payload.website !== undefined ? payload.website : state.profile.website
    };
    state.lastUpdated = new Date().toLocaleTimeString();
    persistProfile();
    toastSlice.addToast('✅ Profil məlumatları uğurla yeniləndi!', 'success', 3500);
  },

  /**
   * Reload profile from storage (called on app boot or after login).
   */
  reloadProfile() {
    const loaded = loadProfile();
    state.profile = loaded;
  }
};
