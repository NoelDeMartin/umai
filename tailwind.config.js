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
            margin: theme => ({
                edge: theme('spacing.8'),
            }),
            maxWidth: {
                content: '1280px',
            },
        },
    },
    plugins: [
        require('@tailwindcss/aspect-ratio'),
        require('@tailwindcss/typography'),
    ],
};
