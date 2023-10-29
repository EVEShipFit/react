# React Component library for EVEShip.fit

This repository contains all the components used to build [EVEShip.fit](https://eveship.fit).

## Components

Via [Storybook](https://react.eveship.fit) you can view all the components, their description, and how to use them.

## Embedding in your own application

This library can (freely) be used to visualize an EVE Fit in your own (React) application, by using the components you like most.

Important to note is that by default the data-files are downloaded from `https://data.eveship.fit/`.
But this URL is protected by a CORS, to avoid unrealistic cost on our side.

If you use this library yourself, you would have to host these files yourself too.
You can define the URL they are hosted on in the `EveDataProvider` via `dataUrl`.
