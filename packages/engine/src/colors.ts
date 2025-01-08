import { Aseprite, AsepritePixel } from "@pixelation/aseprite";
import { Tagged } from "./tagged";

export type Color = {
	r: number;
	g: number;
	b: number;
	a: number;
};

export type PackedColor = Tagged<"PackedColor", number>;
export type UnpackedColor = Tagged<
	"UnpackedColor",
	[red: number, green: number, blue: number, alpha: number]
>;

export const pack = (
	red: number,
	green: number,
	blue: number,
	alpha: number
): PackedColor => {
	let color = 0;

	color |= red << 24;
	color |= green << 16;
	color |= blue << 8;
	color |= alpha;

	return color as PackedColor;
};

export const unpack = (packed: PackedColor): UnpackedColor => {
	return [
		(packed >> 24) & 0xff,
		(packed >> 16) & 0xff,
		(packed >> 8) & 0xff,
		packed & 0xff,
	] as UnpackedColor;
};

const HEX_REGEX = /^#(?:(?<full>[a-fA-F0-9]{6})|(?:(?<short>[a-fA-F0-9]{3})))$/;

export const fromHex = (hex: string): PackedColor => {
	const match = HEX_REGEX.exec(hex);

	if (!match || !match.groups) {
		throw new Error(`Invalid hex color: ${hex}`);
	}

	if (match.groups.short) {
		return pack(
			parseInt(match.groups.short[0] + match.groups.short[0], 16),
			parseInt(match.groups.short[1] + match.groups.short[1], 16),
			parseInt(match.groups.short[2] + match.groups.short[2], 16),
			255
		);
	}

	if (match.groups.full) {
		return pack(
			parseInt(match.groups.full[0] + match.groups.full[1], 16),
			parseInt(match.groups.full[2] + match.groups.full[3], 16),
			parseInt(match.groups.full[4] + match.groups.full[5], 16),
			255
		);
	}

	throw new Error(`Invalid hex color: ${hex}`);
};

export const fromRgb = (r: number, g: number, b: number): PackedColor => {
	return pack(r, g, b, 255);
};

export const fromAsepritePixel = (
	asset: Aseprite,
	color: AsepritePixel
): PackedColor => {
	if (color instanceof Uint8Array) {
		if (color.length === 4) {
			// RGBA
			return pack(color[0], color[1], color[2], 255);
		} else {
			// Grayscale
			return pack(color[0], color[0], color[0], 255);
		}
	} else {
		// Indexed
		const c = asset.palette[String(color)];

		if (!c) {
			console.warn(`Invalid color index: ${color}`);
			return PLACEHOLDER;
		}

		return pack(c.red, c.green, c.blue, 255);
	}
};

const hueToRgb = (p: number, q: number, t: number) => {
	if (t < 0) t += 1;
	if (t > 1) t -= 1;
	if (t < 1 / 6) return p + (q - p) * 6 * t;
	if (t < 1 / 2) return q;
	if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
	return p;
};

export const fromHsl = (h: number, s: number, l: number) => {
	let r = 0;
	let g = 0;
	let b = 0;

	if (s === 0) {
		r = l;
		g = l;
		b = l;
	} else {
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;

		r = hueToRgb(p, q, h + 1 / 3);
		g = hueToRgb(p, q, h);
		b = hueToRgb(p, q, h - 1 / 3);
	}

	return pack(
		Math.round(r * 255),
		Math.round(g * 255),
		Math.round(b * 255),
		255
	);
};

export const fromCmyk = (
	c: number,
	m: number,
	y: number,
	k: number,
	a: number = 255
) => {
	let r = c * (1 - k) + k;
	let g = m * (1 - k) + k;
	let b = y * (1 - k) + k;

	return pack(
		Math.round((1 - r) * 255 + 0.5),
		Math.round((1 - g) * 255 + 0.5),
		Math.round((1 - b) * 255 + 0.5),
		a
	);
};

export const blend = (
	x: PackedColor,
	y: PackedColor,
	t: number = 0.5
): PackedColor => {
	const [xr, xg, xb, xa] = unpack(x);
	const [yr, yg, yb, ya] = unpack(y);

	const r = xr + (yr - xr) * t;
	const g = xg + (yg - xg) * t;
	const b = xb + (yb - xb) * t;
	const a = xa + (ya - xa) * t;

	return pack(r, g, b, a);
};

export const PLACEHOLDER = fromHex("#c84cc6");
