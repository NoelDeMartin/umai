const colors = require('tailwindcss/colors');

module.exports = {
    content: [
        './index.html',
        './src/**/*.{vue,ts}',

        // TODO only in storybook env
        './.storybook/stories/**/*.ts',
    ],
    theme: {
        fontFamily: {
            livvic: [
                '"Livvic"',
                'sans-serif',
            ],
        },
        fontSize: {
            'xs': ['0.875rem', { lineHeight: '1rem' }],
            'sm': ['1rem', { lineHeight: '1.25rem' }],
            'base': ['1.125rem', { lineHeight: '1.5rem' }],
            'lg': ['1.25rem', { lineHeight: '1.75rem' }],
            'xl': ['1.5rem', { lineHeight: '1.75rem' }],
            '2xl': ['1.875rem', { lineHeight: '2rem' }],
            '3xl': ['2.25rem', { lineHeight: '2.25rem' }],
            '4xl': ['3rem', { lineHeight: '1' }],
            '5xl': ['3.75rem', { lineHeight: '1' }],
            '6xl': ['4.5rem', { lineHeight: '1' }],
            '7xl': ['6rem', { lineHeight: '1' }],
            '8xl': ['8rem', { lineHeight: '1' }],
        },
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
            typography: ({ theme }) => ({
                DEFAULT: {
                    css: {
                        fontSize: theme('fontSize.base'),
                    },
                },
            }),
            width: {
                clickable: '42px',
            },
            height: {
                clickable: '42px',
            },
            minWidth: {
                clickable: '42px',
            },
            maxWidth: {
                content: '1280px',
                readable: '65ch',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms')({ strategy: 'class' }),
        require('@tailwindcss/typography'),
    ],
};
