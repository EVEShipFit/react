# React Component library for EVEShip.fit

This repository contains all the [React](https://react.dev/) components used to build [EVEShip.fit](https://eveship.fit).

## Development

Make sure you are authentication against the GitHub NPM.
See [here](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages) for instructions.

```bash
npm install
npm run dev
```

This will start a Storybook server, which allows you to view each component and interact with it.
It will reload automatically on changes to the code.

### Linting and coding style

Each Pull Request is validated by `eslint` and `prettier`.
To run this locally:

```bash
npm run lint
npm run format
```

The last command will modify source files where needed.

## Preview

Via [Storybook](https://react.eveship.fit) you can view all the components, their description, and how to use them.

## Embedding in your own application

This library can (freely) be used to visualize an EVE Fit in your own (React) application, by using the components you like most.

Important to note is that by default the data-files are downloaded from `https://data.eveship.fit/`.
But this URL is protected by a CORS, to avoid unrealistic cost on our side.

If you use this library yourself, you would have to host these files yourself too.
You can define the URL they are hosted on in the `EveDataProvider` via `dataUrl`.
