import * as engine from "@pixelation/engine";
import { BaseText, Variation, WhiteSpace } from "./base";

import normalRuneSpriteSheetBuffer from "./fonts/rf-rune-normal.aseprite?arraybuffer";
import normalDigitSpriteSheetBuffer from "./fonts/rf-digit-normal.aseprite?arraybuffer";
import normalSymbolSpriteSheetBuffer from "./fonts/rf-symbol-normal.aseprite?arraybuffer";
import { AsepriteByte } from "@pixelation/aseprite";

const normalRuneSpriteSheet = engine.graphics.SpriteSheet.fromArrayBuffer(
	normalRuneSpriteSheetBuffer
);
const normalDigitSpriteSheet = engine.graphics.SpriteSheet.fromArrayBuffer(
	normalDigitSpriteSheetBuffer
);
const normalSymbolSpriteSheet = engine.graphics.SpriteSheet.fromArrayBuffer(
	normalSymbolSpriteSheetBuffer
);

const DEFAULT_COLOR = engine.colors.fromHex("#000000");

/**
 * A map of the consonant to their position in the rune sprite sheet.
 */
const consonantMap = {
	m: 0,
	s: 6,
	t: 12,
} as const;

/**
 * An additional offset to apply to the consonant's position which will include the vowel in the rune.
 */
const vowelMap = {
	a: 1,
	i: 2,
	u: 3,
	e: 4,
	o: 5,
} as const;

/**
 * The sprites for each level of accent.
 */
const accentMap = {
	1: 14,
	2: 15,
	3: 16,
} as const;

/**
 * The sprites for each digit.
 */
const digitMap = {
	"0": 0,
	"1": 1,
	"2": 2,
	"3": 3,
	"4": 4,
	"5": 5,
	"6": 6,
	"7": 7,
	"8": 8,
	"9": 9,
} as const;

/**
 * The sprites for each symbol.
 */
const symbolMap = {
	".": 0,
	",": 1,
	"!": 2,
} as const;

/**
 * The sprites used for filling empty space when fewer than 3 runes are used in a character.
 */
const fillMap = {
	0: 17,
	1: 17,
	2: 18,
} as const;

const isConsonant = (char: string): char is keyof typeof consonantMap =>
	char in consonantMap;
const isVowel = (char: string): char is keyof typeof vowelMap =>
	char in vowelMap;
const isAccent = (char: string): char is "'" => char === "'";
const isDigit = (char: string): char is keyof typeof digitMap =>
	char in digitMap;
const isSymbol = (char: string): char is keyof typeof symbolMap =>
	char in symbolMap;

const CHARACTER_REGEX = /(?:(?:(?:[smt][aiueo]?)|[0-9]){1,3}'{0,3})|[\n .,!]/g;

export class Runeform extends BaseText {
	color: engine.colors.UnpackedColor;
	words: Array<{
		content: string;
		length: number;
	}> = [];

	runes: engine.graphics.SpriteSheet;
	digits: engine.graphics.SpriteSheet;
	symbols: engine.graphics.SpriteSheet;

	lineSpacing: number = 1;
	runeSpacing: number = 1;
	letterSpacing: number = 1;

	constructor(
		content: string,
		width: number = Infinity,
		height: number = Infinity,
		variation: Variation = Variation.Normal,
		whiteSpace: WhiteSpace = WhiteSpace.BreakAll,
		color: engine.colors.PackedColor = DEFAULT_COLOR
	) {
		super(content, width, height, variation, whiteSpace);

		this.color = engine.colors.unpack(color);

		// NOTE: We only support a Normal variation for Runeform right now, there is no compact variant.
		this.runes = normalRuneSpriteSheet;
		this.digits = normalDigitSpriteSheet;
		this.symbols = normalSymbolSpriteSheet;

		this.update();
	}

	update() {
		const characters = this.content.match(CHARACTER_REGEX);

		if (!characters) {
			return [0, 0];
		}

		const words: Array<{
			content: string;
			length: number;
		}> = [];

		for (const character of characters) {
			const last = words[words.length - 1];

			if (character === "\n" || character === " ") {
				words.push({
					content: character,
					length: 1,
				});
				continue;
			}

			if (last && (last.content === " " || last.content === "\n")) {
				words.push({
					content: character,
					length: 1,
				});
				continue;
			}

			if (isConsonant(character[0]) || isDigit(character[0])) {
				if (
					last &&
					last.content !== " " &&
					last.content !== "\n" &&
					!isSymbol(last.content[0])
				) {
					words[words.length - 1].content += character;
					words[words.length - 1].length++;
				} else {
					words.push({
						content: character,
						length: 1,
					});
				}
			} else if (isSymbol(character)) {
				if (
					last &&
					last.content !== " " &&
					last.content !== "\n" &&
					isSymbol(last.content[0])
				) {
					words[words.length - 1].content += character;
					words[words.length - 1].length++;
				} else {
					words.push({
						content: character,
						length: 1,
					});
				}
			}
		}

		this.words = words;
	}

	render(
		surface: engine.graphics.Surface,
		x: number,
		y: number,
		transform: engine.geometry.Matrix3 = engine.geometry.Matrix3.identity
	): [width: number, height: number] {
		let line = 0;
		let xOffset = 0;
		let yOffset = 0;
		let runeOffset = 0;

		let maxWidth = 0;
		let maxHeight = 0;

		if (
			this.runes.asset.palette[1].red !== this.color[0] ||
			this.runes.asset.palette[1].green !== this.color[1] ||
			this.runes.asset.palette[1].blue !== this.color[2]
		) {
			this.runes.asset.palette[1].red = this.color[0] as AsepriteByte;
			this.runes.asset.palette[1].green = this.color[1] as AsepriteByte;
			this.runes.asset.palette[1].blue = this.color[2] as AsepriteByte;
			this.runes.update();

			this.digits.asset.palette[1].red = this.color[0] as AsepriteByte;
			this.digits.asset.palette[1].green = this.color[1] as AsepriteByte;
			this.digits.asset.palette[1].blue = this.color[2] as AsepriteByte;
			this.digits.update();

			this.symbols.asset.palette[1].red = this.color[0] as AsepriteByte;
			this.symbols.asset.palette[1].green = this.color[1] as AsepriteByte;
			this.symbols.asset.palette[1].blue = this.color[2] as AsepriteByte;
			this.symbols.update();
		}

		const fillRemainingSlots = () => {
			for (let i = runeOffset; i < 3; i++) {
				switch (i) {
					case 0:
						this.runes.sprites[fillMap[0]].render(
							surface,
							x + xOffset,
							y + yOffset,
							transform
						);
						break;
					case 1:
						this.runes.sprites[fillMap[1]].render(
							surface,
							x + xOffset,
							y +
								yOffset +
								this.runes.asset.header.grid.height +
								this.runeSpacing,
							transform
						);
						break;
					case 2:
						this.runes.sprites[fillMap[2]].render(
							surface,
							x +
								xOffset +
								this.runes.asset.header.grid.height +
								this.runeSpacing,
							y +
								yOffset +
								this.runes.asset.header.grid.height +
								this.runeSpacing,
							transform
						);
						break;
				}
			}

			runeOffset = 0;
		};

		let isFirstWord = true;

		outer: for (const word of this.words) {
			const nextXOffset =
				this.whiteSpace === WhiteSpace.BreakWord
					? xOffset +
					  word.length *
							(this.runes.asset.header.grid.width * 2 +
								this.runeSpacing +
								this.letterSpacing)
					: xOffset +
					  this.runes.asset.header.grid.width * 2 +
					  this.runeSpacing +
					  this.letterSpacing;

			if (!isFirstWord && nextXOffset > this.width) {
				line++;
				xOffset = 0;
			}

			isFirstWord = false;

			if (word.content === "\n") {
				line++;
				xOffset = 0;
				continue;
			}

			if (word.content === " ") {
				if (xOffset > 0) {
					xOffset +=
						this.runes.asset.header.grid.width * 2 +
						this.runeSpacing +
						this.letterSpacing;
				} else {
					isFirstWord = true;
				}
				continue;
			}

			yOffset =
				line *
				(this.runes.asset.header.grid.height * 2 +
					this.lineSpacing +
					this.runeSpacing);

			if (yOffset > this.height) {
				break;
			}

			runeOffset = 0;

			for (let i = 0; i < word.content.length; i++) {
				const char = word.content[i];

				if (!isAccent(char)) {
					if (runeOffset > 2 && !(isVowel(char) || isAccent(char))) {
						runeOffset = 0;
						xOffset +=
							this.runes.asset.header.grid.width * 2 +
							this.runeSpacing +
							this.letterSpacing;
					}

					if (
						this.whiteSpace !== WhiteSpace.BreakWord &&
						xOffset +
							this.runes.asset.header.grid.width * 2 +
							this.runeSpacing >
							this.width
					) {
						line++;
						xOffset = 0;
						yOffset =
							line *
							(this.runes.asset.header.grid.height * 2 +
								this.lineSpacing +
								this.runeSpacing);

						if (yOffset > this.height) {
							break outer;
						}
					}
				}

				if (isConsonant(char)) {
					const next = word.content[i + 1];

					let sprite: engine.graphics.Sprite;

					if (
						next &&
						isVowel(next) &&
						(char !== "t" || (char === "t" && next === "a"))
					) {
						sprite =
							this.runes.sprites[
								consonantMap[char] + vowelMap[next]
							];
					} else {
						sprite = this.runes.sprites[consonantMap[char]];
					}

					switch (runeOffset) {
						case 0:
							sprite.render(
								surface,
								x + xOffset,
								y + yOffset,
								transform
							);
							break;
						case 1:
							sprite.render(
								surface,
								x + xOffset,
								y +
									yOffset +
									this.runes.asset.header.grid.height +
									this.runeSpacing,
								transform
							);
							break;
						case 2:
							sprite.render(
								surface,
								x +
									xOffset +
									this.runes.asset.header.grid.width +
									this.runeSpacing,
								y +
									yOffset +
									this.runes.asset.header.grid.height +
									this.runeSpacing,
								transform
							);
							break;
						default:
							console.warn("Invalid rune offset:", runeOffset);
							break;
					}

					runeOffset++;
				} else if (isAccent(char)) {
					if (runeOffset > 0 && runeOffset < 3) {
						fillRemainingSlots();
					}

					let count: keyof typeof accentMap = 1;

					const next = word.content[i + 1];
					const nextnext = word.content[i + 2];

					if (next && isAccent(next)) {
						i++;
						count = 2;

						if (nextnext && isAccent(nextnext)) {
							i++;
							count = 3;
						}
					}

					this.runes.sprites[accentMap[count]].render(
						surface,
						x +
							xOffset +
							this.runes.asset.header.grid.width +
							this.runeSpacing,
						y + yOffset,
						transform
					);

					runeOffset = 0;
					xOffset +=
						this.runes.asset.header.grid.width * 2 +
						this.runeSpacing +
						this.letterSpacing;
				} else if (isDigit(char)) {
					switch (runeOffset) {
						case 0:
							this.digits.sprites[digitMap[char]].render(
								surface,
								x + xOffset,
								y + yOffset,
								transform
							);
							break;
						case 1:
							this.digits.sprites[digitMap[char]].render(
								surface,
								x + xOffset,
								y +
									yOffset +
									this.digits.asset.header.grid.height +
									this.runeSpacing,
								transform
							);
							break;
						case 2:
							this.digits.sprites[digitMap[char]].render(
								surface,
								x +
									xOffset +
									this.digits.asset.header.grid.width +
									this.runeSpacing,
								y +
									yOffset +
									this.digits.asset.header.grid.height +
									this.runeSpacing,
								transform
							);
							break;
					}

					runeOffset++;

					const next = word.content[i + 1];
					if (!isDigit(next)) {
						fillRemainingSlots();
						runeOffset = 0;
						xOffset +=
							this.runes.asset.header.grid.width * 2 +
							this.runeSpacing +
							this.letterSpacing -
							1;
					}
				} else if (isSymbol(char)) {
					if (runeOffset > 0) {
						xOffset +=
							this.runes.asset.header.grid.width * 2 +
							this.runeSpacing +
							this.letterSpacing;
					}

					runeOffset = 0;

					this.symbols.sprites[symbolMap[char]].render(
						surface,
						x + xOffset,
						y + yOffset,
						transform
					);

					xOffset +=
						this.symbols.sprites[symbolMap[char]].width +
						this.letterSpacing;
				}

				if (xOffset > maxWidth) {
					maxWidth = xOffset;
				}

				if (yOffset > maxHeight) {
					maxHeight = yOffset;
				}
			}
		}

		if (runeOffset > 0) {
			fillRemainingSlots();
		}

		if (xOffset > maxWidth) {
			maxWidth = xOffset;
		}

		if (yOffset > maxHeight) {
			maxHeight = yOffset;
		}

		maxHeight += this.runes.asset.header.grid.height * 2 + this.runeSpacing;

		return [maxWidth, maxHeight];
	}
}
