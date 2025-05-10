# Pixelation

> A small, simple game engine written in TypeScript.

This engine does not include a lot of fancy features. Instead, primitives and common operations
are provided and users of these libraries are expected to implement the rest. Pixelation works
similar in principle to Pico-8 or Picotron in terms of code.

| Library                                        | Description                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------------- |
| [@pixelation/aseprite](./packages/aseprite/)   | An Aseprite file parser written in TypeScript.                                  |
| [@pixelation/engine](./packages/engine/)       | The core engine implementation supplying lifecycle, graphics, audio, and input. |
| [@pixelation/text](./packages/text/)           | A basic text-rendering package for English or Runeform text.                    |
| [@pixelation/focus](./packages/focus/)         | Manage focus of interactive elements.                                           |
| [@pixelation/animation](./packages/animation/) | Create and play animations or animation timelines.                              |
| [@pixelation/scene](./packages/scene/)         | Manage transitions between different scenes.                                    |
| [@pixelation/state](./packages/state/)         | Composable, reactive state management.                                          |

## Contributing

To contribute to Pixelation, first fork and clone this repository. Once cloned you will need
[Node](https://nodejs.org) installed to bootstrap dependencies, run development servers, and
build packages.

```bash
# From the repository root, install base dependencies.
npm install

# Now install dependencies for all packages.
npm run bootstrap

# To operate on packages, use Titan.
./node_modules/.bin/titan --help

# (alternatively)
# npx @jakehamilton/titan --help

# Here are some common operations you'll want to perform.

# Build all packages respecting dependency chains.
./node_modules/.bin/titan build -o

# Build a specific package respecting its dependency chain.
./node_modules/.bin/titan build -o -s "@pixelation/mypackage"

# Run the dev script from matching packages.
./node_modules/.bin/titan run dev -s "@pixelation/mypackage"
```
