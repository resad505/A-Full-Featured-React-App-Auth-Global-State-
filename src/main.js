import { createApp } from 'vue';
import { router } from './router/index.js';
import { AppHeader } from './shared/components/AppHeader.js';
import { RouteBanner } from './shared/components/RouteBanner.js';
import { AppFooter } from './shared/components/AppFooter.js';
import { ToastContainer } from './shared/components/ToastContainer.js';
import { StateInspector } from './shared/components/StateInspector.js';
import { ErrorBoundary } from './shared/components/ErrorBoundary.js';
import { toastSlice } from './shared/state/slices/toastSlice.js';

const App = {
  name: 'App',
  components: {
    AppHeader,
    RouteBanner,
    AppFooter,
    ToastContainer,
    StateInspector,
    ErrorBoundary
  },
  template: `
    <div class="app-layout">
      <!-- Global notification toasts -->
      <ToastContainer />

      <AppHeader />
      <RouteBanner />
      
      <main class="app-main">
        <div class="app-main__container">
          <ErrorBoundary name="Əsas Səhifə Marşrutu">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </ErrorBoundary>
        </div>
      </main>
      
      <!-- Global Redux DevTools State Inspector -->
      <StateInspector />

      <AppFooter />
    </div>
  `
};

const app = createApp(App);
app.use(router);

// ══════════════════════════════════════════════════════════════════════
// CHECKPOINT 6: Global Vue Error Handler (Application never crashes)
// ══════════════════════════════════════════════════════════════════════
app.config.errorHandler = (err, instance, info) => {
  console.error('[Global Vue ErrorHandler Caught]:', err, info);
  
  toastSlice.addToast(
    `🚨 [Qlobal Error Handler]: ${err?.message || 'Gözlənilməz xəta baş verdi.'} (Tətbiq çökmədi)`,
    'danger',
    6000
  );
};

app.mount('#app');
