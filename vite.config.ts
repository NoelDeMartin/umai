import { defineConfig } from 'vite';
import { resolve } from 'path';
import ViteComponents from 'vite-plugin-components';
import ViteIcons, { ViteIconsResolver } from 'vite-plugin-icons';
import Vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [
        Vue(),
        ViteComponents({
            customComponentResolvers: ViteIconsResolver(),
        }),
        ViteIcons(),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
});
