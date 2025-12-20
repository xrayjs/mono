import { defineMain } from "storybook-solidjs-vite";

export default defineMain({
  framework: {
    name: "storybook-solidjs-vite",
    options: {},
  },
  typescript: {
    check: false,
  },
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-links",
    "@storybook/addon-vitest",
  ],
  stories: [
    "../src/stories/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  viteFinal: (config) => {
    config.base = "/mono/storybook/";
    return config;
  },
});
