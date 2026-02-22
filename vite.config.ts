import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base:'/orbital-pursuit2/',// 必须和你的仓库名 orbital-pursuit 一致
  })