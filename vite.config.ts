import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), basicSsl()],
	server: {
		proxy: {
			'/signed-url/api': {
				target: 'https://lgubislig.app',
				changeOrigin: true,
				secure: false
			}
		},
		https: true,
		host: '0.0.0.0',
		port: 3457
	}
});
