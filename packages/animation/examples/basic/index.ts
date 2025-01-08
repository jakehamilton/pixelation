import * as engine from "@pixelation/engine";

import {
	Animation,
	AnimationDirection,
	AnimationState,
	Timeline,
} from "../../src";

const root = document.getElementById("root")!;
const screen = new engine.graphics.Screen(400, 400);

const white = engine.colors.fromHex("#fff");
const background = engine.colors.fromHex("#efefef");
const highlight = engine.colors.fromHex("#f00");

const createBox = (row: number, col: number) => ({
	x: 10 + col * 40,
	y: 10 + row * 40,
	width: 30,
	height: 30,
	color: white,
});

const box = createBox(0, 0);

const move = new Animation((progress, surface, inputs, audio, dt, t) => {
	box.x = engine.easing.lerp(10, 200, engine.easing.easeInOutQuart(progress));

	if (move.direction === AnimationDirection.Forward && progress === 1) {
		move.reverse();
	} else if (
		move.direction === AnimationDirection.Reverse &&
		progress === 0
	) {
		move.reverse();
	}
}, 4_000);

const color = new Animation((progress, surface, inputs, audio, dt, t) => {
	box.color = engine.easing.lerpColor(white, highlight, progress);

	if (color.direction === AnimationDirection.Forward && progress === 1) {
		color.reverse();
	} else if (
		color.direction === AnimationDirection.Reverse &&
		progress === 0
	) {
		color.reverse();
	}
}, 4_000);

const timeline = new Timeline([
	{ animation: move, offset: 0 },
	{ animation: color, offset: 2_000 },
	{ animation: move, offset: 4_000 },
	{ animation: color, offset: 6_000 },
]);

const moveY = new Animation((progress, surface, inputs, audio, dt, t) => {
	box.y = engine.easing.lerp(10, 200, engine.easing.easeInOutQuart(progress));
}, 10_000);

const composed = new Timeline([
	{ animation: timeline, offset: 0 },
	{ animation: moveY, offset: 0 },
]);

const setup: engine.lifecycle.Setup = (surface, inputs, audio) => {
	screen.canvas.style.width = "800px";
	screen.canvas.style.height = "800px";

	root.appendChild(screen.canvas);
};

const update: engine.lifecycle.Update = (surface, inputs, audio, dt, t) => {
	if (inputs.keyboard.pressed("Space")) {
		if (move.state === AnimationState.Playing) {
			composed.pause();
		} else {
			composed.play();
		}
	}

	composed.update(surface, inputs, audio, dt, t);
};

const render: engine.lifecycle.Render = (surface, inputs, dt, t, fps) => {
	surface.fillRect(0, 0, surface.width, surface.height, background);

	surface.fillRect(box.x, box.y, box.width, box.height, box.color);
};

engine.lifecycle.run({
	surface: screen,
	setup,
	update,
	render,
});
