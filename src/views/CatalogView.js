import { ref } from 'vue';

export const CatalogView = {
  name: 'CatalogView',
  setup() {
    const products = ref([
      { id: 1, name: 'Cloud Server Pro', category: 'DevOps', price: '$29/mo', desc: 'Yüksək performanslı bulud server instansı.', icon: '⚡' },
      { id: 2, name: 'Vue 3 UI Kit', category: 'Frontend', price: '$49', desc: 'BEM əsaslı komponentlər paketi.', icon: '⬡' },
      { id: 3, name: 'API Security Gateway', category: 'Security', price: '$89/mo', desc: 'Token və CORS mühafizəsi.', icon: '◈' },
      { id: 4, name: 'State Flow Visualizer', category: 'DevTools', price: '$19', desc: 'Reaktiv vəziyyətləri izləmə.', icon: '◎' }
    ]);
    return { products };
  },
  template: `
    <section class="catalog-view">
      <div class="view-top">
        <h1 class="view-top__title">Kataloq</h1>
        <p class="view-top__sub">İctimai bölmə — giriş tələb edilmir.</p>
      </div>

      <div class="catalog-grid">
        <div v-for="item in products" :key="item.id" class="catalog-card">
          <div class="catalog-card__icon">{{ item.icon }}</div>
          <div class="catalog-card__meta">{{ item.category }}</div>
          <h2 class="catalog-card__name">{{ item.name }}</h2>
          <p class="catalog-card__desc">{{ item.desc }}</p>
          <div class="catalog-card__footer">
            <span class="catalog-card__price">{{ item.price }}</span>
            <router-link to="/cart" class="btn btn--xs btn--solid">Əlavə Et →</router-link>
          </div>
        </div>
      </div>
    </section>
  `
};
