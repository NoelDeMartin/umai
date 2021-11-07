const colors = require('tailwindcss/colors');

module.exports = {
    mode: 'jit',
    darkMode: false,
    purge: [
        './index.html',
        './src/**/*.{vue,ts}',

        // TODO only in storybook env
        './.storybook/stories/**/*.ts',
    ],
    theme: {
        extend: {
            colors: {
                // TODO branding
                'primary': colors.indigo,
                'dark-overlay': 'rgba(0,0,0,.5)',
            },
            maxWidth: {
                content: '900px',
            },
        },
    },
    plugins: [
        require('@tailwindcss/aspect-ratio'),
    ],
};
