/// <reference path="../../src/types/arraybuffer.d.ts" />
import * as engine from "../../src";

const WIDTH = 200;
const HEIGHT = 200;
const SPEED_INCREMENT = 0.1;

const root = document.getElementById("root")!;
const screen = new engine.graphics.Screen(WIDTH, HEIGHT);

const colors = {
	nord0: engine.colors.fromHex("#2E3440"),
	nord1: engine.colors.fromHex("#3B4252"),
	nord2: engine.colors.fromHex("#434C5E"),
	nord3: engine.colors.fromHex("#4C566A"),
	nord4: engine.colors.fromHex("#D8DEE9"),
	nord5: engine.colors.fromHex("#E5E9F0"),
	nord6: engine.colors.fromHex("#ECEFF4"),
	nord7: engine.colors.fromHex("#8FBCBB"),
	nord8: engine.colors.fromHex("#88C0D0"),
	nord9: engine.colors.fromHex("#81A1C1"),
	nord10: engine.colors.fromHex("#5E81AC"),
	nord11: engine.colors.fromHex("#BF616A"),
	nord12: engine.colors.fromHex("#D08770"),
	nord13: engine.colors.fromHex("#EBCB8B"),
	nord14: engine.colors.fromHex("#A3BE8C"),
	nord15: engine.colors.fromHex("#B48EAD"),
} as const;

const paddle = {
	x: screen.width / 2 - 10,
	y: screen.height - 10,
	width: 20,
	height: 4,
};

interface Ball {
	x: number;
	y: number;
	r: number;
	dx: number;
	dy: number;
	speed: number;
}

const balls: Ball[] = [];

interface Brick {
	x: number;
	y: number;
	width: number;
	height: number;
	color: engine.colors.PackedColor;
}

const bricks: Brick[] = [];

type Level = Array<Array<null | engine.colors.PackedColor>>;

const createBricksFromLevel = (level: Level): Brick[] => {
	const result: Brick[] = [];

	const width = Math.floor(WIDTH / level[0].length);
	const height = Math.floor(HEIGHT / level.length);

	for (let y = 0; y < level.length; y++) {
		const row = level[y];

		for (let x = 0; x < row.length; x++) {
			const brick = row[x];

			if (brick) {
				result.push({
					x: x * width,
					y: y * height,
					width,
					height,
					color: brick,
				});
			}
		}
	}

	return result;
};

const _ = null;
const x = colors.nord10;
const y = colors.nord13;
const z = colors.nord15;
const o = colors.nord11;

let level = 0;
const levels: Level[] = [
	// Level 1
	[
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, x, x, _, _, _, x, x, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, x, x, x, x, x, x, x, _, _, _, _],
		[_, _, _, _, _, x, _, _, _, _, _, x, _, _, _, _],
		[_, _, _, _, _, x, x, x, x, x, x, x, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
	],
	// Level 2
	[
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, y, _, _, x, _, z, _, _, x, _, _, y, _, _],
		[_, _, y, _, _, x, _, z, _, _, x, _, _, y, _, _],
		[_, _, y, _, _, x, _, z, _, _, x, _, _, y, _, _],
		[_, _, y, _, _, x, _, z, _, _, x, _, _, y, _, _],
		[_, _, y, _, _, x, _, z, _, _, x, _, _, y, _, _],
		[_, _, y, _, _, x, _, z, _, _, x, _, _, y, _, _],
		[_, _, y, _, _, x, _, z, _, _, x, _, _, y, _, _],
		[_, _, y, _, _, x, _, z, _, _, x, _, _, y, _, _],
		[_, _, y, _, _, x, _, z, _, _, x, _, _, y, _, _],
		[_, _, y, _, _, x, _, z, _, _, x, _, _, y, _, _],
		[_, _, y, _, _, x, _, z, _, _, x, _, _, y, _, _],
		[_, _, y, _, _, x, _, z, _, _, x, _, _, y, _, _],
		[_, _, y, _, _, x, _, z, _, _, x, _, _, y, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
	],
	// Level 3
	[
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, x, x, _, _, x, x, _, _, _, _, _],
		[_, _, _, _, _, x, x, _, _, x, x, _, _, _, _, _],
		[_, _, _, _, _, x, x, _, _, x, x, _, _, _, _, _],
		[_, _, _, _, _, x, x, _, _, x, x, _, _, _, _, _],
		[_, _, _, _, _, x, x, _, _, x, x, _, _, _, _, _],
		[_, _, _, _, _, x, x, _, _, x, x, _, _, _, _, _],
		[_, _, _, _, _, x, x, _, _, x, x, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, x, _, _, _, _, _, _, _, _, x, _, _, _],
		[_, _, _, x, _, _, _, _, _, _, _, _, x, _, _, _],
		[_, _, _, _, x, _, _, _, _, _, _, x, _, _, _, _],
		[_, _, _, _, _, x, x, x, x, x, x, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
	],
	// Level 4
	[
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, z, z, z, z, z, z, z, z, z, z, z, z, z, z, _],
		[_, z, _, _, _, _, _, _, _, _, _, _, _, _, z, _],
		[_, z, _, z, z, z, z, z, z, z, z, z, z, _, z, _],
		[_, z, _, z, _, _, _, _, _, _, _, _, z, _, z, _],
		[_, z, _, z, _, z, z, z, z, z, z, _, z, _, z, _],
		[_, z, _, z, _, z, _, _, _, _, z, _, z, _, z, _],
		[_, z, _, z, _, z, _, o, z, _, z, _, z, _, z, _],
		[_, z, _, z, _, z, z, z, z, _, z, _, z, _, z, _],
		[_, z, _, z, _, _, _, _, _, _, z, _, z, _, z, _],
		[_, z, _, z, z, z, z, z, z, z, z, _, z, _, z, _],
		[_, z, _, _, _, _, _, _, _, _, _, _, z, _, z, _],
		[_, z, z, z, z, z, z, z, z, z, z, z, z, _, z, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, z, _],
		[_, z, z, z, z, z, z, z, z, z, z, z, z, z, z, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
		[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
	],
];

const setup: engine.lifecycle.Setup = (surface, inputs, audio) => {
	screen.canvas.style.height = "100%";
	screen.canvas.style.aspectRatio = "1 / 1";
	screen.canvas.style.cursor = "none";

	root.appendChild(screen.canvas);

	const dx = Math.sin(Math.PI / 4);
	const dy = Math.cos(Math.PI / 4);

	balls.push({
		x: screen.width / 2,
		y: screen.height - 14,
		r: 4,
		dx: dx,
		dy: dy,
		speed: 1,
	});

	bricks.push(...createBricksFromLevel(levels[level]));
};

const update: engine.lifecycle.Update = (surface, inputs, audio, dt) => {
	for (const ball of balls.slice()) {
		ball.x += ball.dx;
		ball.y += ball.dy;

		if (ball.y - ball.r > screen.height) {
			const index = balls.indexOf(ball);
			balls.splice(index, 1);

			const dx = Math.sin(Math.PI / 4);
			const dy = Math.cos(Math.PI / 4);

			balls.push({
				x: paddle.x + paddle.width / 2,
				y: paddle.y - 4,
				r: 4,
				dx: dx,
				dy: dy,
				speed: 1,
			});
			continue;
		}

		if (ball.x - ball.r < 0 || ball.x + ball.r > screen.width) {
			ball.dx *= -1;
		}

		if (ball.y - ball.r < 0) {
			ball.dy *= -1;
		}

		if (
			ball.x > paddle.x &&
			ball.x < paddle.x + paddle.width &&
			ball.y + ball.r > paddle.y &&
			ball.y + ball.r < paddle.y + paddle.height
		) {
			const offset = ((ball.x - paddle.x) / paddle.width) * 2 - 1;

			ball.speed += SPEED_INCREMENT;

			ball.dy *= -1;
			ball.dy += Math.sign(ball.dy) * SPEED_INCREMENT;
			ball.dx = ball.dx + offset + Math.sign(offset) * SPEED_INCREMENT;
			ball.y = paddle.y - ball.r;
		}

		for (const brick of bricks.slice()) {
			if (
				ball.x > brick.x &&
				ball.x < brick.x + brick.width &&
				ball.y > brick.y &&
				ball.y < brick.y + brick.height
			) {
				const index = bricks.indexOf(brick);
				bricks.splice(index, 1);

				ball.speed += SPEED_INCREMENT;

				const prevX = ball.x - ball.dx;
				const prevY = ball.y - ball.dy;

				if (prevX < brick.x) {
					ball.dx *= -1;
					ball.x = brick.x - ball.r;
				} else if (prevX > brick.x + brick.width) {
					ball.dx *= -1;
					ball.x = brick.x + brick.width + ball.r;
				}

				if (prevY < brick.y) {
					ball.dy *= -1;
					ball.y = brick.y - ball.r;
				} else if (prevY > brick.y + brick.height) {
					ball.dy *= -1;
					ball.y = brick.y + brick.height + ball.r;
				}

				ball.dx += Math.sign(ball.dx) * SPEED_INCREMENT;
				ball.dy += Math.sign(ball.dy) * SPEED_INCREMENT;
			}
		}
	}

	if (inputs.keyboard.held("ArrowLeft")) {
		paddle.x -= 2;
	}

	if (inputs.keyboard.held("ArrowRight")) {
		paddle.x += 2;
	}

	if (paddle.x < 0) {
		paddle.x = 0;
	}

	if (paddle.x + paddle.width > screen.width) {
		paddle.x = screen.width - paddle.width;
	}

	if (bricks.length === 0) {
		level++;

		if (level < levels.length) {
			bricks.push(...createBricksFromLevel(levels[level]));
		}
	}
};

const render: engine.lifecycle.Render = (surface, inputs, dt, t, fps) => {
	surface.fillRect(0, 0, surface.width, surface.height, colors.nord1);

	surface.fillRect(
		paddle.x,
		paddle.y,
		paddle.width,
		paddle.height,
		colors.nord4
	);

	for (const brick of bricks) {
		surface.fillRect(
			brick.x,
			brick.y,
			brick.width,
			brick.height,
			brick.color
		);
	}

	for (const ball of balls) {
		surface.fillCirc(ball.x, ball.y, ball.r - 1, colors.nord4);
	}
};

engine.lifecycle.run({
	surface: screen,
	setup,
	update,
	render,
});
