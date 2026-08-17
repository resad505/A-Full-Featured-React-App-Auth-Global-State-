import { computed, ref } from 'vue';
import { authStore } from '../state/authStore.js';
import { apiClient } from '../services/apiClient.js';
import { useRouter } from 'vue-router';

export const SessionInspector = {
  name: 'SessionInspector',
  setup() {
    const router = useRouter();
    const isSimulating = ref(false);
    const apiLog = ref(null);

    const formattedTimeRemaining = computed(() => {
      const sec = authStore.sessionSecondsRemaining.value;
      if (sec <= 0) return 'Müddəti bitib (0s)';
      const hours = Math.floor(sec / 3600);
      const mins = Math.floor((sec % 3600) / 60);
      const secs = sec % 60;
      if (hours > 0) return `${hours}s ${mins}d ${secs}san`;
      return `${mins}d ${secs}san`;
    });

    const decoded = computed(() => authStore.decodedToken.value);

    const handleRefresh = () => {
      authStore.refreshToken();
      apiLog.value = {
        type: 'success',
        text: 'Token uğurla yeniləndi. Yeni son istifadə vaxtı təyin edildi.'
      };
    };

    const handleSimulate401 = async () => {
      isSimulating.value = true;
      apiLog.value = {
        type: 'warning',
        text: '401 Unauthorized sorğusu göndərilir... İnterceptor aktivləşir.'
      };
      
      setTimeout(async () => {
        await apiClient.simulate401Error();
        isSimulating.value = false;
      }, 300);
    };

    const handleExpireNow = () => {
      authStore.simulateTokenExpiry();
      apiLog.value = {
        type: 'warning',
        text: 'Token vaxtı keçmiş kimi qeyd edildi. İstənilən qorunan səhifəyə keçid zamanı login-ə yönləndiriləcəksiniz.'
      };
    };

    const handleLogout = () => {
      authStore.logout('İstifadəçi sessiyanı sonlandırdı.');
      router.push('/login');
    };

    return {
      authStore,
      formattedTimeRemaining,
      decoded,
      isSimulating,
      apiLog,
      handleRefresh,
      handleSimulate401,
      handleExpireNow,
      handleLogout
    };
  },
  template: `
    <div class="session-inspector">
      <div class="session-inspector__header">
        <div class="session-inspector__badge">
          <span class="pulse-dot"></span>
          <span class="session-inspector__title">Token & Session Inspector</span>
        </div>
        <div class="session-inspector__ttl">
          <span class="session-inspector__ttl-label">Qalan Müddət:</span>
          <span class="session-inspector__ttl-val">{{ formattedTimeRemaining }}</span>
        </div>
      </div>

      <!-- Token claims grid -->
      <div class="session-inspector__grid" v-if="decoded">
        <div class="inspector-card">
          <span class="inspector-card__tag">Header</span>
          <pre class="inspector-card__json">{{ JSON.stringify(decoded.header, null, 2) }}</pre>
        </div>

        <div class="inspector-card">
          <span class="inspector-card__tag">Payload Claims</span>
          <pre class="inspector-card__json">{{ JSON.stringify(decoded.payload, null, 2) }}</pre>
        </div>
      </div>

      <!-- Live Storage Keys Status -->
      <div class="session-inspector__storage">
        <span class="session-inspector__storage-label">Local Storage Keys:</span>
        <div class="storage-tags">
          <span class="storage-tag storage-tag--active">flin_auth_token: [SET]</span>
          <span class="storage-tag storage-tag--active">flin_user_data: [SET]</span>
          <span class="storage-tag storage-tag--active">session_persistence: [ACTIVE]</span>
        </div>
      </div>

      <!-- Interceptor / Simulation Actions -->
      <div class="session-inspector__actions">
        <button 
          class="btn btn--sm btn--solid"
          @click="handleRefresh"
        >
          🔄 Tokeni Yenilə (Refresh)
        </button>

        <button 
          class="btn btn--sm btn--danger-ghost"
          :disabled="isSimulating"
          @click="handleSimulate401"
        >
          ⚡ 401 Xətasını Simulyasiya Et (Quality Check 1)
        </button>

        <button 
          class="btn btn--sm btn--ghost"
          @click="handleExpireNow"
        >
          ⏳ Müddəti Bitir (Force Expire)
        </button>

        <button 
          class="btn btn--sm btn--danger-ghost"
          @click="handleLogout"
        >
          🚪 Təmiz Çıxış (Wipe Storage)
        </button>
      </div>

      <!-- Live status log -->
      <div v-if="apiLog" class="session-inspector__log" :class="'session-inspector__log--' + apiLog.type">
        {{ apiLog.text }}
      </div>
    </div>
  `
};
