# Storybook for React

Storybook for React is a UI development environment for your React components.
With it, you can visualize different states of your UI components and develop them interactively.

![Storybook Screenshot](https://github.com/storybookjs/storybook/blob/main/media/storybook-intro.gif)

Storybook runs outside of your app.
So you can develop UI components in isolation without worrying about app specific dependencies and requirements.

## Getting Started

```sh
cd my-react-app
npx sb init
```

For more information visit: [storybook.js.org](https://storybook.js.org)

---

Storybook also comes with a lot of [addons](https://storybook.js.org/docs/react/configure/storybook-addons) and a great API to customize as you wish.
You can also build a [static version](https://storybook.js.org/docs/react/workflows/publish-storybook) of your storybook and deploy it anywhere you want.

Here are some featured storybooks that you can reference to see how Storybook works:

- [Demo of React Dates](http://airbnb.io/react-dates/) - [source](https://github.com/airbnb/react-dates)
- [Demo of React Native Web](https://necolas.github.io/react-native-web/docs/) - [source](https://github.com/necolas/react-native-web)

## React Applications

For React apps that are not built with Create React App, ReactDom is a required for Storybook to work with your project. Add it to your devDependencies if it is not a dependency in your project:

```bash
npm install react-dom --save-dev
```

## Create React App

Support for [Create React App](https://create-react-app.dev/) is handled by [`@storybook/preset-create-react-app`](https://github.com/storybookjs/presets/tree/master/packages/preset-create-react-app).

This preset enables support for all Create React App features, including Sass/SCSS and TypeScript.

## Typescript

`@storybook/react` is now exporting its own types to use with Typescript.
You don't need to have `@types/storybook__react` installed anymore if it was your case.
But you probably also need to use types from `@types/node @types/react`.

## Docs

- [Basics](https://storybook.js.org/docs/react/get-started/introduction)
- [Configurations](https://storybook.js.org/docs/react/configure/overview)
- [Addons](https://storybook.js.org/docs/react/configure/storybook-addons)
