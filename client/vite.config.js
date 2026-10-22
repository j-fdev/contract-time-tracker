import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_URL = 'http://localhost:5000';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        // Same-origin requests in development: the session cookie just works, no CORS needed.
        proxy: {
            '/api': { target: API_URL, changeOrigin: true },
            '/socket.io': { target: API_URL, changeOrigin: true, ws: true },
        },
    },
});
