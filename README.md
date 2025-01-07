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
