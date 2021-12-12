const colors = require('tailwindcss/colors');

module.exports = {
    content: [
        './index.html',
        './src/**/*.{vue,ts}',

        // TODO only in storybook env
        './.storybook/stories/**/*.ts',
    ],
    theme: {
        extend: {
            colors: {
                // TODO branding
                'primary': colors.lime,
                'dark-overlay': 'rgba(0,0,0,.5)',
                'brand-solid': {
                    500: '#7c4dff',
                    700: '#653add',
                },
            },
            margin: theme => ({
                edge: theme('spacing.8'),
            }),
            width: {
                clickable: '42px',
            },
            height: {
                clickable: '42px',
            },
            maxWidth: {
                content: '1280px',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};
