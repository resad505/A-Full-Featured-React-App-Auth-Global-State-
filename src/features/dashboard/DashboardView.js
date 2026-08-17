import { ref, computed } from 'vue';
import { authStore } from '../../features/auth/authStore.js';
import { cartSlice } from '../../features/cart/cartSlice.js';
import { taskSlice } from '../../features/tasks/taskSlice.js';
import { globalStore } from '../../shared/state/index.js';
import { useRouter } from 'vue-router';
import { SessionInspector } from '../../shared/components/SessionInspector.js';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary.js';
import { useForm } from '../../shared/composables/useForm.js';
import {
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateEmail,
  validateNoHtml
} from '../../shared/utils/validators.js';

// Subcomponent used specifically to demonstrate local ErrorBoundary isolation
const CrashTestWidget = {
  name: 'CrashTestWidget',
  setup() {
    const shouldCrash = ref(false);

    const triggerCrash = () => {
      shouldCrash.value = true;
    };

    const computedData = computed(() => {
      if (shouldCrash.value) {
        throw new Error('Null Reference Exception in CrashTestWidget: cannot read property "renderMetrics" of undefined (Checkpoint 6 Test)');
      }
      return { status: 'Normal', uptime: '99.98%', ping: '24ms' };
    });

    return {
      triggerCrash,
      computedData
    };
  },
  template: `
    <div class="crash-widget">
      <div class="crash-widget__top">
        <span class="badge badge--success">Komponent Statusu: {{ computedData.status }}</span>
        <span class="crash-widget__metrics">Uptime: {{ computedData.uptime }} · Latency: {{ computedData.ping }}</span>
      </div>
      <p class="crash-widget__desc">
        Bu komponent <code>&lt;ErrorBoundary name="Sistem Metrikləri"&gt;</code> ilə əhatələnib. Aşağıdakı düyməyə basaraq xətanı təcrid olunmuş şəkildə test edə bilərsiniz:
      </p>
      <button type="button" class="btn btn--danger-ghost btn--sm" @click="triggerCrash">
        💥 Bu Komponenti Çökdür (Simulate Component Crash)
      </button>
    </div>
  `
};

export const DashboardView = {
  name: 'DashboardView',
  components: {
    SessionInspector,
    ErrorBoundary,
    CrashTestWidget
  },
  setup() {
    const router = useRouter();

    const cartCount = computed(() => cartSlice.itemCount.value);
    const activeTasksCount = computed(() => taskSlice.stats.value.active);
    const completedTasksCount = computed(() => taskSlice.stats.value.completed);

    const handleLogout = () => {
      authStore.logout('İdarəetmə panelindən çıxış edildi.');
      router.push('/login');
    };

    // ── Checkpoint 4: Feedback / Contact Form ─────────────────────────
    const {
      fields: fbFields,
      errors: fbErrors,
      isSubmitting: fbSubmitting,
      touchField: touchFb,
      setField: setFb,
      validateAll: validateFb,
      resetForm: resetFb,
      getValues: getFbValues
    } = useForm(
      {
        subject: '',
        category: 'general',
        priority: 'normal',
        message: '',
        email: ''
      },
      {
        subject: [
          (v) => validateRequired(v, 'Mövzu'),
          (v) => validateMinLength(v, 5, 'Mövzu'),
          (v) => validateMaxLength(v, 100, 'Mövzu'),
          (v) => validateNoHtml(v)
        ],
        category: [
          (v) => validateRequired(v, 'Kateqoriya')
        ],
        priority: [
          (v) => validateRequired(v, 'Üstünlük')
        ],
        message: [
          (v) => validateRequired(v, 'Mesaj'),
          (v) => validateMinLength(v, 20, 'Mesaj'),
          (v) => validateMaxLength(v, 500, 'Mesaj'),
          (v) => validateNoHtml(v)
        ],
        email: [
          (v) => validateEmail(v)
        ]
      }
    );

    const msgRemaining = computed(() => 500 - (fbFields.message?.length || 0));
    const msgCount = computed(() => fbFields.message?.length || 0);

    const handleSendFeedback = () => {
      const valid = validateFb();
      if (!valid) return;

      fbSubmitting.value = true;
      setTimeout(() => {
        const ticketId = 'FLIN-' + Math.floor(10000 + Math.random() * 90000);
        globalStore.dispatch({
          type: 'toasts/add',
          payload: {
            message: `✅ Rəyiniz qəbul edildi! Bilet №: ${ticketId}`,
            type: 'success',
            duration: 5000
          }
        });
        resetFb();
        fbSubmitting.value = false;
      }, 600);
    };

    return {
      authStore,
      cartCount,
      activeTasksCount,
      completedTasksCount,
      handleLogout,
      // feedback form
      fbFields,
      fbErrors,
      fbSubmitting,
      msgRemaining,
      msgCount,
      touchFb,
      setFb,
      handleSendFeedback
    };
  },
  template: `
    <section class="dashboard-view">
      <div class="view-top">
        <div class="view-top__left">
          <div class="view-top__badge">
            <span class="pulse-dot"></span>
            <span>Qorunan Marşrut · Global State Connected</span>
          </div>
          <h1 class="view-top__title">İdarəetmə Paneli</h1>
          <p class="view-top__sub">
            Qlobal vəziyyət (Redux/Context Store) real-vaxt rejimində bütün komponentlərlə sinxronlaşır.
          </p>
        </div>
        <button class="btn btn--danger-ghost btn--sm" @click="handleLogout">
          Təhlükəsiz Çıxış →
        </button>
      </div>

      <!-- User Profile summary card -->
      <div class="session-card">
        <div class="session-card__avatar">
          {{ authStore.user.value?.displayName?.charAt(0).toUpperCase() || 'U' }}
        </div>
        <div class="session-card__info">
          <div class="session-card__name-row">
            <p class="session-card__name">{{ authStore.user.value?.displayName || 'İstifadəçi' }}</p>
            <span class="badge badge--protected">{{ authStore.user.value?.role || 'Frontend Architect' }}</span>
          </div>
          <p class="session-card__email">{{ authStore.user.value?.username }}</p>
          <p class="session-card__sub">Daxil olma vaxtı: {{ authStore.user.value?.loginAt }}</p>
        </div>
      </div>

      <!-- Token & Session Live Inspector -->
      <SessionInspector />

      <!-- Real-time Stats Grid from Global Slices -->
      <div class="stats-grid">
        <div class="stat-block">
          <span class="stat-block__num">{{ activeTasksCount }}</span>
          <span class="stat-block__label">Gözləyən Tapşırıq</span>
        </div>
        <div class="stat-block">
          <span class="stat-block__num">{{ cartCount }}</span>
          <span class="stat-block__label">Səbətdəki Məhsul</span>
        </div>
        <div class="stat-block stat-block--accent">
          <span class="stat-block__num">{{ completedTasksCount }}</span>
          <span class="stat-block__label">Tamamlanmış İş</span>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- CHECKPOINT 6: Local Component Error Boundary Test Section     -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div class="eb-demo-panel">
        <div class="eb-demo-panel__top">
          <span class="badge badge--warning">Checkpoint 6 · Error Boundary Demo</span>
          <h3 class="eb-demo-panel__title">Lokal Komponent Xəta Təcridi (onErrorCaptured)</h3>
        </div>
        <ErrorBoundary name="Sistem Metrikləri Paneli">
          <CrashTestWidget />
        </ErrorBoundary>
      </div>

      <!-- Quick nav to other protected sections -->
      <div class="quick-nav">
        <h3 class="quick-nav__title">Qorunan Digər Bölmələr</h3>
        <div class="quick-nav__list">
          <router-link to="/tasks" class="quick-nav__item">
            <div class="quick-nav__info">
              <span class="quick-nav__label">/tasks ({{ activeTasksCount }} gözləyir)</span>
              <span class="quick-nav__desc">Tapşırıqlar Lövhəsi və Optimistic CRUD</span>
            </div>
            <span class="quick-nav__arrow">→</span>
          </router-link>
          <router-link to="/cart" class="quick-nav__item">
            <div class="quick-nav__info">
              <span class="quick-nav__label">/cart ({{ cartCount }} məhsul)</span>
              <span class="quick-nav__desc">Səbət, Promo Kod və Faktura</span>
            </div>
            <span class="quick-nav__arrow">→</span>
          </router-link>
          <router-link to="/profile" class="quick-nav__item">
            <div class="quick-nav__info">
              <span class="quick-nav__label">/profile</span>
              <span class="quick-nav__desc">İstifadəçi Profili və Təhlükəsizlik</span>
            </div>
            <span class="quick-nav__arrow">→</span>
          </router-link>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- CHECKPOINT 4: Feedback / Support Form — Manual Validation     -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div class="feedback-panel">
        <div class="feedback-panel__header">
          <div>
            <span class="badge badge--warning">Checkpoint 4 · Manual Validation Form #3</span>
            <h2 class="feedback-panel__title">Dəstək & Rəy Göndər</h2>
            <p class="feedback-panel__sub">
              useForm + validators.js ilə tam doğrulanan üçüncü forma. Submit sonra form avtomatik sıfırlanır.
            </p>
          </div>
        </div>

        <form class="feedback-form" @submit.prevent="handleSendFeedback" novalidate>
          <div class="feedback-form__grid">

            <!-- Subject -->
            <div
              class="feedback-form__group feedback-form__group--full"
              :class="{ 'feedback-form__group--error': fbErrors.subject }"
            >
              <label class="feedback-form__label" for="fb-subject">
                Mövzu <span class="profile-edit-form__required">*</span>
              </label>
              <input
                id="fb-subject"
                :value="fbFields.subject"
                @input="setFb('subject', $event.target.value)"
                @blur="touchFb('subject')"
                type="text"
                class="feedback-form__input"
                placeholder="Probleminizi və ya sualınızı qısaca yazın..."
                maxlength="100"
              />
              <span v-if="fbErrors.subject" class="feedback-form__error">{{ fbErrors.subject }}</span>
              <span v-else class="field-hint">Min 5, maks 100 simvol.</span>
            </div>

            <!-- Category -->
            <div
              class="feedback-form__group"
              :class="{ 'feedback-form__group--error': fbErrors.category }"
            >
              <label class="feedback-form__label" for="fb-category">
                Kateqoriya <span class="profile-edit-form__required">*</span>
              </label>
              <select
                id="fb-category"
                :value="fbFields.category"
                @change="setFb('category', $event.target.value)"
                @blur="touchFb('category')"
                class="feedback-form__select"
              >
                <option value="bug">🐛 Bug / Xəta Bildirişi</option>
                <option value="feature">💡 Xüsusiyyət Tələbi</option>
                <option value="question">❓ Sual</option>
                <option value="general">💬 Ümumi Rəy</option>
              </select>
              <span v-if="fbErrors.category" class="feedback-form__error">{{ fbErrors.category }}</span>
            </div>

            <!-- Priority -->
            <div
              class="feedback-form__group"
              :class="{ 'feedback-form__group--error': fbErrors.priority }"
            >
              <label class="feedback-form__label" for="fb-priority">
                Üstünlük <span class="profile-edit-form__required">*</span>
              </label>
              <select
                id="fb-priority"
                :value="fbFields.priority"
                @change="setFb('priority', $event.target.value)"
                @blur="touchFb('priority')"
                class="feedback-form__select"
              >
                <option value="low">🟢 Aşağı</option>
                <option value="normal">🟡 Normal</option>
                <option value="high">🔴 Yüksək</option>
                <option value="urgent">🚨 Kritik</option>
              </select>
              <span v-if="fbErrors.priority" class="feedback-form__error">{{ fbErrors.priority }}</span>
            </div>

            <!-- Email (optional) -->
            <div
              class="feedback-form__group feedback-form__group--full"
              :class="{ 'feedback-form__group--error': fbErrors.email }"
            >
              <label class="feedback-form__label" for="fb-email">
                Email <span class="field-hint field-hint--inline">(cavab üçün, isteğe bağlı)</span>
              </label>
              <input
                id="fb-email"
                :value="fbFields.email"
                @input="setFb('email', $event.target.value)"
                @blur="touchFb('email')"
                type="email"
                class="feedback-form__input"
                placeholder="cavab@flin.io"
                autocomplete="email"
              />
              <span v-if="fbErrors.email" class="feedback-form__error">{{ fbErrors.email }}</span>
            </div>

            <!-- Message -->
            <div
              class="feedback-form__group feedback-form__group--full"
              :class="{ 'feedback-form__group--error': fbErrors.message }"
            >
              <div class="feedback-form__label-row">
                <label class="feedback-form__label" for="fb-message">
                  Mesaj <span class="profile-edit-form__required">*</span>
                </label>
                <span
                  class="feedback-form__counter"
                  :class="{ 'feedback-form__counter--warn': msgRemaining < 80 }"
                >
                  {{ msgCount }} / 500
                </span>
              </div>
              <textarea
                id="fb-message"
                :value="fbFields.message"
                @input="setFb('message', $event.target.value)"
                @blur="touchFb('message')"
                class="feedback-form__textarea"
                placeholder="Probleminizi, sualınızı və ya rəyinizi ətraflı şəkildə izah edin (min 20 simvol)..."
                rows="4"
                maxlength="500"
              ></textarea>
              <span v-if="fbErrors.message" class="feedback-form__error">{{ fbErrors.message }}</span>
            </div>

          </div>

          <!-- Submit -->
          <div class="feedback-form__actions">
            <button
              type="submit"
              class="btn btn--solid btn--md"
              :disabled="fbSubmitting.value"
            >
              <span v-if="fbSubmitting.value" class="spinner"></span>
              <span>{{ fbSubmitting.value ? 'Göndərilir...' : 'Rəy Göndər →' }}</span>
            </button>
            <p class="feedback-form__note">
              Göndərdikdən sonra forma avtomatik sıfırlanır və toast bildirişi göstərilir.
            </p>
          </div>
        </form>
      </div>
    </section>
  `
};
