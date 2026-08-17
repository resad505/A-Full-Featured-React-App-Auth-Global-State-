import { authStore } from '../../features/auth/authStore.js';
import { isTokenExpired } from '../utils/token.js';
import { router } from '../../router/index.js';

/**
 * Mock API Client with Request & Response Interceptors + CRUD Operations
 * Implements Checkpoint 5: Mock CRUD against API with Optimistic UI & Rollback simulation
 */

class ApiClient {
  constructor() {
    this.isHandling401 = false;
    // Simulation controls for evaluator / reviewer
    this.forceFailure = false;
    this.randomFailureRate = 0.15; // 15% random failure rate when enabled
    this.simulateRandomFailures = false;
  }

  /**
   * Toggles forced failure for next API CRUD requests (for easy testing of Optimistic UI rollback)
   */
  setForceFailure(val) {
    this.forceFailure = !!val;
  }

  setRandomFailures(val) {
    this.simulateRandomFailures = !!val;
  }

  /**
   * Request interceptor - adds Authorization header and checks local token validity
   */
  _prepareRequest(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = authStore.state.token;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return {
      endpoint,
      options: { ...options, headers }
    };
  }

  /**
   * Response interceptor - handles 401 errors gracefully
   */
  _handleResponseError(errorStatus, endpoint) {
    if (errorStatus === 401) {
      console.warn(`[API Interceptor] 401 Unauthorized detected on ${endpoint}`);

      // Avoid infinite loop if multiple parallel requests fail
      if (!this.isHandling401) {
        this.isHandling401 = true;
        
        const currentPath = router?.currentRoute?.value?.fullPath || '/dashboard';
        
        // Clean all state
        authStore.logout('🔒 Sessiyanızın vaxtı bitdi (401 Unauthorized). Zəhmət olmasa yenidən daxil olun.');

        // Graceful redirect to login preserving intent
        if (router && router.currentRoute?.value?.path !== '/login') {
          router.push({
            path: '/login',
            query: { 
              redirect: currentPath,
              reason: '401_expired' 
            }
          }).finally(() => {
            this.isHandling401 = false;
          });
        } else {
          this.isHandling401 = false;
        }
      }

      return {
        status: 401,
        ok: false,
        error: 'Unauthorized: Token is invalid or has expired.'
      };
    }

    return {
      status: errorStatus,
      ok: false,
      error: `Request failed with status ${errorStatus}`
    };
  }

  /**
   * Simulated API fetch method with latency & token inspection
   */
  async request(endpoint, options = {}) {
    const { headers } = this._prepareRequest(endpoint, options);
    
    // Simulate realistic network latency (250-400ms)
    const latency = 250 + Math.floor(Math.random() * 150);
    await new Promise(res => setTimeout(res, latency));

    const authHeader = headers['Authorization'];
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    const requiresAuth = options.requiresAuth !== false;

    // Evaluate token validity for authenticated endpoints
    if (requiresAuth && (!token || isTokenExpired(token))) {
      return this._handleResponseError(401, endpoint);
    }

    // Check forced or simulated network failure
    const shouldFail = this.forceFailure || (this.simulateRandomFailures && Math.random() < this.randomFailureRate);
    if (shouldFail) {
      return {
        status: 500,
        ok: false,
        error: 'Server 500: Xəta baş verdi (Simulyasiya edilmiş şəbəkə/server xətası).'
      };
    }

    // Mock successful endpoints
    if (endpoint === '/api/user/profile') {
      return {
        status: 200,
        ok: true,
        data: {
          ...authStore.state.user,
          lastActivity: new Date().toISOString(),
          permissions: ['dashboard:read', 'tasks:all', 'profile:manage']
        }
      };
    }

    if (endpoint === '/api/dashboard/metrics') {
      return {
        status: 200,
        ok: true,
        data: {
          activeTasks: 14,
          cartItems: 3,
          guardStatus: 'Active',
          lastSync: new Date().toLocaleTimeString()
        }
      };
    }

    return {
      status: 200,
      ok: true,
      data: { success: true, message: 'Mock response OK' }
    };
  }

  /**
   * Dedicated action to explicitly trigger 401 error test
   */
  async simulate401Error() {
    await new Promise(res => setTimeout(res, 150));
    return this._handleResponseError(401, '/api/protected/resource');
  }

  async getProfile() {
    return this.request('/api/user/profile');
  }

  async getDashboardMetrics() {
    return this.request('/api/dashboard/metrics');
  }

  // ════════════════════════════════════════════════════════════════════
  // CHECKPOINT 5: Real CRUD API Methods for Tasks & Cart
  // ════════════════════════════════════════════════════════════════════

  /**
   * POST /api/tasks (Create Task)
   */
  async createTask(taskData) {
    const res = await this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
    if (!res.ok) return res;

    return {
      status: 201,
      ok: true,
      data: {
        id: Date.now(),
        ...taskData,
        serverSynced: true,
        syncedAt: new Date().toLocaleTimeString()
      }
    };
  }

  /**
   * PATCH /api/tasks/:id (Update / Toggle Task)
   */
  async updateTask(id, patch) {
    const res = await this.request(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch)
    });
    if (!res.ok) return res;

    return {
      status: 200,
      ok: true,
      data: { id, ...patch, serverSynced: true }
    };
  }

  /**
   * DELETE /api/tasks/:id (Delete Task)
   */
  async deleteTask(id) {
    const res = await this.request(`/api/tasks/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) return res;

    return {
      status: 200,
      ok: true,
      data: { id, deleted: true }
    };
  }

  /**
   * POST /api/cart/items (Add to Cart)
   * Public / Guest compatible: guest cart operates locally without 401 redirects
   */
  async addToCart(item) {
    const res = await this.request('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify(item),
      requiresAuth: false
    });
    if (!res.ok) return res;

    return {
      status: 201,
      ok: true,
      data: { ...item, serverSynced: !!authStore.state.token, localGuest: !authStore.state.token }
    };
  }

  /**
   * DELETE /api/cart/items/:id (Remove from Cart)
   */
  async removeFromCart(id) {
    const res = await this.request(`/api/cart/items/${id}`, {
      method: 'DELETE',
      requiresAuth: false
    });
    if (!res.ok) return res;

    return {
      status: 200,
      ok: true,
      data: { id, removed: true }
    };
  }

  /**
   * PATCH /api/cart/items/:id (Update Cart Quantity)
   */
  async updateCartQty(id, qty) {
    const res = await this.request(`/api/cart/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ qty }),
      requiresAuth: false
    });
    if (!res.ok) return res;

    return {
      status: 200,
      ok: true,
      data: { id, qty, serverSynced: !!authStore.state.token, localGuest: !authStore.state.token }
    };
  }
}

export const apiClient = new ApiClient();
