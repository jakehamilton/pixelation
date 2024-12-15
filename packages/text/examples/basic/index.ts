/// <reference path="../../src/types/arraybuffer.d.ts" />
import * as engine from "@pixelation/engine";
import { English, Runeform, Variation, WhiteSpace } from "../../src";

const root = document.getElementById("root")!;
const screen = new engine.graphics.Screen(200, 200);

const background = engine.colors.fromHex("#efefef");
const highlight = engine.colors.fromHex("#f00");

const text =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz\n1234567890\n+-/\\*:;()[]{}<>\n!?.,'\"&¡#^~¨`|¦$¢_@";

const minWidth = 20;

const setup: engine.lifecycle.Setup = (surface, inputs, audio) => {
	screen.canvas.style.width = "800px";
	screen.canvas.style.height = "800px";

	root.appendChild(screen.canvas);
};

const update: engine.lifecycle.Update = (surface, inputs, audio, dt, t) => {
	const maxWidth = surface.width - 2;
	const width = ((Math.sin(t / 5000) + 1) / 2) * (maxWidth - minWidth);
};

const render: engine.lifecycle.Render = (surface, inputs, dt, t, fps) => {
	surface.clear();

	surface.fillRect(0, 0, surface.width, surface.height, background);

	let x = 0;
	let y = 0;
	let pos: [number, number];

	pos = new English(
		text,
		surface.width,
		Infinity,
		Variation.Normal,
		WhiteSpace.BreakAll
	).render(surface, 1, 1);

	y += pos[1] + 1;

	pos = new Runeform(
		"000123456789masa'.,! mitama",
		12,
		Infinity,
		Variation.Normal,
		WhiteSpace.BreakWord
	).render(surface, 1, 1 + y);

	y += pos[1] + 1;

	new Runeform(
		"mamima' .,!samita'''",
		Infinity,
		Infinity,
		Variation.Normal,
		WhiteSpace.BreakWord,
		engine.colors.fromHex("#0000ff")
	).render(surface, 1, y + 1);
};

engine.lifecycle.run({
	surface: screen,
	setup,
	update,
	render,
});
