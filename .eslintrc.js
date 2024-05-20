const path = require("path");

module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    "airbnb-typescript",
    "airbnb/hooks",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react/recommended",
    "plugin:storybook/recommended",
    "prettier",
  ],
  plugins: ["@typescript-eslint", "import", "prettier", "react"],
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      "typescript": {
      }
    }
  },
  rules: {
    "import/no-named-as-default-member": "off",
    "newline-per-chained-call": "off",
    "react/jsx-pascal-case": "off",
    "react/require-default-props": "off",
  },
  parserOptions: {
    project: "./tsconfig.json",
  },
  overrides: [
    {
      // The files listed below are part of the build process, so they will be using packages that are listed
      // under devDependences and/or peerDependencies, so we need to be lenient with the import/no-extraneous-dependencies
      files: [".storybook/**/*.ts", ".storybook/**/*.tsx", ".eslintrc.js", "rollup.config.mjs", "**/*.stories.tsx"],
      rules: {
        "import/no-extraneous-dependencies": ["error", { peerDependencies: true, devDependencies: true }],
      },
    },
  ],
};
