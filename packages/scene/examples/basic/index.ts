import * as engine from "@pixelation/engine";

import { Switcher } from "../../src";

const root = document.getElementById("root")!;
const screen = new engine.graphics.Screen(400, 400);

const white = engine.colors.fromHex("#fff");
const background = engine.colors.fromHex("#efefef");
const highlight = engine.colors.fromHex("#f00");

const red = engine.colors.fromHex("#f00");
const purple = engine.colors.fromHex("#f0f");

const transparent = engine.colors.pack(255, 255, 255, 0.5);

let isSwitched = false;

const a: engine.lifecycle.Component = {
	render: (surface, inputs, dt, t, fps) => {
		surface.fillRect(0, 0, surface.width, surface.height, red);
	},
};

const b: engine.lifecycle.Component = {
	render: (surface, inputs, dt, t, fps) => {
		surface.fillRect(0, 0, surface.width, surface.height, purple);
	},
};

const switcher = new Switcher(a);

const setup: engine.lifecycle.Setup = (surface, inputs, audio) => {
	screen.canvas.style.width = "800px";
	screen.canvas.style.height = "800px";

	root.appendChild(screen.canvas);
};

const update: engine.lifecycle.Update = (surface, inputs, audio, dt, t) => {
	if (inputs.keyboard.pressed("Space")) {
		if (!isSwitched) {
			switcher.switch(b, 2_000);
			isSwitched = true;
		} else {
			switcher.switch(a, 2_000);
			isSwitched = false;
		}
	}

	switcher.update(surface, inputs, audio, dt, t);
};

const render: engine.lifecycle.Render = (surface, inputs, dt, t, fps) => {
	surface.fillRect(0, 0, surface.width, surface.height, background);

	// const blended = engine.colors.blend(red, transparent);

	// surface.fillRect(0, 100, 100, 100, transparent);
	switcher.render(surface, inputs, dt, t, fps);
};

engine.lifecycle.run({
	surface: screen,
	setup,
	update,
	render,
});
