import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import cdkPlugin from 'eslint-cdk-plugin';

export default defineConfig([
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['lib/**/*.ts', 'bin/*.ts'],
        extends: [cdkPlugin.configs.recommended],
    },
]);
