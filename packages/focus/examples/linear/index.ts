import * as engine from "@pixelation/engine";
import { LinearFocus } from "../../src";

const root = document.getElementById("root")!;
const screen = new engine.graphics.Screen(400, 400);

const white = engine.colors.fromHex("#fff");
const background = engine.colors.fromHex("#efefef");
const highlight = engine.colors.fromHex("#f00");

const boxes = Array.from({ length: 5 }, (_, i) => ({
	x: 10 + i * 40,
	y: 10,
	width: 30,
	height: 30,
}));

const focus = new LinearFocus(boxes, true);

const setup: engine.lifecycle.Setup = (surface, inputs, audio) => {
	screen.canvas.style.width = "800px";
	screen.canvas.style.height = "800px";

	root.appendChild(screen.canvas);
};

const update: engine.lifecycle.Update = (surface, inputs, audio, dt, t) => {
	if (inputs.keyboard.pressed("ArrowLeft") || inputs.keyboard.pressed("a")) {
		focus.prev();
	} else if (
		inputs.keyboard.pressed("ArrowRight") ||
		inputs.keyboard.pressed("d")
	) {
		focus.next();
	}
};

const render: engine.lifecycle.Render = (surface, inputs, dt, t, fps) => {
	surface.fillRect(0, 0, surface.width, surface.height, background);

	for (const box of boxes) {
		surface.fillRect(
			box.x,
			box.y,
			box.width,
			box.height,
			focus.current === box ? highlight : white
		);
	}
};

engine.lifecycle.run({
	surface: screen,
	setup,
	update,
	render,
});
