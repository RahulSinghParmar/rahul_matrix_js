const globals = Object.fromEntries(
  [
    'window',
    'innerWidth',
    'clearTimeout',
    'document',
    'localStorage',
    'matchMedia',
    'ResizeObserver',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'devicePixelRatio',
    'URL',
    'setTimeout',
    'console',
    'process',
  ].map((key) => [key, 'readonly']),
);
export default [
  { ignores: ['node_modules/**', 'test-results/**', 'playwright-report/**'] },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals },
    rules: {
      'no-unused-vars': ['error', { caughtErrors: 'none', argsIgnorePattern: '^_' }],
      'no-undef': 'error',
    },
  },
];
