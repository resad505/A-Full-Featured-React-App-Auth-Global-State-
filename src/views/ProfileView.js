import { authStore } from '../state/authStore.js';

export const ProfileView = {
  name: 'ProfileView',
  setup() {
    return { authStore };
  },
  template: `
    <section class="profile-view">
      <div class="view-top">
        <h1 class="view-top__title">Profil</h1>
        <p class="view-top__sub">Qorunan bölmə.</p>
      </div>

      <div class="profile-card">
        <div class="profile-card__col">
          <div class="profile-card__avatar">{{ authStore.user.value?.displayName?.charAt(0).toUpperCase() }}</div>
        </div>
        <div class="profile-card__col profile-card__col--data">
          <dl class="profile-data">
            <div class="profile-data__row">
              <dt class="profile-data__key">Email</dt>
              <dd class="profile-data__val">{{ authStore.user.value?.username }}</dd>
            </div>
            <div class="profile-data__row">
              <dt class="profile-data__key">Ad</dt>
              <dd class="profile-data__val">{{ authStore.user.value?.displayName }}</dd>
            </div>
            <div class="profile-data__row">
              <dt class="profile-data__key">Rol</dt>
              <dd class="profile-data__val">{{ authStore.user.value?.role }}</dd>
            </div>
            <div class="profile-data__row">
              <dt class="profile-data__key">Token</dt>
              <dd class="profile-data__val profile-data__val--mono">{{ authStore.state.token }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  `
};
