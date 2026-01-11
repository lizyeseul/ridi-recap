import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    minify: false,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  esbuild: {
    keepNames: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),   // src 를 @ 로 alias
    },
  },
  // server: {
  //   proxy: {
  //     "/base_url": {
  //       target: "https://ridibooks.com",
  //       changeOrigin: true,
  //       secure: true,
  //       rewrite: (path) => path.replace(/^\/base_url/, ''),
  //     },
  //     "/library_api": {
  //       target: "https://library-api.ridibooks.com/",
  //       changeOrigin: true,
  //       secure: true,
  //       rewrite: (path) => path.replace(/^\/library_api/, ''),
  //     },
  //     "/book_api": {
  //       target: "https://book-api.ridibooks.com/",
  //       changeOrigin: true,
  //       secure: true,
  //       rewrite: (path) => path.replace(/^\/book_api/, ''),
  //     }
  //   },
  // }
})

/*export const URL = {
	"base": "https://ridibooks.com",
	"LIBRARY_BASE": "https://library-api.ridibooks.com/",
	"BOOK_API_BASE": "https://book-api.ridibooks.com/"
};*/
