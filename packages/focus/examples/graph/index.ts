import * as engine from "@pixelation/engine";
import { GraphFocus, type GraphItem } from "../../src";

const root = document.getElementById("root")!;
const screen = new engine.graphics.Screen(400, 400);

const white = engine.colors.fromHex("#fff");
const background = engine.colors.fromHex("#efefef");
const highlight = engine.colors.fromHex("#f00");

interface Box {
	x: number;
	y: number;
	width: number;
	height: number;
}

const rows = 3;
const cols = 5;
const boxes = Array.from(
	{ length: rows * cols },
	(_, i): GraphItem<Box> => ({
		value: {
			x: 10 + (i % cols) * 40,
			y: 10 + Math.floor(i / cols) * 40,
			width: 30,
			height: 30,
		},
		edges: [],
	})
);

boxes.splice(3, 1);
boxes.splice(5, 1);
boxes.splice(9, 2);

boxes[0].edges.push(null, boxes[1], boxes[4], null);
boxes[1].edges.push(null, boxes[2], null, boxes[0]);
boxes[2].edges.push(null, boxes[3], boxes[5], boxes[1]);
boxes[3].edges.push(null, null, boxes[7], boxes[2]);
boxes[4].edges.push(boxes[0], boxes[5], boxes[8], null);
boxes[5].edges.push(boxes[2], boxes[6], null, boxes[4]);
boxes[6].edges.push(null, boxes[7], boxes[9], boxes[5]);
boxes[7].edges.push(boxes[3], null, boxes[10], boxes[6]);
boxes[8].edges.push(boxes[4], boxes[9], null, null);
boxes[9].edges.push(boxes[6], boxes[10], null, boxes[8]);
boxes[10].edges.push(boxes[7], null, null, boxes[9]);

const focus = new GraphFocus(boxes);

const setup: engine.lifecycle.Setup = (surface, inputs, audio) => {
	screen.canvas.style.width = "800px";
	screen.canvas.style.height = "800px";

	root.appendChild(screen.canvas);
};

const update: engine.lifecycle.Update = (surface, inputs, audio, dt, t) => {
	const focused = focus.current;

	if (inputs.keyboard.pressed("ArrowLeft") || inputs.keyboard.pressed("a")) {
		const west = focused.edges[3];

		if (west) {
			focus.current = west;
		}
	} else if (
		inputs.keyboard.pressed("ArrowRight") ||
		inputs.keyboard.pressed("d")
	) {
		const east = focused.edges[1];

		if (east) {
			focus.current = east;
		}
	} else if (
		inputs.keyboard.pressed("ArrowUp") ||
		inputs.keyboard.pressed("w")
	) {
		const north = focused.edges[0];
		if (north) {
			focus.current = north;
		}
	} else if (
		inputs.keyboard.pressed("ArrowDown") ||
		inputs.keyboard.pressed("s")
	) {
		const south = focused.edges[2];
		if (south) {
			focus.current = south;
		}
	}
};

const render: engine.lifecycle.Render = (surface, inputs, dt, t, fps) => {
	surface.fillRect(0, 0, surface.width, surface.height, background);

	for (const item of boxes) {
		const box = item.value;
		surface.fillRect(
			box.x,
			box.y,
			box.width,
			box.height,
			focus.current === item ? highlight : white
		);
	}
};

engine.lifecycle.run({
	surface: screen,
	setup,
	update,
	render,
});
