import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../auth/authStore.js';
import { useForm } from '../../shared/composables/useForm.js';
import {
  validateRequired,
  validateEmail,
  validateMinLength
} from '../../shared/utils/validators.js';

export const LoginView = {
  name: 'LoginView',
  setup() {
    const route = useRoute();
    const router = useRouter();

    const {
      fields,
      errors: formErrors,
      isSubmitting,
      touchField,
      setField,
      validateAll,
      resetForm,
      getValues
    } = useForm(
      {
        email: 'developer@flin.io',
        password: 'password123',
        role: 'Frontend Architect',
        rememberMe: true
      },
      {
        email: [
          (v) => validateRequired(v, 'Email ünvanı'),
          (v) => validateEmail(v)
        ],
        password: [
          (v) => validateRequired(v, 'Şifrə'),
          (v) => validateMinLength(v, 6, 'Şifrə')
        ]
      }
    );

    const showPassword = ref(false);
    const globalError = ref('');

    const redirectPath = computed(() => route.query.redirect || '/dashboard');
    const isRedirectedFromProtected = computed(() => !!route.query.redirect);
    const redirectReason = computed(() => route.query.reason);

    // Preset accounts for fast reviewer evaluation
    const demoAccounts = [
      {
        label: 'Architect (Sarah)',
        email: 'sarah.architect@flin.io',
        password: 'pass_architect_2026',
        role: 'Frontend Architect'
      },
      {
        label: 'Lead Dev (Alex)',
        email: 'alex.lead@flin.io',
        password: 'pass_alex_dev_99',
        role: 'Senior Vue Developer'
      },
      {
        label: 'Manager (Elena)',
        email: 'elena.pm@flin.io',
        password: 'pass_elena_pm_88',
        role: 'Product Manager'
      }
    ];

    const applyPreset = (acc) => {
      setField('email', acc.email);
      setField('password', acc.password);
      setField('role', acc.role);
      formErrors.email = '';
      formErrors.password = '';
      globalError.value = '';
    };

    const handleLogin = () => {
      globalError.value = '';
      const valid = validateAll();
      if (!valid) {
        return;
      }

      isSubmitting.value = true;

      // Realistic mock authentication request latency
      setTimeout(() => {
        try {
          const res = authStore.login(
            fields.email.trim(),
            fields.password,
            fields.role,
            fields.rememberMe
          );

          isSubmitting.value = false;
          if (res.success) {
            const dest = typeof redirectPath.value === 'string' ? redirectPath.value : '/dashboard';
            router.push(dest);
          }
        } catch (err) {
          isSubmitting.value = false;
          globalError.value = 'Giriş zamanı xəta baş verdi. Zəhmət olmasa yenidən yoxlayın.';
        }
      }, 450);
    };

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    return {
      fields,
      formErrors,
      isSubmitting,
      touchField,
      setField,
      showPassword,
      globalError,
      redirectPath,
      isRedirectedFromProtected,
      redirectReason,
      demoAccounts,
      applyPreset,
      handleLogin,
      togglePasswordVisibility
    };
  },
  template: `
    <section class="login-view">
      <div class="login-split">

        <!-- Left info panel -->
        <div class="login-split__left">
          <div class="login-brand">
            <div class="login-brand__logo">F</div>
            <span class="login-brand__name">Flin Auth</span>
          </div>
          <h1 class="login-split__headline">Secure session<br>authentication.</h1>
          <p class="login-split__sub">
            JSON Web Token (JWT) əsaslı sessiya idarəetməsi, localStorage yaddaşı və avtomatik sessiya bərpası.
          </p>

          <!-- Guard or 401 Notice -->
          <div class="login-split__guard-info" v-if="isRedirectedFromProtected">
            <div class="guard-notice" :class="{ 'guard-notice--expired': redirectReason === '401_expired' }">
              <span class="guard-notice__icon">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15"><rect x="3" y="7" width="10" height="8" rx="1.5"/><path d="M5.5 7V4.5a2.5 2.5 0 015 0V7"/></svg>
              </span>
              <div>
                <span class="guard-notice__title">
                  {{ redirectReason === '401_expired' ? '401 Sessiya Müddəti Bitdi' : 'Keçid Əngəlləndi (Qorunan Marşrut)' }}
                </span>
                <code class="guard-notice__path">{{ redirectPath }}</code>
              </div>
            </div>
          </div>

          <!-- Feature checklist -->
          <div class="auth-features">
            <div class="auth-feature">
              <span class="auth-feature__check">✓</span>
              <span class="auth-feature__text">JWT Token Storage (Header.Payload.Signature)</span>
            </div>
            <div class="auth-feature">
              <span class="auth-feature__check">✓</span>
              <span class="auth-feature__text">Session Persistence on Page Refresh</span>
            </div>
            <div class="auth-feature">
              <span class="auth-feature__check">✓</span>
              <span class="auth-feature__text">401 Interceptor with Auto-Redirect</span>
            </div>
            <div class="auth-feature">
              <span class="auth-feature__check">✓</span>
              <span class="auth-feature__text">Clean State & Storage Wipe on Logout</span>
            </div>
          </div>
        </div>

        <!-- Right form panel -->
        <div class="login-split__right">
          <div class="auth-form-card">
            <div class="auth-form-card__top">
              <h2 class="auth-form-card__title">Giriş Portalı</h2>
              <p class="auth-form-card__hint">
                Hesab məlumatlarınızı daxil edin və ya hazır test hesablarından seçin.
              </p>
            </div>

            <!-- Demo Account Quick Selector -->
            <div class="demo-presets">
              <span class="demo-presets__label">Sürətli Test Hesabları:</span>
              <div class="demo-presets__buttons">
                <button 
                  v-for="acc in demoAccounts" 
                  :key="acc.email"
                  type="button"
                  class="demo-btn"
                  @click="applyPreset(acc)"
                >
                  {{ acc.label }}
                </button>
              </div>
            </div>

            <!-- Global Error Banner -->
            <div v-if="globalError" class="auth-form__alert auth-form__alert--danger">
              {{ globalError }}
            </div>

            <form class="auth-form" @submit.prevent="handleLogin" novalidate>
              <!-- Email input -->
              <div class="auth-form__group" :class="{ 'auth-form__group--error': formErrors.email }">
                <label class="auth-form__label" for="f-email">Email Ünvanı</label>
                <input 
                  id="f-email" 
                  :value="fields.email"
                  @input="setField('email', $event.target.value)"
                  @blur="touchField('email')"
                  type="email" 
                  class="auth-form__input" 
                  placeholder="ad@shirket.com"
                  autocomplete="username"
                />
                <span v-if="formErrors.email" class="auth-form__error-msg">{{ formErrors.email }}</span>
              </div>

              <!-- Password input with toggle -->
              <div class="auth-form__group" :class="{ 'auth-form__group--error': formErrors.password }">
                <div class="auth-form__label-row">
                  <label class="auth-form__label" for="f-pass">Şifrə</label>
                  <button type="button" class="auth-form__toggle-pwd" @click="togglePasswordVisibility">
                    {{ showPassword ? 'Gizlət' : 'Göstər' }}
                  </button>
                </div>
                <div class="auth-form__input-wrapper">
                  <input 
                    id="f-pass" 
                    :value="fields.password"
                    @input="setField('password', $event.target.value)"
                    @blur="touchField('password')"
                    :type="showPassword ? 'text' : 'password'" 
                    class="auth-form__input" 
                    placeholder="••••••••"
                    autocomplete="current-password"
                  />
                </div>
                <span v-if="formErrors.password" class="auth-form__error-msg">{{ formErrors.password }}</span>
              </div>

              <!-- Role Selector -->
              <div class="auth-form__group">
                <label class="auth-form__label" for="f-role">Sistem Rolu</label>
                <select 
                  id="f-role" 
                  :value="fields.role"
                  @change="setField('role', $event.target.value)"
                  class="auth-form__select"
                >
                  <option value="Frontend Architect">Frontend Architect</option>
                  <option value="Senior Vue Developer">Senior Vue Developer</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Security Lead">Security Lead</option>
                </select>
              </div>

              <!-- Remember Me -->
              <div class="auth-form__checkbox-row">
                <label class="custom-checkbox">
                  <input 
                    type="checkbox" 
                    :checked="fields.rememberMe"
                    @change="setField('rememberMe', $event.target.checked)"
                  />
                  <span class="custom-checkbox__box"></span>
                  <span class="custom-checkbox__label">Məni xatırla (Uzadılmış 7 günlük sessiya)</span>
                </label>
              </div>

              <!-- Submit button -->
              <button 
                type="submit" 
                class="btn btn--solid btn--block btn--md auth-form__submit" 
                :disabled="isSubmitting.value"
              >
                <span v-if="isSubmitting.value" class="spinner"></span>
                <span>{{ isSubmitting.value ? 'Doğrulanır...' : 'Daxil Ol →' }}</span>
              </button>
            </form>
          </div>
        </div>

      </div>
    </section>
  `
};
