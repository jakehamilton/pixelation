# @pixelation/engine

> A simple pixel art game engine.

## Installation

```shell
npm install @pixelation/engine
```

## Usage

To start using the Pixelation Engine, import this library and call the `run` lifecycle function.
This function requires the following options:

-   `screen`: An `engine.graphics.Screen` or `engine.graphics.VirtualScreen` to draw to.
-   `setup`: An `engine.lifecycle.Setup` function which is called before running other code.
-   `update`: An `engine.lifecycle.Update` function which is called before rendering each frame.
-   `render`: An `engine.lifecycle.Render` function which is called to render each frame.

```ts
import * as engine from "@pixelation/engine";

// Create a screen to draw to.
const screen = new engine.graphics.Screen(100, 100);

const setup: engine.lifecycle.Setup = (surface, inputs, audio) => {
    // Add the screen to the page.
    document.body.appendChild(screen.canvas);
};

const update: engine.lifecycle.Update = (surface, inputs, audio, dt, t) => {
    // Here you can handle things like user inputs or process game logic.
    if (inputs.keyboard.pressed("w")) {
        // ...
    }
};

const render: engine.lifecycle.Render = (surface, inputs, dt, t) => {
    // Here you can render to the current rendering target `surface`.
    surface.fillRect(
        0,
        0,
        surface.width,
        surface.height,
        engine.colors.fromHsl(0.65, 0.8, 0.75)
    );
};

engine.lifecycle.run({
    surface: screen,
    setup,
    update,
    render,
});
```

## Examples

For reference examples, please see [`./examples`](./examples).

In addition, the code for the engine is fairly short, so it should be possible to read through to
get a better understanding. Don't be intimidated, this stuff ended up being easier than it seems!
