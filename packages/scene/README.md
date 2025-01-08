# @pixelation/scene

> Scene management for the Pixelation Engine.

## Installation

```shell
npm install @pixelation/scene
```

## Usage

```ts
import * as engine from "@pixelation/engine";

// To start using this package, import it into your code.
import * as scene from "@pixelation/scene";

const red = engine.colors.fromHex("#ff0000");
const blue = engine.colors.fromHex("#0000ff");

// Scenes must implement the Pixelation Engine Lifecycle Component interface.
const a: engine.lifecycle.Component = {
    render: (surface) => {
        surface.fillRect(0, 0, surface.width, surface.height, red);
    },
};

const b: engine.lifecycle.Component = {
    render: (surface) => {
        surface.fillRect(0, 0, surface.width, surface.height, blue);
    },
};

// Create a scene switcher with a default scene set.
const switcher = new scene.Switcher(a);

// Update the switcher.
switcher.update(surface, inputs, audio, dt, t);

// Render the current scene.
switcher.render(surface, inputs, dt, t, fps);

// Switch to a different scene.
switcher.switch(
    // The scene to switch to.
    b,
    // The duration of the switch animation.
    2_000
);
```
