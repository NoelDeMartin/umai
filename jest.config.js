const { compilerOptions } = require('./tsconfig');
const { pathsToModuleNameMapper } = require('ts-jest/utils');

module.exports = {
    preset: 'ts-jest/presets/js-with-babel',
    testRegex: '\\.test\\.ts$',
    collectCoverageFrom: ['<rootDir>/src/**/*'],
    coveragePathIgnorePatterns: [
        '<rootDir>/src/types/',
        '<rootDir>/src/main.ts',
    ],
    moduleFileExtensions: ['js', 'ts'],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/src/' }),
    globals: {
        'ts-jest': {
            babelConfig: {
                presets: [
                    ['@babel/preset-env', { targets: { node: '12' } }],
                ],
            },
        },
    },
};
