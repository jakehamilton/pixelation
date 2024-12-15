import * as engine from "@pixelation/engine";

export enum Variation {
	Normal,
	Compact,
}

export enum WhiteSpace {
	BreakAll,
	BreakWord,
}

export abstract class BaseText {
	constructor(
		public content: string,
		public width: number,
		public height: number,
		public variation: Variation,
		public whiteSpace: WhiteSpace
	) {}

	abstract render(
		surface: engine.graphics.Surface,
		x: number,
		y: number,
		transform: engine.geometry.Matrix3
	): [width: number, height: number];
}
