/// <reference path="../../src/types/arraybuffer.d.ts" />
import * as engine from "../../src";

import rgbaSpriteBuffer from "./sprites/rgba.aseprite?arraybuffer";
import grayscaleSpriteBuffer from "./sprites/grayscale.aseprite?arraybuffer";
import indexedSpriteBuffer from "./sprites/indexed.aseprite?arraybuffer";
import animatedSpriteBuffer from "./sprites/animated.aseprite?arraybuffer";

const root = document.getElementById("root")!;
const screen = new engine.graphics.Screen(200, 200);

const rgbaSprite = engine.graphics.Sprite.fromArrayBuffer(rgbaSpriteBuffer);
const grayscaleSprite = engine.graphics.Sprite.fromArrayBuffer(
	grayscaleSpriteBuffer
);
const indexedSprite =
	engine.graphics.Sprite.fromArrayBuffer(indexedSpriteBuffer);
const animatedSprite =
	engine.graphics.AnimatedSprite.fromArrayBuffer(animatedSpriteBuffer);

let playerX = engine.easing.smooth(screen.width / 2, 0.95, 0.2, 5);
let playerY = engine.easing.smooth(screen.height / 2, 0.95, 0.2, 5);

let mouseX = engine.easing.smooth(screen.width / 2, 0.53, 0.3);
let mouseY = engine.easing.smooth(screen.height / 2, 0.53, 0.3);

let discX = 0;
let discY = 0;

const UP_BUTTON = 12;
const DOWN_BUTTON = 13;
const LEFT_BUTTON = 14;
const RIGHT_BUTTON = 15;

const LEFT_STICK_X = 0;
const LEFT_STICK_Y = 1;
const RIGHT_STICK_X = 2;
const RIGHT_STICK_Y = 3;

const avatarScreen = new engine.graphics.Screen(
	rgbaSprite.width,
	rgbaSprite.height
);

const STICK_SENSITIVITY = 0.1;

const setup: engine.lifecycle.Setup = (surface, inputs, audio) => {
	window.addEventListener(
		"click",
		() => {
			audio.context.resume();
			// music.play();
			// sfx.play();
		},
		{
			once: true,
		}
	);

	screen.canvas.style.width = "800px";
	screen.canvas.style.height = "800px";
	screen.canvas.style.cursor = "none";

	root.appendChild(screen.canvas);
};

const update: engine.lifecycle.Update = (surface, inputs, audio, dt) => {
	const gamepad = inputs.gamepads[0];

	const x = playerX();
	const y = playerY();

	let isMoving = false;

	if (
		inputs.keyboard.held("w") ||
		inputs.keyboard.held("ArrowUp") ||
		gamepad.held(UP_BUTTON) ||
		gamepad.axis(LEFT_STICK_Y) < 0 - STICK_SENSITIVITY
	) {
		isMoving = true;
		playerY(y - 1);
	}

	if (
		inputs.keyboard.held("s") ||
		inputs.keyboard.held("ArrowDown") ||
		gamepad.held(DOWN_BUTTON) ||
		gamepad.axis(LEFT_STICK_Y) > 0 + STICK_SENSITIVITY
	) {
		isMoving = true;
		playerY(y + 1);
	}

	if (
		inputs.keyboard.held("a") ||
		inputs.keyboard.held("ArrowLeft") ||
		gamepad.held(LEFT_BUTTON) ||
		gamepad.axis(LEFT_STICK_X) < 0 - STICK_SENSITIVITY
	) {
		isMoving = true;
		playerX(x - 1);
	}

	if (
		inputs.keyboard.held("d") ||
		inputs.keyboard.held("ArrowRight") ||
		gamepad.held(RIGHT_BUTTON) ||
		gamepad.axis(LEFT_STICK_X) > 0 + STICK_SENSITIVITY
	) {
		isMoving = true;
		playerX(x + 1);
	}

	if (!isMoving) {
		playerX(engine.easing.SmoothUpdateKind.Step);
		playerY(engine.easing.SmoothUpdateKind.Step);
	}

	const nextX = playerX();
	const nextY = playerY();

	if (x !== nextX || y !== nextY) {
		animatedSprite.play();
	} else {
		animatedSprite.pause();
	}

	mouseX(inputs.mouse.x);
	mouseY(inputs.mouse.y);

	discX = engine.easing.lerpSmooth(discX, inputs.mouse.x, 0.008, dt);
	discY = engine.easing.lerpSmooth(discY, inputs.mouse.y, 0.008, dt);

	// for (let i = 0; i < inputs.gamepads[0].buttons.length; i++) {
	// 	const button = inputs.gamepads[0].buttons[i];
	//
	// 	if (button.held) {
	// 		console.log("held", i);
	// 	}
	// }
	animatedSprite.update(dt);
};

const render: engine.lifecycle.Render = (surface, inputs, dt, t, fps) => {
	surface.clear();

	const step = 60;

	for (let x = 0; x < surface.width; x++) {
		for (let y = 0; y < surface.height; y++) {
			if (
				x !== 0 &&
				y !== 0 &&
				x !== surface.width - 1 &&
				y !== surface.height - 1
			) {
				const hue =
					(Math.sin((t + x * step + y * step) / 4_000) * 180 + 180) /
					360;
				const color = engine.colors.fromHsl(hue, 1, 0.85);
				surface.pixel(x, y, color);
			} else {
				const hue =
					(Math.sin((t - x * step - y * step) / 2_000) * 180 + 180) /
					360;
				const color = engine.colors.fromHsl(hue, 0.85, 0.7);
				surface.pixel(x, y, color);
			}
		}
	}

	surface.line(
		0,
		0,
		surface.width - 1,
		surface.height - 1,
		engine.colors.fromHex("#ffffff")
	);
	surface.line(
		0,
		surface.height - 1,
		surface.width - 1,
		0,
		engine.colors.fromHex("#ffffff")
	);

	surface.pixel(0, 0, engine.colors.fromHex("#000000"));
	surface.pixel(surface.width - 1, 0, engine.colors.fromHex("#000000"));
	surface.pixel(0, surface.height - 1, engine.colors.fromHex("#000000"));
	surface.pixel(
		surface.width - 1,
		surface.height - 1,
		engine.colors.fromHex("#000000")
	);

	(() => {
		const rotation = ((t % 2_000) / 2_000) * (Math.PI * 2);
		const width = 10;
		const height = 10;
		const x = surface.width / 2 - width / 2 - 20;
		const y = surface.height / 2 - height / 2;
		const transform = new engine.geometry.Matrix3([
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		])
			.translate(-x - width / 2, -y - height / 2)
			.rotate(rotation)
			.translate(x + width / 2, y + height / 2);

		surface.traceRect(
			x,
			y,
			width,
			height,
			engine.colors.fromHex("#ff0000")
			// transform
		);
	})();

	(() => {
		const rotation = ((t % 2_000) / 2_000) * (Math.PI * 2);
		const base = 11;
		const height = 11;
		const x = surface.width / 2;
		const y = surface.height / 2;
		const transform = new engine.geometry.Matrix3([
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		])
			.translate(-x, -y - 1)
			.rotate(rotation)
			.translate(x, y);

		const x0 = x - base / 2;
		const y0 = y + height / 2;
		const x1 = x + base / 2;
		const y1 = y + height / 2;
		const x2 = x;
		const y2 = y - height / 2;

		surface.traceTri(
			x0,
			y0,
			x1,
			y1,
			x2,
			y2,
			engine.colors.fromHex("#00ff00")
			// transform
		);
	})();

	(() => {
		const rotation = ((t % 2_000) / 2_000) * (Math.PI * 2);
		const radius = 4;
		const x = surface.width / 2 + 20;
		const y = surface.height / 2;
		const transform = new engine.geometry.Matrix3([
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		])
			.translate(-x, -y)
			.skew(0, 0.5)
			.rotate(rotation)
			.translate(x, y);

		surface.traceCirc(
			x,
			y,
			radius,
			engine.colors.fromHex("#0000ff")
			// transform
		);
	})();

	(() => {
		const rotation = ((t % 2_000) / 2_000) * (Math.PI * 2);
		const width = 10;
		const height = 10;
		const x = surface.width / 2 - width / 2 - 20;
		const y = surface.height / 2 - height / 2 + 20;
		const transform = new engine.geometry.Matrix3([
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		])
			.translate(-x - width / 2, -y - height / 2)
			.rotate(rotation)
			.translate(x + width / 2, y + height / 2);

		surface.fillRect(
			x,
			y,
			width,
			height,
			engine.colors.fromHex("#ff0000")
			// transform
		);
	})();

	(() => {
		const rotation = ((t % 2_000) / 2_000) * (Math.PI * 2);
		const base = 11;
		const height = 11;
		const x = surface.width / 2;
		const y = surface.height / 2 + 20;
		const transform = new engine.geometry.Matrix3([
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		])
			.translate(-x, -y)
			.rotate(rotation)
			.translate(x, y);

		const x0 = x - base / 2;
		const y0 = y + height / 2;
		const x1 = x + base / 2;
		const y1 = y + height / 2;
		const x2 = x;
		const y2 = y - height / 2;

		surface.fillTri(
			x0,
			y0,
			x1,
			y1,
			x2,
			y2,
			engine.colors.fromHex("#00ff00")
		);
	})();

	(() => {
		const rotation = ((t % 2_000) / 2_000) * (Math.PI * 2);
		const radius = 4;
		const x = surface.width / 2 + 20;
		const y = surface.height / 2 + 20;
		const transform = new engine.geometry.Matrix3([
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		])
			.translate(-x, -y)
			.skew(0, 0.5)
			.rotate(rotation)
			.translate(x, y);

		surface.fillCirc(
			x,
			y,
			radius,
			engine.colors.fromHex("#0000ff")
			// transform
		);
	})();

	(() => {
		const rotation = ((t % 2_000) / 2_000) * (Math.PI * 2);
		const x = surface.width / 2 - 30;
		const y = surface.height / 2 - 30;
		const transform = new engine.geometry.Matrix3([
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		])
			.translate(-x - rgbaSprite.width / 2, -y - rgbaSprite.height / 2)
			.rotate(rotation)
			.translate(x, y);

		avatarScreen.clear();
		avatarScreen.fillRect(4, 4, 13, 15, engine.colors.fromHex("#ffffff"));

		surface.blitMask(rgbaSprite.image, avatarScreen.image, x, y, transform);
	})();

	(() => {
		const rotation = ((t % 2_000) / 2_000) * (Math.PI * 2);
		const x = surface.width / 2;
		const y = surface.height / 2 - 30;
		const transform = new engine.geometry.Matrix3([
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		])
			.translate(-x - rgbaSprite.width / 2, -y - rgbaSprite.height / 2)
			.rotate(rotation)
			.translate(x, y);

		surface.blit(grayscaleSprite.image, x, y, transform);
	})();

	(() => {
		const rotation = ((t % 2_000) / 2_000) * (Math.PI * 2);
		const x = surface.width / 2 + 30;
		const y = surface.height / 2 - 30;
		const transform = new engine.geometry.Matrix3([
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		])
			.translate(-x - rgbaSprite.width / 2, -y - rgbaSprite.height / 2)
			.rotate(rotation)
			.translate(x, y);

		indexedSprite.render(surface, x, y, transform);
	})();

	(() => {
		const size = 2;
		const transform = new engine.geometry.Matrix3([
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		]).translate(-size / 2 + 1, -size / 2 + 1);

		screen.fillCirc(
			Math.round(discX),
			Math.round(discY),
			size,
			engine.colors.fromHsl(0.45, 0.9, 0.75),
			transform
		);
	})();

	(() => {
		const size = 2;
		const transform = new engine.geometry.Matrix3([
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		]).translate(-size / 2 + 1, -size / 2 + 1);

		if (inputs.mouse.visible) {
			screen.fillCirc(
				Math.round(inputs.mouse.x),
				Math.round(inputs.mouse.y),
				size,
				engine.colors.fromHsl(0.85, 0.9, 0.75),
				transform
			);
		}
	})();

	(() => {
		const x = playerX();
		const y = playerY();
		const transform = new engine.geometry.Matrix3([
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		])
			.translate(
				-x - animatedSprite.width / 2,
				-y - animatedSprite.height / 2
			)
			.translate(x, y);

		// animatedSprite.render(surface, playerX(), playerY(), transform);
	})();
};

engine.lifecycle.run({
	surface: screen,
	setup,
	update,
	render,
});
