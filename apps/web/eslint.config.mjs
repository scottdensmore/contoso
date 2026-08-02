import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import jsxA11y from 'eslint-plugin-jsx-a11y';

// ESLint 9 dropped .eslintrc.json support, and Next 16 removed `next lint`, so
// this file replaces both. It mirrors the previous config exactly:
// next/core-web-vitals + jsx-a11y/recommended, with no-img-element off.
//
// The jsx-a11y rules are spread rather than extending its flat config, because
// eslint-config-next already registers the plugin and ESLint rejects a second
// definition of the same plugin name.
const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'coverage/**'],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      '@next/next/no-img-element': 'off',
    },
  },
];

export default config;
