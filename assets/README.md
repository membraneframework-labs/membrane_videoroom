# Storybook

This project contains Storybook documentation that can be run only locally for now. Since Storybook v6 uses webpack v4 as the default builder which is incompatible with node v18, please init Storybook with a special command line option:

```sh
npx sb init --builder webpack5
```
