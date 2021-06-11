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
                'src/assets/icons',
                'src/components',
                'src/routing/pages',
            ],
            deep: true,
        }),
        ViteIcons(),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@webpack': resolve(__dirname, './webpack/dist'),
            '/src/main.ts': process.env.NODE_ENV === 'testing'
                ? '/src/main.testing.ts'
                : '/src/main.ts',
        },
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                404: resolve(__dirname, '404.html'),
            },
        },
        terserOptions: {
            keep_classnames: /Error$/,
            keep_fnames: /Error$/,
        },
    },
});
