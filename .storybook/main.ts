import path from "path";

import type { StorybookConfig } from "@storybook/react-webpack5";
import type { Configuration } from "webpack";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-webpack5-compiler-babel",
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  core: {
    disableTelemetry: true,
  },
  webpackFinal: async (webpackConfig: Configuration) => {
    return {
      ...webpackConfig,
      experiments: {
        asyncWebAssembly: true,
      },
      resolve: {
        ...webpackConfig.resolve,
        alias: {
          ...webpackConfig.resolve?.alias,
          "@": path.resolve(__dirname, "./../src"),
        },
      },
    };
  },
};
export default config;
