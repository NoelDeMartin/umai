import { defineConfig } from 'vite';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import SVG from 'vite-plugin-vue-svg';
import ViteComponents from 'vite-plugin-components';
import ViteIcons, { ViteIconsResolver } from 'vite-plugin-icons';
import Vue from '@vitejs/plugin-vue';

function componentsDirs(): string[] {
    const pages = readdirSync(resolve(__dirname, 'src/pages'));

    return [
        'src/components',
        'src/assets/icons',
        ...pages.map(page => `src/pages/${page}/components`),
    ];
}

export default defineConfig({
    plugins: [
        Vue(),
        SVG(),
        ViteComponents({
            extensions: ['vue', 'svg'],
            importPathTransform: path => path.endsWith('.svg') ? `${path}?component` : undefined,
            customComponentResolvers: ViteIconsResolver(),
            dirs: componentsDirs(),
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
