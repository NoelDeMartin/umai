module.exports = {
    plugins: {
        'tailwindcss': {},
        'autoprefixer': {},

        // TODO only for storybook
        'postcss-pseudo-classes': {
            blacklist: [],
            restrictTo: ['hover', 'focus-visible'],
            allCombinations: true,
            preserveBeforeAfter: false,
        },
    },
};
