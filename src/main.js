import { createApp } from 'vue';
import { router } from './router/index.js';
import { AppHeader } from './components/AppHeader.js';
import { RouteBanner } from './components/RouteBanner.js';
import { AppFooter } from './components/AppFooter.js';
import { ToastContainer } from './components/ToastContainer.js';
import { StateInspector } from './components/StateInspector.js';

const App = {
  name: 'App',
  components: {
    AppHeader,
    RouteBanner,
    AppFooter,
    ToastContainer,
    StateInspector
  },
  template: `
    <div class="app-layout">
      <!-- Global notification toasts -->
      <ToastContainer />

      <AppHeader />
      <RouteBanner />
      
      <main class="app-main">
        <div class="app-main__container">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
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
app.mount('#app');
