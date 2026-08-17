import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../state/authStore.js';

export const LoginView = {
  name: 'LoginView',
  setup() {
    const route = useRoute();
    const router = useRouter();

    const email = ref('developer@flin.io');
    const password = ref('password123');
    const role = ref('Frontend Architect');
    const isSubmitting = ref(false);
    const redirectPath = route.query.redirect || '/dashboard';
    const isRedirectedFromProtected = !!route.query.redirect;

    const handleLogin = () => {
      if (!email.value.trim() || !password.value.trim()) {
        authStore.setNotice('Email və şifrə tələb olunur.', 'danger');
        return;
      }
      isSubmitting.value = true;
      setTimeout(() => {
        authStore.login(email.value, role.value);
        isSubmitting.value = false;
        router.push(redirectPath);
      }, 400);
    };

    return { email, password, role, isSubmitting, redirectPath, isRedirectedFromProtected, handleLogin };
  },
  template: `
    <section class="login-view">
      <div class="login-split">

        <!-- Left info panel -->
        <div class="login-split__left">
          <div class="login-brand">
            <div class="login-brand__logo">F</div>
            <span class="login-brand__name">Flin</span>
          </div>
          <h1 class="login-split__headline">Protected<br>access portal.</h1>
          <p class="login-split__sub">Navigation guard aktiv vəziyyətdədir. Qorunan bölmələrə yalnız autentifikasiyadan sonra daxil olmaq mümkündür.</p>

          <div class="login-split__guard-info" v-if="isRedirectedFromProtected">
            <div class="guard-notice">
              <span class="guard-notice__icon">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15"><rect x="3" y="7" width="10" height="8" rx="1.5"/><path d="M5.5 7V4.5a2.5 2.5 0 015 0V7"/></svg>
              </span>
              <div>
                <span class="guard-notice__title">Keçid əngəlləndi</span>
                <code class="guard-notice__path">{{ redirectPath }}</code>
              </div>
            </div>
          </div>
        </div>

        <!-- Right form -->
        <div class="login-split__right">
          <div class="auth-form-card">
            <h2 class="auth-form-card__title">Daxil Ol</h2>
            <p class="auth-form-card__hint">Giriş etdikdən sonra <code>{{ redirectPath }}</code> ünvanına yönləndiriləcəksiniz.</p>

            <form class="auth-form" @submit.prevent="handleLogin">
              <div class="auth-form__group">
                <label class="auth-form__label" for="f-email">Email</label>
                <input id="f-email" v-model="email" type="email" class="auth-form__input" required />
              </div>
              <div class="auth-form__group">
                <label class="auth-form__label" for="f-pass">Şifrə</label>
                <input id="f-pass" v-model="password" type="password" class="auth-form__input" required />
              </div>
              <div class="auth-form__group">
                <label class="auth-form__label" for="f-role">Rol</label>
                <select id="f-role" v-model="role" class="auth-form__select">
                  <option value="Frontend Architect">Frontend Architect</option>
                  <option value="Senior Vue Developer">Senior Vue Developer</option>
                  <option value="Product Manager">Product Manager</option>
                </select>
              </div>
              <button type="submit" class="btn btn--solid btn--block btn--md auth-form__submit" :disabled="isSubmitting">
                {{ isSubmitting ? 'Yüklənir...' : 'Daxil ol →' }}
              </button>
            </form>
          </div>
        </div>

      </div>
    </section>
  `
};
