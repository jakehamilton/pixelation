# @pixelation/animation

> Animation support for the Pixelation Engine.

## Installation

```shell
npm install @pixelation/animation
```

## Usage

```ts
import * as engine from "@pixelation/engine";

import * as animation from "@pixelation/animation";

const box = {
    x: 0,
    y: 0,
    width: 10,
    height: 10,
};

// Construct a new animation which will perform some actions.
const move = new animation.Animation(
    // Supply a function which runs for each progress value (0-1) of the animation.
    (progress, surface, inputs, audio, dt, t) => {
        // Apply the progress value to determine how things should look.
        box.x = engine.easing.lerp(0, 100, progress);
    },

    // Set the duration of the animation (milliseconds).
    2_000,

    // Optionally loop this animation.
    false,

    // Optionally set the direction this animation plays.
    animation.AnimationDirection.Forward
);

// Set the animation to play.
move.play();

// Set the animation to paused.
move.pause();

// Stop the animation, resetting it.
move.stop();

// Update the animation. This will call the animation's animate function.
move.update(surface, inputs, audio, dt, t);

// Timelines can compose animations.
const timeline = new animation.Timeline(
    [
        { animation: move, offset: 0 },
        // Additional animations can be added at specific offset times...
    ],
    // Optionally loop this timeline.
    false
);

// Set the timeline to play.
timeline.play();

// Set the timeline to paused.
timeline.pause();

// Stop the timeline, resetting it.
timeline.stop();

// Update the timeline. This will call the relevant animate functions.
timeline.update(surface, inputs, audio, dt, t);
```
