const colors = require('tailwindcss/colors');
const { theme: { spacing } } = require('tailwindcss/defaultConfig');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './index.html',
        './src/**/*.{vue,ts}',
        './src/lang/*.yaml',

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
        colors: {
            'gray': colors.neutral,
            'white': colors.white,
            'red': colors.red,
            'current': colors.current,
            'black': colors.black,
            'transparent': colors.transparent,
            'dark-overlay': 'rgba(0,0,0,.5)',

            'primary': {
                100: '#dff29c',
                200: '#d5ee7c',
                300: '#c0e147',
                400: '#b0d237',
                500: '#8db007',
                600: '#738e06',
                700: '#668104',
                800: '#637a05',
                900: '#475809',
            },
            'primary-gray': {
                300: '#d9dccb',
                700: '#464a36',
            },

            'brand-solid': {
                100: '#e3dafb',
                200: '#c4b2f5',
                300: '#ab91f2',
                400: '#9d7cf8',
                500: '#7c4dff',
                600: '#7447f0',
                700: '#5f34d5',
                800: '#4a22b9',
                900: '#2c0f7b',
            },
            'brand-solid-gray': {
                300: '#d0cddb',
                700: '#3c3749',
            },
        },
        extend: {
            spacing: {
                13: `calc(${spacing['12']} + ${spacing['1']})`,
                edge: spacing['8'],
            },
            typography: ({ theme }) => ({
                DEFAULT: {
                    css: {
                        'fontSize': theme('fontSize.base'),
                        'code::before': {
                            content: '""',
                        },
                        'code::after': {
                            content: '""',
                        },
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
                'clickable': '42px',
                'modal-content': '500px',
            },
            minHeight: {
                clickable: '42px',
            },
            maxWidth: {
                content: '1280px',
            },
            zIndex: {
                60: '60',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms')({ strategy: 'class' }),
        require('@tailwindcss/typography'),
    ],
};
