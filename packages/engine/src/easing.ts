// The smooth update code here is ported from Werxzy's outstanding Picotron Solitaire Suite.
// Thank you Werxzy for open sourcing your game so that others may learn from it :)
// https://github.com/Werxzy/cards_api/blob/530568e70efb1fde592e067c98b8dcf8b0b2b9ef/util.lua#L56

import { pack, PackedColor, unpack, UnpackedColor } from "./colors";

export enum SmoothUpdateKind {
	Position = "p",
	Velocity = "v",
	Step = "s",
}

export const smooth = (
	position: number = 0,
	dampening: number = 0.5,
	acceleration: number = 0.1,
	limit: number = 0.1
) => {
	let velocity = 0;

	const step = (next: number) => {
		const difference = (next - position) * acceleration;
		velocity += difference;
		velocity *= dampening;
		position += velocity;

		if (
			velocity < limit &&
			velocity > -limit &&
			difference < limit &&
			difference > -limit
		) {
			position = next;
			velocity = 0;
		}
	};

	// @ts-ignore
	function update(): number;
	function update(value: number): number;
	function update(kind: SmoothUpdateKind.Step): number;
	function update(kind: SmoothUpdateKind.Position, value?: number): number;
	function update(kind: SmoothUpdateKind.Velocity, value?: number): number;
	function update(kind: SmoothUpdateKind | number, value?: number): number {
		if (arguments.length === 0) {
			return position;
		}

		switch (kind) {
			case SmoothUpdateKind.Position:
				if (value !== undefined) {
					position = value;
				}

				return position;
			case SmoothUpdateKind.Velocity:
				if (
					value !== undefined &&
					velocity + value <= limit &&
					velocity + value >= -limit
				) {
					velocity = value;
				}

				return velocity;
		}

		if (arguments.length === 1) {
			if (kind === SmoothUpdateKind.Step) {
				step(position);
			} else if (typeof kind === "number") {
				step(kind);
			}

			return position;
		}

		return position;
	}

	return update;
};

export type SmoothValue = ReturnType<typeof smooth>;

export const lerp = (a: number, b: number, t: number) => (1 - t) * a + t * b;
export const lerpSmooth = (a: number, b: number, decay: number, dt: number) => {
	if (a === b) {
		return a;
	}

	const value = b + (a - b) * Math.exp(-decay * dt);

	if (Math.abs(value - a) < 0.001) {
		return b;
	}

	return value;
};

export const lerpColor = (x: PackedColor, y: PackedColor, t: number) => {
	return pack(
		...(lerpColorUnpacked(unpack(x), unpack(y), t) as [
			number,
			number,
			number,
			number
		])
	);
};

export const lerpColorUnpacked = (
	x: UnpackedColor,
	y: UnpackedColor,
	t: number
) => {
	return [
		Math.round(x[0] + (y[0] - x[0]) * t),
		Math.round(x[1] + (y[1] - x[1]) * t),
		Math.round(x[2] + (y[2] - x[2]) * t),
		Math.round(x[3] + (y[3] - x[3]) * t),
	] as UnpackedColor;
};

export const easeIn = (t: number) => t * t;
export const easeOut = (t: number) => t * (2 - t);
export const easeInOut = (t: number) =>
	t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

export const easeInCubic = (t: number) => t * t * t;
export const easeOutCubic = (t: number) => --t * t * t + 1;
export const easeInOutCubic = (t: number) =>
	(t /= 0.5) < 1 ? 0.5 * t * t * t : 0.5 * ((t -= 2) * t * t + 2);

export const easeInQuart = (t: number) => t * t * t * t;
export const easeOutQuart = (t: number) => 1 - --t * t * t * t;
export const easeInOutQuart = (t: number) =>
	(t /= 0.5) < 1 ? 0.5 * t * t * t * t : -0.5 * ((t -= 2) * t * t * t - 2);

export const easeInQuint = (t: number) => t * t * t * t * t;
export const easeOutQuint = (t: number) => 1 + --t * t * t * t * t;
export const easeInOutQuint = (t: number) =>
	(t /= 0.5) < 1
		? 0.5 * t * t * t * t * t
		: 0.5 * ((t -= 2) * t * t * t * t + 2);

export const easeInSine = (t: number) => 1 - Math.cos((t * Math.PI) / 2);
export const easeOutSine = (t: number) => Math.sin((t * Math.PI) / 2);
export const easeInOutSine = (t: number) => 0.5 * (1 - Math.cos(Math.PI * t));

export const easeInExpo = (t: number) =>
	t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
export const easeOutExpo = (t: number) =>
	t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
export const easeInOutExpo = (t: number) => {
	if (t === 0 || t === 1) {
		return t;
	}
	if ((t /= 0.5) < 1) {
		return 0.5 * Math.pow(2, 10 * (t - 1));
	}
	return 0.5 * (2 - Math.pow(2, -10 * --t));
};

export const easeInCirc = (t: number) => 1 - Math.sqrt(1 - t * t);
export const easeOutCirc = (t: number) => Math.sqrt(1 - --t * t);
export const easeInOutCirc = (t: number) =>
	(t /= 0.5) < 1
		? -0.5 * (Math.sqrt(1 - t * t) - 1)
		: 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
