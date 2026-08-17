import { computed } from 'vue';
import { authStore } from '../auth/authStore.js';
import { globalStore } from '../../shared/state/index.js';
import { SessionInspector } from '../../shared/components/SessionInspector.js';
import { useRouter } from 'vue-router';
import { useForm } from '../../shared/composables/useForm.js';
import {
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateUrl,
  validateNoHtml
} from '../../shared/utils/validators.js';

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

    // ── Profile Edit Form (Checkpoint 4) ──────────────────────────────
    const profile = computed(() => globalStore.profile.profile.value);

    const {
      fields,
      errors,
      isDirty,
      isSubmitting,
      touchField,
      setField,
      validateAll,
      resetForm,
      getValues
    } = useForm(
      {
        displayName: profile.value.displayName || authStore.user.value?.displayName || '',
        bio: profile.value.bio || '',
        role: profile.value.role || authStore.user.value?.role || 'Frontend Architect',
        website: profile.value.website || ''
      },
      {
        displayName: [
          (v) => validateRequired(v, 'Ad / Təxəllüs'),
          (v) => validateMinLength(v, 2, 'Ad / Təxəllüs'),
          (v) => validateMaxLength(v, 40, 'Ad / Təxəllüs'),
          (v) => validateNoHtml(v)
        ],
        bio: [
          (v) => validateMaxLength(v, 200, 'Bio'),
          (v) => validateNoHtml(v)
        ],
        role: [
          (v) => validateRequired(v, 'Sistem Rolu')
        ],
        website: [
          (v) => validateUrl(v)
        ]
      }
    );

    const bioRemaining = computed(() => 200 - (fields.bio?.length || 0));

    const handleSaveProfile = () => {
      const valid = validateAll();
      if (!valid) return;

      isSubmitting.value = true;
      setTimeout(() => {
        globalStore.dispatch({ type: 'profile/update', payload: getValues() });
        isSubmitting.value = false;
      }, 350);
    };

    const handleReset = () => {
      resetForm();
    };

    return {
      authStore,
      handleLogout,
      // Form
      fields,
      errors,
      isDirty,
      isSubmitting,
      bioRemaining,
      touchField,
      setField,
      handleSaveProfile,
      handleReset,
      profile
    };
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

      <!-- Current Profile Card -->
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

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- CHECKPOINT 4: Profile Edit Form — Manual Validation            -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div class="profile-edit-panel">
        <div class="profile-edit-panel__header">
          <div>
            <span class="badge badge--warning">Checkpoint 4 · Manual Validation</span>
            <h2 class="profile-edit-panel__title">Profil Məlumatlarını Düzəlt</h2>
            <p class="profile-edit-panel__sub">
              useForm composable + validators.js ilə manual sahə doğrulaması. Dəyişikliklər globalStore-a dispatch edilir.
            </p>
          </div>
          <div v-if="profile.lastUpdated" class="profile-edit-panel__updated">
            Son yeniləmə: {{ profile.lastUpdated }}
          </div>
        </div>

        <form class="profile-edit-form" @submit.prevent="handleSaveProfile" novalidate>
          <div class="profile-edit-form__grid">

            <!-- Display Name -->
            <div class="profile-edit-form__group" :class="{ 'profile-edit-form__group--error': errors.displayName }">
              <label class="profile-edit-form__label" for="pe-name">
                Ad / Təxəllüs <span class="profile-edit-form__required">*</span>
              </label>
              <input
                id="pe-name"
                :value="fields.displayName"
                @input="setField('displayName', $event.target.value)"
                @blur="touchField('displayName')"
                type="text"
                class="profile-edit-form__input"
                placeholder="Məs: Sarah Chen"
                autocomplete="name"
                maxlength="40"
              />
              <span v-if="errors.displayName" class="profile-edit-form__error">{{ errors.displayName }}</span>
              <span v-else class="field-hint">Minimum 2, maksimum 40 simvol.</span>
            </div>

            <!-- Role -->
            <div class="profile-edit-form__group" :class="{ 'profile-edit-form__group--error': errors.role }">
              <label class="profile-edit-form__label" for="pe-role">
                Sistem Rolu <span class="profile-edit-form__required">*</span>
              </label>
              <select
                id="pe-role"
                :value="fields.role"
                @change="setField('role', $event.target.value)"
                @blur="touchField('role')"
                class="profile-edit-form__select"
              >
                <option value="Frontend Architect">Frontend Architect</option>
                <option value="Senior Vue Developer">Senior Vue Developer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Security Lead">Security Lead</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
              </select>
              <span v-if="errors.role" class="profile-edit-form__error">{{ errors.role }}</span>
            </div>

            <!-- Website -->
            <div class="profile-edit-form__group profile-edit-form__group--full" :class="{ 'profile-edit-form__group--error': errors.website }">
              <label class="profile-edit-form__label" for="pe-website">
                Veb Sayt <span class="field-hint field-hint--inline">(isteğe bağlı)</span>
              </label>
              <input
                id="pe-website"
                :value="fields.website"
                @input="setField('website', $event.target.value)"
                @blur="touchField('website')"
                type="url"
                class="profile-edit-form__input"
                placeholder="https://sizin-saytiniz.com"
                autocomplete="url"
              />
              <span v-if="errors.website" class="profile-edit-form__error">{{ errors.website }}</span>
              <span v-else class="field-hint">https:// formatında tam URL daxil edin.</span>
            </div>

            <!-- Bio -->
            <div class="profile-edit-form__group profile-edit-form__group--full" :class="{ 'profile-edit-form__group--error': errors.bio }">
              <div class="profile-edit-form__label-row">
                <label class="profile-edit-form__label" for="pe-bio">
                  Bio <span class="field-hint field-hint--inline">(isteğe bağlı)</span>
                </label>
                <span class="profile-edit-form__counter" :class="{ 'profile-edit-form__counter--warn': bioRemaining < 30 }">
                  {{ bioRemaining }} / 200
                </span>
              </div>
              <textarea
                id="pe-bio"
                :value="fields.bio"
                @input="setField('bio', $event.target.value)"
                @blur="touchField('bio')"
                class="profile-edit-form__textarea"
                placeholder="Özünüz haqqında qısa məlumat..."
                rows="3"
                maxlength="200"
              ></textarea>
              <span v-if="errors.bio" class="profile-edit-form__error">{{ errors.bio }}</span>
            </div>

          </div>

          <!-- Form Actions -->
          <div class="profile-edit-form__actions">
            <button
              type="submit"
              class="btn btn--solid btn--md"
              :disabled="isSubmitting.value"
            >
              <span v-if="isSubmitting.value" class="spinner"></span>
              <span>{{ isSubmitting.value ? 'Saxlanılır...' : 'Dəyişiklikləri Saxla →' }}</span>
            </button>
            <button
              type="button"
              class="btn btn--ghost btn--md"
              @click="handleReset"
              :disabled="!isDirty || isSubmitting.value"
            >
              Ləğv Et
            </button>
            <span v-if="isDirty" class="profile-edit-form__dirty-badge">● Yadda saxlanmamış dəyişiklik</span>
          </div>
        </form>
      </div>

      <!-- Token & Session Live Inspector -->
      <SessionInspector />
    </section>
  `
};
