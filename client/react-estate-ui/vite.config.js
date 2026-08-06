import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Keep whatever react import worked for you

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        // 🚀 This line completely blocks the legacy API warning from spamming your terminal
        silenceDeprecations: ['legacy-js-api'], 
      },
    },
  },
});
