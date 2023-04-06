import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {readFileSync} from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
	base: '/',
	plugins: [react()],
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
	}
})
