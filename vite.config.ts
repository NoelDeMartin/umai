import { defineConfig } from 'vite';
import { resolve } from 'path';
import SVG from 'vite-plugin-vue-svg';
import ViteComponents from 'vite-plugin-components';
import ViteIcons, { ViteIconsResolver } from 'vite-plugin-icons';
import Vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [
        Vue(),
        SVG(),
        ViteComponents({
            extensions: ['vue', 'svg'],
            importPathTransform: path => path.endsWith('.svg') ? `${path}?component` : undefined,
            customComponentResolvers: ViteIconsResolver(),
            dirs: [
                'src/components',
                'src/pages',
                'src/assets/icons',
            ],
            deep: true,
        }),
        ViteIcons(),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    build: {
        terserOptions: {
            keep_classnames: /Error$/,
            keep_fnames: /Error$/,
        },
    },
});
