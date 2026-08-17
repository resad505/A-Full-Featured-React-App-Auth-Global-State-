import { ref, computed } from 'vue';
import { globalStore } from '../../shared/state/index.js';
import { cartSlice } from './cartSlice.js';
import { toastSlice } from '../../shared/state/slices/toastSlice.js';

export const CartView = {
  name: 'CartView',
  setup() {
    const inputCoupon = ref('');
    const isCheckingOut = ref(false);

    const items = computed(() => cartSlice.items.value);
    const itemCount = computed(() => cartSlice.itemCount.value);
    const subtotal = computed(() => cartSlice.subtotal.value);
    const discountAmount = computed(() => cartSlice.discountAmount.value);
    const taxAmount = computed(() => cartSlice.taxAmount.value);
    const grandTotal = computed(() => cartSlice.grandTotal.value);
    const coupon = computed(() => cartSlice.coupon.value);

    const handleQtyChange = (id, currentQty, delta) => {
      globalStore.dispatch({
        type: 'cart/updateQuantity',
        payload: { id, qty: currentQty + delta }
      });
    };

    const handleRemove = (id) => {
      globalStore.dispatch({
        type: 'cart/removeItem',
        payload: id
      });
    };

    const handleApplyCoupon = () => {
      if (!inputCoupon.value.trim()) return;
      globalStore.dispatch({
        type: 'cart/applyCoupon',
        payload: inputCoupon.value
      });
      inputCoupon.value = '';
    };

    const handleRemoveCoupon = () => {
      globalStore.dispatch({
        type: 'cart/removeCoupon'
      });
    };

    const handleClearCart = () => {
      globalStore.dispatch({
        type: 'cart/clearCart'
      });
    };

    const handleCheckout = () => {
      if (items.value.length === 0) return;
      isCheckingOut.value = true;
      setTimeout(() => {
        isCheckingOut.value = false;
        toastSlice.addToast('🎉 Sifarişiniz uğurla qəbul edildi! Çek nömrəsi: #FLIN-' + Math.floor(100000 + Math.random() * 900000), 'success', 5000);
        globalStore.dispatch({ type: 'cart/clearCart' });
      }, 750);
    };

    return {
      inputCoupon,
      isCheckingOut,
      items,
      itemCount,
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal,
      coupon,
      handleQtyChange,
      handleRemove,
      handleApplyCoupon,
      handleRemoveCoupon,
      handleClearCart,
      handleCheckout
    };
  },
  template: `
    <section class="cart-view">
      <div class="view-top">
        <div class="view-top__left">
          <div class="view-top__badge">
            <span class="pulse-dot"></span>
            <span>Qorunan Bölmə · Redux/Context Cart Slice</span>
          </div>
          <h1 class="view-top__title">Səbət və Ödəniş</h1>
          <p class="view-top__sub">
            Reaktiv qlobal səbət vəziyyəti, kəmiyyət hesablamaları, vergi və promo kod sistemi.
          </p>
        </div>

        <button 
          v-if="items.length > 0"
          class="btn btn--danger-ghost btn--sm" 
          @click="handleClearCart"
        >
          Səbəti Təmizlə
        </button>
      </div>

      <div class="cart-layout" v-if="items.length > 0">
        <!-- Items List Column -->
        <div class="cart-items">
          <div v-for="item in items" :key="item.id" class="cart-card">
            <span class="cart-card__icon">{{ item.icon }}</span>
            
            <div class="cart-card__info">
              <span class="badge badge--dim">{{ item.category }}</span>
              <h3 class="cart-card__name">{{ item.title }}</h3>
              <span class="cart-card__unit-price">&dollar;{{ item.numericPrice }}.00 / ədəd</span>
            </div>

            <!-- Quantity controls -->
            <div class="cart-qty-ctrl">
              <button 
                class="cart-qty-btn" 
                @click="handleQtyChange(item.id, item.qty, -1)"
                title="Azalt"
              >
                -
              </button>
              <span class="cart-qty-val">{{ item.qty }}</span>
              <button 
                class="cart-qty-btn" 
                @click="handleQtyChange(item.id, item.qty, 1)"
                title="Artır"
              >
                +
              </button>
            </div>

            <!-- Item total price -->
            <div class="cart-card__price-col">
              <span class="cart-card__price">&dollar;{{ item.numericPrice * item.qty }}.00</span>
              <button class="cart-card__del" @click="handleRemove(item.id)" title="Sil">
                Sil ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Summary & Coupon Column -->
        <div class="cart-sidebar">
          <!-- Coupon card -->
          <div class="coupon-card">
            <h4 class="coupon-card__title">Promo Kod</h4>
            <div v-if="!coupon.isApplied" class="coupon-form">
              <div class="coupon-form__row">
                <input 
                  v-model="inputCoupon" 
                  type="text" 
                  placeholder="məs: FLIN2026" 
                  class="coupon-form__input" 
                />
                <button class="btn btn--solid btn--sm" @click="handleApplyCoupon">
                  Tətbiq Et
                </button>
              </div>
              <div class="coupon-hint">
                <span>İpucu: 15% endirim üçün <code>FLIN2026</code> yazın.</span>
              </div>
            </div>

            <div v-else class="coupon-applied">
              <div class="coupon-applied__info">
                <span class="badge badge--success">✓ {{ coupon.code }}</span>
                <span class="coupon-applied__val">-{{ coupon.percent }}% Endirim</span>
              </div>
              <button class="coupon-applied__del" @click="handleRemoveCoupon">Ləğv et</button>
            </div>
          </div>

          <!-- Checkout Summary -->
          <div class="cart-summary">
            <h3 class="cart-summary__title">Hesab Fakturası</h3>

            <div class="cart-summary__list">
              <div class="cart-summary__row">
                <span>Məhsulların Qiyməti ({{ itemCount }} ədəd)</span>
                <span>&dollar;{{ subtotal.toFixed(2) }}</span>
              </div>

              <div class="cart-summary__row cart-summary__row--discount" v-if="discountAmount > 0">
                <span>Promo Endirim ({{ coupon.percent }}%)</span>
                <span>-&dollar;{{ discountAmount.toFixed(2) }}</span>
              </div>

              <div class="cart-summary__row">
                <span>ƏDV / Vergi (18%)</span>
                <span>&dollar;{{ taxAmount.toFixed(2) }}</span>
              </div>

              <div class="cart-summary__divider"></div>

              <div class="cart-summary__row cart-summary__row--total">
                <span>Yekun Məbləğ</span>
                <strong class="cart-summary__total-val">&dollar;{{ grandTotal.toFixed(2) }}</strong>
              </div>
            </div>

            <button 
              class="btn btn--solid btn--block btn--md cart-summary__checkout"
              :disabled="isCheckingOut"
              @click="handleCheckout"
            >
              <span v-if="isCheckingOut" class="spinner"></span>
              <span>{{ isCheckingOut ? 'Ödənilir...' : 'Sifarişi Təsdiqlə →' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="cart-empty">
        <div class="cart-empty__icon">🛒</div>
        <h2 class="cart-empty__title">Səbətiniz boşdur</h2>
        <p class="cart-empty__desc">
          Kataloqdan ehtiyacınız olan xidmətləri və komponentləri seçib səbətə əlavə edə bilərsiniz.
        </p>
        <router-link to="/catalog" class="btn btn--solid btn--md">
          Məhsul Kataloquna Keç →
        </router-link>
      </div>
    </section>
  `
};
