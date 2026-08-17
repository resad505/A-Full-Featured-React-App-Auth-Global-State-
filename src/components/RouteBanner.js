import { authStore } from '../state/authStore.js';

export const RouteBanner = {
  name: 'RouteBanner',
  setup() {
    return {
      authStore
    };
  },
  template: `
    <div v-if="authStore.routeNotice.value" class="route-banner" :class="'route-banner--' + authStore.routeNotice.value.type">
      <div class="route-banner__container">
        <div class="route-banner__content">
          <span class="route-banner__icon">
            <template v-if="authStore.routeNotice.value.type === 'warning'">🛡️</template>
            <template v-else-if="authStore.routeNotice.value.type === 'success'">🎉</template>
            <template v-else-if="authStore.routeNotice.value.type === 'danger'">⛔</template>
            <template v-else>ℹ️</template>
          </span>
          <span class="route-banner__text">{{ authStore.routeNotice.value.message }}</span>
        </div>
        <button class="route-banner__close-btn" @click="authStore.clearNotice" aria-label="Bağla">
          ✕
        </button>
      </div>
    </div>
  `
};
