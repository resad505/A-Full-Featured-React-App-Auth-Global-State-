import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js'
    }
  },
  server: {
    port: 3000,
    open: false
  }
});
