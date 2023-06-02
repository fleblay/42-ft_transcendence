import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { checker } from 'vite-plugin-checker'

// https://vitejs.dev/config/
export default defineConfig({
	base: new URL(process.env.PUBLIC_URL).pathname === '/' ? '' : new URL(process.env.PUBLIC_URL).pathname,
	plugins: [
		react(),
		checker({
			typescript: true
		})
	],
	server: {
		/*
		https: {
			key: readFileSync('/etc/letsencrypt/live/leblay.dev/privkey.pem'),
			cert: readFileSync('/etc/letsencrypt/live/leblay.dev/fullchain.pem')
		},
		*/
		host: true,
		port: 4243,
	},
	build: {
		sourcemap: true,
	},
})
