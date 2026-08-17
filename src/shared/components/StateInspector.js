import { ref, computed } from 'vue';
import { globalStore } from '../state/index.js';

export const StateInspector = {
  name: 'StateInspector',
  setup() {
    const isOpen = ref(false);
    const activeTab = ref('tree'); // 'tree' | 'actions' | 'dispatch'
    const customType = ref('cart/addItem');
    const customPayload = ref('{\n  "id": 99,\n  "name": "Custom Addon",\n  "price": 19\n}');

    const stateTree = computed(() => globalStore.getState());
    const actionHistory = computed(() => globalStore.actionHistory.value);

    const toggleOpen = () => {
      isOpen.value = !isOpen.value;
    };

    const handleCustomDispatch = () => {
      try {
        const payload = customPayload.value.trim() ? JSON.parse(customPayload.value) : undefined;
        globalStore.dispatch({
          type: customType.value.trim(),
          payload
        });
      } catch (err) {
        alert('Invalid JSON Payload: ' + err.message);
      }
    };

    const runQuickAction = (type, payload) => {
      globalStore.dispatch({ type, payload });
    };

    const clearHistory = () => {
      globalStore.clearActionHistory();
    };

    return {
      isOpen,
      activeTab,
      customType,
      customPayload,
      stateTree,
      actionHistory,
      toggleOpen,
      handleCustomDispatch,
      runQuickAction,
      clearHistory
    };
  },
  template: `
    <aside class="state-inspector" :class="{ 'state-inspector--open': isOpen }">
      <!-- Toggle button attached to bottom right -->
      <button class="state-inspector__toggle" @click="toggleOpen" title="Toggle State Inspector DevTools">
        <span class="state-inspector__toggle-icon">⚡</span>
        <span class="state-inspector__toggle-text">Redux State DevTools</span>
        <span class="state-inspector__toggle-count">{{ actionHistory.length }}</span>
      </button>

      <!-- Panel Content -->
      <div class="state-inspector__panel" v-if="isOpen">
        <div class="state-inspector__top">
          <div class="state-inspector__title-row">
            <h3 class="state-inspector__title">Global State & Dispatch Inspector</h3>
            <span class="badge badge--info">Context / Redux Pattern</span>
          </div>
          <button class="state-inspector__close" @click="toggleOpen">✕</button>
        </div>

        <!-- Quick actions toolbar -->
        <div class="state-inspector__quick-actions">
          <span class="state-inspector__quick-label">Sürətli Dispatch:</span>
          <div class="state-inspector__quick-btns">
            <button 
              class="demo-btn" 
              @click="runQuickAction('cart/addItem', { id: 101, name: 'AI Code Reviewer', price: 59, icon: '🤖', category: 'AI' })"
            >
              + AI Reviewer ($59)
            </button>
            <button 
              class="demo-btn" 
              @click="runQuickAction('cart/applyCoupon', 'FLIN2026')"
            >
              Promo "FLIN2026"
            </button>
            <button 
              class="demo-btn" 
              @click="runQuickAction('tasks/addTask', { title: 'State Inspector yoxlanışı tamamlandı', priority: 'High', category: 'DevTools' })"
            >
              + Yeni Tapşırıq
            </button>
            <button 
              class="demo-btn" 
              @click="runQuickAction('tasks/testStaleClosure')"
            >
              Stale Closure Testi
            </button>
          </div>
        </div>

        <!-- Navigation tabs -->
        <div class="state-inspector__tabs">
          <button 
            class="state-inspector__tab" 
            :class="{ 'state-inspector__tab--active': activeTab === 'tree' }"
            @click="activeTab = 'tree'"
          >
            State Tree
          </button>
          <button 
            class="state-inspector__tab" 
            :class="{ 'state-inspector__tab--active': activeTab === 'actions' }"
            @click="activeTab = 'actions'"
          >
            Action Log ({{ actionHistory.length }})
          </button>
          <button 
            class="state-inspector__tab" 
            :class="{ 'state-inspector__tab--active': activeTab === 'dispatch' }"
            @click="activeTab = 'dispatch'"
          >
            Manual Dispatch
          </button>
        </div>

        <!-- Tab 1: State Tree View -->
        <div class="state-inspector__tab-body" v-if="activeTab === 'tree'">
          <pre class="state-inspector__code">{{ JSON.stringify(stateTree, null, 2) }}</pre>
        </div>

        <!-- Tab 2: Action History Log -->
        <div class="state-inspector__tab-body" v-if="activeTab === 'actions'">
          <div class="state-inspector__actions-header">
            <span class="state-inspector__sub-label">Dispatched Actions Stream:</span>
            <button class="btn btn--xs btn--ghost" @click="clearHistory">Təmizlə</button>
          </div>

          <div class="action-log-list" v-if="actionHistory.length">
            <div v-for="item in actionHistory" :key="item.id" class="action-log-item">
              <div class="action-log-item__header">
                <span class="action-log-item__type">{{ item.action.type }}</span>
                <span class="action-log-item__time">{{ item.timestamp }}</span>
              </div>
              <pre class="action-log-item__payload" v-if="item.action.payload">{{ JSON.stringify(item.action.payload, null, 2) }}</pre>
            </div>
          </div>
          <p v-else class="state-inspector__empty">Hələlik heç bir action dispatch olunmayıb.</p>
        </div>

        <!-- Tab 3: Manual Action Dispatcher -->
        <div class="state-inspector__tab-body" v-if="activeTab === 'dispatch'">
          <div class="auth-form__group">
            <label class="auth-form__label">Action Type (məs: cart/addItem, tasks/addTask)</label>
            <input v-model="customType" type="text" class="auth-form__input" />
          </div>
          <div class="auth-form__group">
            <label class="auth-form__label">Payload JSON</label>
            <textarea v-model="customPayload" class="auth-form__input" rows="4" style="font-family: var(--font-mono); font-size: 0.78rem;"></textarea>
          </div>
          <button class="btn btn--solid btn--block btn--sm" @click="handleCustomDispatch">
            Dispatch Action →
          </button>
        </div>
      </div>
    </aside>
  `
};
