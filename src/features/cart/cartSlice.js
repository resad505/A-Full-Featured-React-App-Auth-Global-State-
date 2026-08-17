import { reactive, computed } from 'vue';
import { toastSlice } from '../../shared/state/slices/toastSlice.js';
import { apiClient } from '../../shared/services/apiClient.js';

const STORAGE_KEY = 'flin_cart_state';

const defaultItems = [
  {
    id: 1,
    title: 'Cloud Server Pro (1 İl)',
    price: '$348.00',
    numericPrice: 348,
    qty: 1,
    icon: '⚡',
    category: 'DevOps'
  },
  {
    id: 2,
    title: 'Vue 3 UI Kit License',
    price: '$49.00',
    numericPrice: 49,
    qty: 1,
    icon: '⬡',
    category: 'Frontend'
  }
];

function loadSavedCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.items)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Cart] Error loading storage:', err);
  }
  return {
    items: defaultItems,
    couponCode: '',
    discountPercent: 0,
    isCouponApplied: false
  };
}

const saved = loadSavedCart();

const state = reactive({
  items: saved.items || defaultItems,
  couponCode: saved.couponCode || '',
  discountPercent: saved.discountPercent || 0,
  isCouponApplied: !!saved.isCouponApplied,
  taxRate: 0.18, // 18% Tax
  pendingCartSyncs: 0
});

function persistCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      items: state.items,
      couponCode: state.couponCode,
      discountPercent: state.discountPercent,
      isCouponApplied: state.isCouponApplied
    }));
  } catch (e) {
    console.warn('[Cart] Persist failed:', e);
  }
}

export const cartSlice = {
  state,

  items: computed(() => state.items),
  
  itemCount: computed(() => {
    return state.items.reduce((total, item) => total + (item.qty || 1), 0);
  }),

  subtotal: computed(() => {
    return state.items.reduce((sum, item) => sum + (item.numericPrice * (item.qty || 1)), 0);
  }),

  discountAmount: computed(() => {
    if (!state.isCouponApplied || state.discountPercent <= 0) return 0;
    const sub = state.items.reduce((sum, item) => sum + (item.numericPrice * (item.qty || 1)), 0);
    return Math.round((sub * (state.discountPercent / 100)) * 100) / 100;
  }),

  taxAmount: computed(() => {
    const sub = state.items.reduce((sum, item) => sum + (item.numericPrice * (item.qty || 1)), 0);
    const discounted = sub - (state.isCouponApplied ? sub * (state.discountPercent / 100) : 0);
    return Math.round((discounted * state.taxRate) * 100) / 100;
  }),

  grandTotal: computed(() => {
    const sub = state.items.reduce((sum, item) => sum + (item.numericPrice * (item.qty || 1)), 0);
    const discount = state.isCouponApplied ? sub * (state.discountPercent / 100) : 0;
    const taxable = sub - discount;
    const tax = taxable * state.taxRate;
    return Math.max(0, Math.round((taxable + tax) * 100) / 100);
  }),

  coupon: computed(() => ({
    code: state.couponCode,
    percent: state.discountPercent,
    isApplied: state.isCouponApplied
  })),

  pendingCartSyncs: computed(() => state.pendingCartSyncs),

  /**
   * Action: Add item to cart with Optimistic UI & Rollback
   */
  async addItem(product) {
    const title = product.name || product.title;
    const existing = state.items.find(i => i.id === product.id);
    const wasExisting = !!existing;
    const previousQty = existing ? existing.qty : 0;

    // 1. [OPTIMISTIC] Immediately update cart in UI
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
      toastSlice.addToast(`[Optimistic] "${title}" sayı artırıldı (${existing.qty})`, 'info', 1500);
    } else {
      const priceNum = typeof product.price === 'number' 
        ? product.price 
        : parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 29;

      state.items.push({
        id: product.id,
        title,
        price: typeof product.price === 'string' ? product.price : `$${priceNum}.00`,
        numericPrice: priceNum,
        qty: 1,
        icon: product.icon || '📦',
        category: product.category || 'Service'
      });
      toastSlice.addToast(`[Optimistic] "${title}" səbətə əlavə edildi!`, 'success', 2000);
    }
    persistCart();
    state.pendingCartSyncs++;

    // 2. Call Mock API
    const response = await apiClient.addToCart(product);
    state.pendingCartSyncs = Math.max(0, state.pendingCartSyncs - 1);

    // 3. Confirm or Rollback
    if (response.ok) {
      // Confirmed
    } else {
      // [ROLLBACK] Revert change
      if (wasExisting) {
        const item = state.items.find(i => i.id === product.id);
        if (item) item.qty = previousQty;
      } else {
        const idx = state.items.findIndex(i => i.id === product.id);
        if (idx !== -1) state.items.splice(idx, 1);
      }
      persistCart();
      toastSlice.addToast(`❌ [Rollback] Səbət sinxronizasiyası xətası! "${title}" əməliyyatı ləğv edildi.`, 'danger', 4500);
    }
  },

  /**
   * Action: Remove item from cart with Optimistic UI & Rollback
   */
  async removeItem(id) {
    const idx = state.items.findIndex(i => i.id === id);
    if (idx === -1) return;

    const [removed] = state.items.splice(idx, 1);
    toastSlice.addToast(`[Optimistic] "${removed.title}" səbətdən silindi.`, 'warning', 2000);
    persistCart();
    state.pendingCartSyncs++;

    // Call Mock API
    const response = await apiClient.removeFromCart(id);
    state.pendingCartSyncs = Math.max(0, state.pendingCartSyncs - 1);

    if (!response.ok) {
      // [ROLLBACK] Restore item
      state.items.splice(idx, 0, removed);
      persistCart();
      toastSlice.addToast(`❌ [Rollback] Silinmə xətası! "${removed.title}" səbətə qaytarıldı.`, 'danger', 4500);
    }
  },

  /**
   * Action: Update quantity with Optimistic UI & Rollback
   */
  async updateQuantity(id, qty) {
    const item = state.items.find(i => i.id === id);
    if (!item) return;

    if (qty <= 0) {
      return this.removeItem(id);
    }

    const previousQty = item.qty;
    item.qty = Math.min(99, qty);
    persistCart();
    state.pendingCartSyncs++;

    // Call Mock API
    const response = await apiClient.updateCartQty(id, qty);
    state.pendingCartSyncs = Math.max(0, state.pendingCartSyncs - 1);

    if (!response.ok) {
      // [ROLLBACK] Restore previous qty
      item.qty = previousQty;
      persistCart();
      toastSlice.addToast(`❌ [Rollback] Say dəyişdirilmədi! Köhnə saya (${previousQty}) qaytarıldı.`, 'danger', 4000);
    }
  },

  /**
   * Action: Apply Coupon code
   */
  applyCoupon(code = '') {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'FLIN2026' || cleanCode === 'DISCOUNT15') {
      state.couponCode = cleanCode;
      state.discountPercent = 15;
      state.isCouponApplied = true;
      toastSlice.addToast(`Promo kod "${cleanCode}" tətbiq edildi! (15% Endirim)`, 'success');
      persistCart();
      return { success: true, message: 'Promo kod aktivləşdirildi (15% Endirim).' };
    } else if (cleanCode === 'DEVJOINT50') {
      state.couponCode = cleanCode;
      state.discountPercent = 50;
      state.isCouponApplied = true;
      toastSlice.addToast(`VIP Promo kod "${cleanCode}" tətbiq edildi! (50% Endirim)`, 'success');
      persistCart();
      return { success: true, message: 'VIP Promo kod aktivləşdirildi (50% Endirim).' };
    } else {
      toastSlice.addToast(`Promo kod "${cleanCode}" etibarsızdır.`, 'danger');
      return { success: false, message: 'Etibarsız promo kod. Test üçün "FLIN2026" istifadə edin.' };
    }
  },

  /**
   * Action: Remove coupon
   */
  removeCoupon() {
    state.couponCode = '';
    state.discountPercent = 0;
    state.isCouponApplied = false;
    toastSlice.addToast('Promo kod ləğv edildi.', 'info');
    persistCart();
  },

  /**
   * Action: Clear whole cart
   */
  clearCart() {
    state.items = [];
    state.couponCode = '';
    state.discountPercent = 0;
    state.isCouponApplied = false;
    persistCart();
    toastSlice.addToast('Səbət tamamilə təmizləndi.', 'info');
  }
};
