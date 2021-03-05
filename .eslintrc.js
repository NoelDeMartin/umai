module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        '@noeldemartin/eslint-config-typescript',
        'plugin:vue/vue3-recommended',
    ],
    rules: {
        'vue/html-indent': ['error', 4],
        'vue/max-attributes-per-line': ['error', { singleline: 3 }],
        'vue/max-len': ['error', {
            code: 120,
            ignoreHTMLAttributeValues: true,
        }],
        'max-len': 'off',
    },
};
