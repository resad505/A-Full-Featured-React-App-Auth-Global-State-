import { authStore } from '../state/authStore.js';

export const HomeView = {
  name: 'HomeView',
  setup() {
    return { authStore };
  },
  template: `
    <section class="home-view">

      <!-- ── HERO ── Asymmetric left-aligned split layout -->
      <div class="hero">
        <div class="hero__left">
          <div class="hero__eyebrow">
            <span class="eyebrow-tag">Vue 3 · Vue Router 4</span>
          </div>

          <h1 class="hero__title">
            Route guard<br>
            <em class="hero__title-em">infrastructure</em><br>
            done right.
          </h1>

          <p class="hero__body">
            Qorunan marşrutlar, sessiya idarəetməsi və BEM memarlığı — tam frontend həlli.
          </p>

          <div class="hero__cta-row">
            <router-link to="/dashboard" class="btn btn--solid btn--md">
              Dashboard-a Keç
            </router-link>
            <router-link to="/catalog" class="btn btn--ghost btn--md">
              Kataloqa Bax
            </router-link>
          </div>
        </div>

        <div class="hero__right">
          <div class="terminal-card">
            <div class="terminal-card__bar">
              <span class="terminal-card__dot terminal-card__dot--red"></span>
              <span class="terminal-card__dot terminal-card__dot--yellow"></span>
              <span class="terminal-card__dot terminal-card__dot--green"></span>
              <span class="terminal-card__title">router/index.js</span>
            </div>
            <pre class="terminal-card__code"><span class="code-dim">// Navigation Guard</span>
router<span class="code-punct">.</span><span class="code-fn">beforeEach</span><span class="code-punct">((</span>to<span class="code-punct">,</span> from<span class="code-punct">,</span> next<span class="code-punct">) => {</span>
  <span class="code-kw">const</span> isAuth <span class="code-punct">=</span> authStore<span class="code-punct">.</span>isAuthenticated<span class="code-punct">.</span>value<span class="code-punct">;</span>
  <span class="code-kw">const</span> needsAuth <span class="code-punct">=</span> to<span class="code-punct">.</span>meta<span class="code-punct">.</span>requiresAuth<span class="code-punct">;</span>

  <span class="code-kw">if</span> <span class="code-punct">(</span>needsAuth <span class="code-punct">&amp;&amp; !</span>isAuth<span class="code-punct">) {</span>
    <span class="code-fn">next</span><span class="code-punct">({</span>
      path<span class="code-punct">:</span> <span class="code-str">'/login'</span><span class="code-punct">,</span>
      query<span class="code-punct">: {</span> redirect<span class="code-punct">:</span> to<span class="code-punct">.</span>fullPath <span class="code-punct">}</span>
    <span class="code-punct">});</span>
  <span class="code-punct">}</span> <span class="code-kw">else</span> <span class="code-punct">{</span>
    <span class="code-fn">next</span><span class="code-punct">();</span>
  <span class="code-punct">}</span>
<span class="code-punct">});</span></pre>
          </div>

          <!-- Live auth state indicator -->
          <div class="auth-indicator">
            <div class="auth-indicator__row">
              <span class="auth-indicator__label">Auth State</span>
              <span class="auth-indicator__value" :class="authStore.isAuthenticated.value ? 'auth-indicator__value--live' : 'auth-indicator__value--idle'">
                {{ authStore.isAuthenticated.value ? '● authenticated' : '○ anonymous' }}
              </span>
            </div>
            <div class="auth-indicator__row">
              <span class="auth-indicator__label">Token</span>
              <span class="auth-indicator__token">
                {{ authStore.isAuthenticated.value ? authStore.state.token?.substring(0,22) + '...' : 'null' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── ROUTE MAP TABLE ── -->
      <div class="route-table-section">
        <div class="route-table-section__header">
          <h2 class="route-table-section__title">Marşrut Xəritəsi</h2>
          <div class="auth-gate-toggle">
            <button 
              class="btn btn--sm" 
              :class="authStore.isAuthenticated.value ? 'btn--danger-ghost' : 'btn--solid'"
              @click="authStore.toggleMockAuth()"
            >
              {{ authStore.isAuthenticated.value ? '⊖ Çıxış Et' : '⊕ Mock Giriş' }}
            </button>
          </div>
        </div>

        <div class="route-table">
          <div class="route-table__head">
            <span>Marşrut</span>
            <span>Tip</span>
            <span>Guard</span>
            <span>Keç</span>
          </div>

          <div class="route-table__row">
            <code class="route-table__path">/</code>
            <span class="badge badge--public">Public</span>
            <span class="route-table__guard route-table__guard--none">—</span>
            <router-link to="/" class="btn btn--xs btn--ghost">↗</router-link>
          </div>

          <div class="route-table__row">
            <code class="route-table__path">/catalog</code>
            <span class="badge badge--public">Public</span>
            <span class="route-table__guard route-table__guard--none">—</span>
            <router-link to="/catalog" class="btn btn--xs btn--ghost">↗</router-link>
          </div>

          <div class="route-table__row">
            <code class="route-table__path">/login</code>
            <span class="badge badge--info">Guest</span>
            <span class="route-table__guard route-table__guard--guest">requiresGuest</span>
            <router-link to="/login" class="btn btn--xs btn--ghost">↗</router-link>
          </div>

          <div class="route-table__row route-table__row--protected">
            <code class="route-table__path">/dashboard</code>
            <span class="badge badge--protected">Protected</span>
            <span class="route-table__guard route-table__guard--auth">requiresAuth</span>
            <router-link to="/dashboard" class="btn btn--xs btn--solid">Test →</router-link>
          </div>

          <div class="route-table__row route-table__row--protected">
            <code class="route-table__path">/tasks</code>
            <span class="badge badge--protected">Protected</span>
            <span class="route-table__guard route-table__guard--auth">requiresAuth</span>
            <router-link to="/tasks" class="btn btn--xs btn--solid">Test →</router-link>
          </div>

          <div class="route-table__row route-table__row--protected">
            <code class="route-table__path">/cart</code>
            <span class="badge badge--protected">Protected</span>
            <span class="route-table__guard route-table__guard--auth">requiresAuth</span>
            <router-link to="/cart" class="btn btn--xs btn--solid">Test →</router-link>
          </div>

          <div class="route-table__row route-table__row--protected">
            <code class="route-table__path">/profile</code>
            <span class="badge badge--protected">Protected</span>
            <span class="route-table__guard route-table__guard--auth">requiresAuth</span>
            <router-link to="/profile" class="btn btn--xs btn--solid">Test →</router-link>
          </div>

          <div class="route-table__row">
            <code class="route-table__path">/:unknown</code>
            <span class="badge badge--dim">Catch-All</span>
            <span class="route-table__guard route-table__guard--none">→ /404</span>
            <router-link to="/sehife-yoxdur" class="btn btn--xs btn--ghost">↗</router-link>
          </div>
        </div>
      </div>

    </section>
  `
};
