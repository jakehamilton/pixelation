import * as engine from "@pixelation/engine";
import { CardinalFocus, CardinalGrid, CardinalDirection } from "../../src";

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
});

const boxes = Array.from({ length: 5 }, (_, row) => {
	return Array.from({ length: 5 }, (_, col) => createBox(row, col));
});

const focus = new CardinalFocus(boxes, true);

const setup: engine.lifecycle.Setup = (surface, inputs, audio) => {
	screen.canvas.style.width = "800px";
	screen.canvas.style.height = "800px";

	root.appendChild(screen.canvas);
};

const update: engine.lifecycle.Update = (surface, inputs, audio, dt, t) => {
	if (inputs.keyboard.pressed("ArrowLeft") || inputs.keyboard.pressed("a")) {
		focus.west();
	} else if (
		inputs.keyboard.pressed("ArrowRight") ||
		inputs.keyboard.pressed("d")
	) {
		focus.east();
	} else if (
		inputs.keyboard.pressed("ArrowUp") ||
		inputs.keyboard.pressed("w")
	) {
		focus.north();
	} else if (
		inputs.keyboard.pressed("ArrowDown") ||
		inputs.keyboard.pressed("s")
	) {
		focus.south();
	}
};

const render: engine.lifecycle.Render = (surface, inputs, dt, t, fps) => {
	surface.fillRect(0, 0, surface.width, surface.height, background);

	for (const row of boxes) {
		for (const box of row) {
			surface.fillRect(
				box.x,
				box.y,
				box.width,
				box.height,
				focus.current === box ? highlight : white
			);
		}
	}
};

engine.lifecycle.run({
	surface: screen,
	setup,
	update,
	render,
});
