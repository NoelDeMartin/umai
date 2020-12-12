module.exports = {
    extends: [
        '@noeldemartin/eslint-config-typescript',
        'plugin:vue/vue3-recommended',
    ],
    rules: {
        'vue/html-indent': ['error', 4],
        'vue/max-attributes-per-line': ['error', { singleline: 3 }],
    },
    overrides: [
        {
            files: [
                'tailwind.config.js',
                'postcss.config.js',
                'babel.config.js',
            ],
            env: { node: true },
        },
    ],
};
