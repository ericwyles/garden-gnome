import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      "eslint.config.js",
      "vite.config.js",
      "public/*",
      "userscripts/*",
      "dist/*",
      "dist-dev/*",
      "node_modules/*",
    ],
  },
  ...compat.extends("airbnb-base", "airbnb-typescript/base", "prettier"),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        Game: "writable",
        l: "readonly",
        b64_to_utf8: "readonly",
        utf8_to_b64: "readonly",
        BeautifyAll: "readonly",
      },
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        project: path.resolve(__dirname, "tsconfig.json"),
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // 'import/extensions': ['error', 'ignorePackages'],
      // 'import/no-mutable-exports': 'off',
      // 'no-import-assign': 'off',
      "no-plusplus": [
        "error",
        {
          allowForLoopAfterthoughts: true,
        },
      ],
      // 'func-names': 'off',
      "prefer-destructuring": [
        "error",
        {
          object: true,
          array: false,
        },
      ],
    },
  },
];
