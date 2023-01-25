module.exports = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    {
      name: "@storybook/addon-postcss",
      options: {
        postcssLoaderOptions: {
          implementation: require("postcss"),
        },
      },
    },

    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-css-modules-preset",
  ],
  framework: "@storybook/react",
  typescript: {
    reactDocgen: "none",
  },
  core: {
    builder: "webpack5",
  },
};
