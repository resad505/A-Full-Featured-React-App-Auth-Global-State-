import { ref, computed } from 'vue';
import { globalStore } from '../../shared/state/index.js';
import { cartSlice } from '../cart/cartSlice.js';

export const CatalogView = {
  name: 'CatalogView',
  setup() {
    const products = ref([
      { id: 101, name: 'Cloud Server Pro', category: 'DevOps', price: '$29.00', numericPrice: 29, desc: 'Yüksək performanslı bulud server instansı.', icon: '⚡' },
      { id: 102, name: 'Vue 3 UI Kit License', category: 'Frontend', price: '$49.00', numericPrice: 49, desc: 'BEM əsaslı komponentlər paketi.', icon: '⬡' },
      { id: 103, name: 'API Security Gateway', category: 'Security', price: '$89.00', numericPrice: 89, desc: 'Token və CORS mühafizəsi xidməti.', icon: '◈' },
      { id: 104, name: 'State Flow Visualizer', category: 'DevTools', price: '$19.00', numericPrice: 19, desc: 'Reaktiv vəziyyətləri və Redux loglarını izləmə.', icon: '◎' },
      { id: 105, name: 'AI Architecture Reviewer', category: 'AI', price: '$59.00', numericPrice: 59, desc: 'Süni intellekt əsaslı kod audit köməkçisi.', icon: '🤖' },
      { id: 106, name: 'Enterprise DB Cluster', category: 'Database', price: '$149.00', numericPrice: 149, desc: 'Yüksək təhlükəsizlikli PostgreSQL klasteri.', icon: '🗄️' }
    ]);

    const cartItems = computed(() => cartSlice.items.value);

    const getItemQuantityInCart = (id) => {
      const found = cartItems.value.find(i => i.id === id);
      return found ? found.qty : 0;
    };

    const handleAddToCart = (product) => {
      globalStore.dispatch({
        type: 'cart/addItem',
        payload: {
          id: product.id,
          name: product.name,
          title: product.name,
          price: product.price,
          numericPrice: product.numericPrice,
          icon: product.icon,
          category: product.category
        }
      });
    };

    return {
      products,
      getItemQuantityInCart,
      handleAddToCart
    };
  },
  template: `
    <section class="catalog-view">
      <div class="view-top">
        <div class="view-top__left">
          <div class="view-top__badge">
            <span>İctimai Bölmə · Kataloq</span>
          </div>
          <h1 class="view-top__title">Məhsul və Xidmət Kataloqu</h1>
          <p class="view-top__sub">
            İstənilən məhsulu bir kliklə qlobal səbət vəziyyətinə (Global Cart State) əlavə edə bilərsiniz.
          </p>
        </div>

        <router-link to="/cart" class="btn btn--solid btn--sm">
          Səbətə Bax →
        </router-link>
      </div>

      <div class="catalog-grid">
        <div v-for="item in products" :key="item.id" class="catalog-card">
          <div class="catalog-card__top">
            <div class="catalog-card__icon">{{ item.icon }}</div>
            <span class="badge badge--dim">{{ item.category }}</span>
          </div>

          <h2 class="catalog-card__name">{{ item.name }}</h2>
          <p class="catalog-card__desc">{{ item.desc }}</p>

          <div class="catalog-card__footer">
            <span class="catalog-card__price">{{ item.price }}</span>
            
            <button 
              class="btn btn--sm" 
              :class="getItemQuantityInCart(item.id) > 0 ? 'btn--solid' : 'btn--ghost'"
              @click="handleAddToCart(item)"
            >
              <span v-if="getItemQuantityInCart(item.id) > 0">
                Səbətdə ({{ getItemQuantityInCart(item.id) }}) +
              </span>
              <span v-else>
                Səbətə Əlavə Et +
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  `
};
