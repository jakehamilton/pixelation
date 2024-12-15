import * as engine from "@pixelation/engine";

import { BaseText, Variation, WhiteSpace } from "./base";

import compactSpriteSheetBuffer from "./fonts/en-compact.aseprite?arraybuffer";
import normalSpriteSheetBuffer from "./fonts/en-normal.aseprite?arraybuffer";
import { AsepriteByte } from "@pixelation/aseprite";

const compactSpriteSheet = engine.graphics.SpriteSheet.fromArrayBuffer(
	compactSpriteSheetBuffer
);
const normalSpriteSheet = engine.graphics.SpriteSheet.fromArrayBuffer(
	normalSpriteSheetBuffer
);

const DEFAULT_COLOR = engine.colors.fromHex("#000000");

const charMap = {
	A: 0,
	B: 1,
	C: 2,
	D: 3,
	E: 4,
	F: 5,
	G: 6,
	H: 7,
	I: 8,
	J: 9,
	K: 10,
	L: 11,
	M: 12,
	N: 13,
	O: 14,
	P: 15,
	Q: 16,
	R: 17,
	S: 18,
	T: 19,
	U: 20,
	V: 21,
	W: 22,
	X: 23,
	Y: 24,
	Z: 25,
	a: 26,
	b: 27,
	c: 28,
	d: 29,
	e: 30,
	f: 31,
	g: 32,
	h: 33,
	i: 34,
	j: 35,
	k: 36,
	l: 37,
	m: 38,
	n: 39,
	o: 40,
	p: 41,
	q: 42,
	r: 43,
	s: 44,
	t: 45,
	u: 46,
	v: 47,
	w: 48,
	x: 49,
	y: 50,
	z: 51,
	1: 52,
	2: 53,
	3: 54,
	4: 55,
	5: 56,
	6: 57,
	7: 58,
	8: 59,
	9: 60,
	0: 61,
	"+": 62,
	"-": 63,
	"=": 64,
	"/": 65,
	"\\": 66,
	"*": 67,
	":": 68,
	";": 69,
	"(": 70,
	")": 71,
	"[": 72,
	"]": 73,
	"{": 74,
	"}": 75,
	"<": 76,
	">": 77,
	"!": 78,
	"?": 79,
	".": 80,
	",": 81,
	"'": 82,
	'"': 83,
	"&": 84,
	// inverted exclamation mark
	"¡": 85,
	"#": 86,
	"%": 87,
	"^": 88,
	"~": 89,
	"¨": 90,
	"`": 91,
	"|": 92,
	"¦": 93,
	$: 94,
	"¢": 95,
	_: 96,
	"@": 97,
} as const;

export class English extends BaseText {
	color: engine.colors.UnpackedColor;

	sheet: engine.graphics.SpriteSheet;
	lineSpacing: number = 1;
	letterSpacing: number = 1;

	constructor(
		content: string,
		width: number,
		height: number,
		variation: Variation,
		whiteSpace: WhiteSpace,
		color: engine.colors.PackedColor = DEFAULT_COLOR
	) {
		super(content, width, height, variation, whiteSpace);

		this.color = engine.colors.unpack(color);

		this.sheet =
			variation === Variation.Compact
				? compactSpriteSheet
				: normalSpriteSheet;

		this.content =
			variation === Variation.Compact ? content.toUpperCase() : content;
	}

	render(
		surface: engine.graphics.Surface,
		x: number,
		y: number,
		transform = engine.geometry.Matrix3.identity
	): [width: number, height: number] {
		let line = 0;
		let xOffset = 0;

		let maxWidth = 0;
		let maxHeight = 0;

		if (
			this.sheet.asset.palette[1].red !== this.color[0] ||
			this.sheet.asset.palette[1].green !== this.color[1] ||
			this.sheet.asset.palette[1].blue !== this.color[2]
		) {
			this.sheet.asset.palette[1].red = this.color[0] as AsepriteByte;
			this.sheet.asset.palette[1].green = this.color[1] as AsepriteByte;
			this.sheet.asset.palette[1].blue = this.color[2] as AsepriteByte;

			this.sheet.update();
		}

		if (this.whiteSpace === WhiteSpace.BreakAll) {
			for (let i = 0; i < this.content.length; i++) {
				const char = this.content[i];

				if (char === "\n") {
					line++;
					xOffset = 0;
					continue;
				}

				if (char === " ") {
					xOffset +=
						this.sheet.asset.header.grid.width + this.letterSpacing;
					continue;
				}

				if (xOffset + this.sheet.asset.header.grid.width > this.width) {
					line++;
					xOffset = 0;
				}

				const yOffset =
					line *
					(this.sheet.asset.header.grid.height + this.lineSpacing);

				if (yOffset > this.height) {
					break;
				}

				const index = charMap[char as keyof typeof charMap];

				if (index !== undefined && this.sheet.sprites.length > index) {
					const sprite = this.sheet.sprites[index];

					sprite.render(surface, x + xOffset, y + yOffset, transform);

					if (xOffset + sprite.width > maxWidth) {
						maxWidth = xOffset + sprite.width;
					}

					if (yOffset + sprite.height > maxHeight) {
						maxHeight = yOffset + sprite.height;
					}
				} else {
					surface.fillRect(
						x + xOffset,
						y + yOffset,
						this.sheet.asset.header.grid.width,
						this.sheet.asset.header.grid.height,
						engine.colors.PLACEHOLDER
					);
				}

				xOffset +=
					this.sheet.asset.header.grid.width + this.letterSpacing;
			}
		} else if (this.whiteSpace === WhiteSpace.BreakWord) {
			for (let i = 0; i < this.content.length; i++) {
				const char = this.content[i];

				if (char === "\n") {
					line++;
					xOffset = 0;
					continue;
				}

				if (char === " ") {
					xOffset +=
						this.sheet.asset.header.grid.width + this.letterSpacing;
					continue;
				}

				if (xOffset + this.sheet.asset.header.grid.width > this.width) {
					line++;
					xOffset = 0;
				}

				const chars = [char];
				for (let j = i + 1; j < this.content.length; j++) {
					if (this.content[j] === " " || this.content[j] === "\n") {
						break;
					}
					chars.push(this.content[j]);
				}

				let yOffset =
					line *
					(this.sheet.asset.header.grid.height + this.lineSpacing);

				if (
					xOffset +
						chars.length *
							(this.sheet.asset.header.grid.width +
								this.letterSpacing) >
					this.width
				) {
					xOffset = 0;
					yOffset +=
						this.sheet.asset.header.grid.height + this.lineSpacing;
				}

				if (yOffset > this.height) {
					break;
				}

				for (const char of chars) {
					const index = charMap[char as keyof typeof charMap];

					if (
						index !== undefined &&
						this.sheet.sprites.length > index
					) {
						const sprite = this.sheet.sprites[index];

						sprite.render(
							surface,
							x + xOffset,
							y + yOffset,
							transform
						);

						if (xOffset + sprite.width > maxWidth) {
							maxWidth = xOffset + sprite.width;
						}

						if (yOffset + sprite.height > maxHeight) {
							maxHeight = yOffset + sprite.height;
						}
					} else {
						surface.fillRect(
							x + xOffset,
							y + yOffset,
							this.sheet.asset.header.grid.width,
							this.sheet.asset.header.grid.height,
							engine.colors.PLACEHOLDER
						);
					}

					xOffset +=
						this.sheet.asset.header.grid.width + this.letterSpacing;
				}

				i += chars.length - 1;
			}
		}

		return [maxWidth, maxHeight];
	}
}
