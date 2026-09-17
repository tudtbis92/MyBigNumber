import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Cho phép import lõi dùng chung src/MyBigNumber.ts ở ngoài web/
      allow: ['..'],
    },
  },
})
