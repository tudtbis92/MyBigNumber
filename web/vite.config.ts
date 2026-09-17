import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Cho phep import loi dung chung src/MyBigNumber.ts o ngoai web/
      allow: ['..'],
    },
  },
})
