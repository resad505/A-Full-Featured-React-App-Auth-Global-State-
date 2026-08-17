import { createApp } from 'vue';
import { router } from './router/index.js';
import { AppHeader } from './components/AppHeader.js';
import { RouteBanner } from './components/RouteBanner.js';
import { AppFooter } from './components/AppFooter.js';

const App = {
  name: 'App',
  components: {
    AppHeader,
    RouteBanner,
    AppFooter
  },
  template: `
    <div class="app-layout">
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
      
      <AppFooter />
    </div>
  `
};

const app = createApp(App);
app.use(router);
app.mount('#app');
