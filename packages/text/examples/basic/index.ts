/// <reference path="../../src/types/arraybuffer.d.ts" />
import * as engine from "@pixelation/engine";
import { English, Runeform, Variation, WhiteSpace } from "../../src";

const root = document.getElementById("root")!;
const screen = new engine.graphics.Screen(200, 200);

const background = engine.colors.fromHex("#efefef");
const highlight = engine.colors.fromHex("#f00");

const text =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz\n1234567890\n+-/\\*:;()[]{}<>\n!?.,'\"&¡#%^~¨`|¦$¢_@";

const compactText = "abcdefghijklmnopqrstuvwxyz\n1234567890";

let hue = 0;

const setup: engine.lifecycle.Setup = (surface, inputs, audio) => {
	screen.canvas.style.width = "800px";
	screen.canvas.style.height = "800px";

	root.appendChild(screen.canvas);
};

const update: engine.lifecycle.Update = (surface, inputs, audio, dt, t) => {
	hue += 0.03 * dt;
	if (hue > 360) {
		hue = 0;
	}
};

const render: engine.lifecycle.Render = (surface, inputs, dt, t, fps) => {
	surface.clear();

	surface.fillRect(0, 0, surface.width, surface.height, background);

	const color = engine.colors.fromHsl(hue / 360, 0.65, 0.65);

	let x = 0;
	let y = 0;
	let pos: [number, number];

	pos = new English(
		text,
		surface.width,
		Infinity,
		Variation.Normal,
		WhiteSpace.BreakAll,
		color
	).render(surface, 1, 1);

	y += pos[1] + 1;

	pos = new English(
		text,
		surface.width,
		Infinity,
		Variation.Compact,
		WhiteSpace.BreakAll,
		color
	).render(surface, 1, 1 + y);

	y += pos[1] + 1;

	pos = new Runeform(
		"000123456789masa'.,! mitama",
		12,
		Infinity,
		Variation.Normal,
		WhiteSpace.BreakWord,
		color
	).render(surface, 1, 1 + y);

	y += pos[1] + 1;

	new Runeform(
		"mamima' .,!samita'''",
		Infinity,
		Infinity,
		Variation.Normal,
		WhiteSpace.BreakWord,
		color
	).render(surface, 1, y + 1);
};

engine.lifecycle.run({
	surface: screen,
	setup,
	update,
	render,
});
