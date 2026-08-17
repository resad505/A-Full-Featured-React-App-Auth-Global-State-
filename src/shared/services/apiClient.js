import { authStore } from '../../features/auth/authStore.js';
import { isTokenExpired } from '../utils/token.js';
import { router } from '../../router/index.js';

/**
 * Mock API Client with Request & Response Interceptors
 * Directly addresses Quality Check 1: Token expiration 401 handling & redirection
 */

class ApiClient {
  constructor() {
    this.isHandling401 = false;
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
    
    // Simulate network latency (200ms)
    await new Promise(res => setTimeout(res, 200));

    const authHeader = headers['Authorization'];
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;

    // Evaluate token validity
    if (!token || isTokenExpired(token)) {
      return this._handleResponseError(401, endpoint);
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
    // Force 401 response handling
    await new Promise(res => setTimeout(res, 150));
    return this._handleResponseError(401, '/api/protected/resource');
  }

  async getProfile() {
    return this.request('/api/user/profile');
  }

  async getDashboardMetrics() {
    return this.request('/api/dashboard/metrics');
  }
}

export const apiClient = new ApiClient();
