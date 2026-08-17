import { ref } from 'vue';

export const CartView = {
  name: 'CartView',
  setup() {
    const cartItems = ref([
      { id: 1, title: 'Cloud Server Pro (1 İl)', price: '$348.00', qty: 1, icon: '⚡' },
      { id: 2, title: 'Vue 3 UI Kit License', price: '$49.00', qty: 1, icon: '⬡' }
    ]);
    return { cartItems };
  },
  template: `
    <section class="cart-view">
      <div class="view-top">
        <h1 class="view-top__title">Səbət</h1>
        <p class="view-top__sub">Qorunan bölmə.</p>
      </div>

      <div class="cart-layout">
        <div class="cart-items">
          <div v-for="item in cartItems" :key="item.id" class="cart-item">
            <span class="cart-item__icon">{{ item.icon }}</span>
            <div class="cart-item__info">
              <p class="cart-item__name">{{ item.title }}</p>
              <p class="cart-item__qty">{{ item.qty }} ədəd</p>
            </div>
            <span class="cart-item__price">{{ item.price }}</span>
          </div>
        </div>

        <div class="cart-summary">
          <div class="cart-summary__row">
            <span>Cəmi</span>
            <strong>$397.00</strong>
          </div>
          <button class="btn btn--solid btn--block btn--md">Ödənişə Keç →</button>
        </div>
      </div>
    </section>
  `
};
