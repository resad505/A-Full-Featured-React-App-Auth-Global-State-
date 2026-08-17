import { authStore } from '../state/authStore.js';
import { SessionInspector } from '../components/SessionInspector.js';
import { useRouter } from 'vue-router';

export const ProfileView = {
  name: 'ProfileView',
  components: {
    SessionInspector
  },
  setup() {
    const router = useRouter();

    const handleLogout = () => {
      authStore.logout('Profil səhifəsindən çıxış edildi.');
      router.push('/login');
    };

    return { authStore, handleLogout };
  },
  template: `
    <section class="profile-view">
      <div class="view-top">
        <div class="view-top__left">
          <div class="view-top__badge">
            <span class="pulse-dot"></span>
            <span>Qorunan Profil Bölməsi</span>
          </div>
          <h1 class="view-top__title">İstifadəçi Profili</h1>
          <p class="view-top__sub">
            Autentifikasiya edilmiş hesab parametrləri və aktiv JWT token məlumatları.
          </p>
        </div>
        <button class="btn btn--danger-ghost btn--sm" @click="handleLogout">
          Çıxış Et →
        </button>
      </div>

      <div class="profile-card">
        <div class="profile-card__col">
          <div class="profile-card__avatar">
            {{ authStore.user.value?.displayName?.charAt(0).toUpperCase() || 'U' }}
          </div>
        </div>
        <div class="profile-card__col profile-card__col--data">
          <dl class="profile-data">
            <div class="profile-data__row">
              <dt class="profile-data__key">Ad / Təxəllüs</dt>
              <dd class="profile-data__val">{{ authStore.user.value?.displayName || 'İstifadəçi' }}</dd>
            </div>
            <div class="profile-data__row">
              <dt class="profile-data__key">Email Ünvanı</dt>
              <dd class="profile-data__val">{{ authStore.user.value?.username || '—' }}</dd>
            </div>
            <div class="profile-data__row">
              <dt class="profile-data__key">Sistem Rolu</dt>
              <dd class="profile-data__val">
                <span class="badge badge--protected">{{ authStore.user.value?.role || 'Frontend Architect' }}</span>
              </dd>
            </div>
            <div class="profile-data__row">
              <dt class="profile-data__key">Giriş Vaxtı</dt>
              <dd class="profile-data__val">{{ authStore.user.value?.loginAt || 'İndiki sessiya' }}</dd>
            </div>
            <div class="profile-data__row">
              <dt class="profile-data__key">Uzadılmış Sessiya</dt>
              <dd class="profile-data__val">{{ authStore.user.value?.rememberMe ? 'Bəli (7 gün)' : 'Xeyr (1 saat)' }}</dd>
            </div>
            <div class="profile-data__row">
              <dt class="profile-data__key">Raw JWT Token</dt>
              <dd class="profile-data__val profile-data__val--mono">{{ authStore.state.token }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Token & Session Live Inspector -->
      <SessionInspector />
    </section>
  `
};
