import {
	Aseprite,
	AsepriteColorDepth,
	AsepriteTagAnimationDirection,
} from "@pixelation/aseprite";
import {
	fromAsepritePixel,
	Color,
	PackedColor,
	unpack,
	pack,
	fromHex,
	blend,
} from "./colors";
import { isPointInTri, Matrix3, Rect } from "./geometry";
import { DeltaTime } from "./lifecycle";

export type Surface = Screen | VirtualScreen;

export class Screen {
	virtual = false;
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;

	constructor(
		public width: number,
		public height: number,
		public image = new ImageData(width, height)
	) {
		this.canvas = document.createElement("canvas");
		this.canvas.setAttribute("tabindex", "0");
		this.canvas.style.imageRendering = "pixelated";

		this.canvas.width = width;
		this.canvas.height = height;
		this.context = this.canvas.getContext("2d")!;
		this.context.imageSmoothingEnabled = false;
	}

	commit() {
		this.context.putImageData(this.image, 0, 0);
	}

	clear() {
		for (let i = 0; i < this.image.data.length; i += 4) {
			this.image.data[i + 0] = 0;
			this.image.data[i + 1] = 0;
			this.image.data[i + 2] = 0;
			this.image.data[i + 3] = 255;
		}
	}

	pixel(x: number, y: number, color: PackedColor) {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;

		const [r, g, b, a] = unpack(color);

		x |= 0;
		y |= 0;

		const index = (y * this.width + x) * 4;

		if (a === 255) {
			this.image.data[index + 0] = r;
			this.image.data[index + 1] = g;
			this.image.data[index + 2] = b;
			this.image.data[index + 3] = a;
		} else if (a > 0) {
			const result = unpack(
				blend(
					pack(
						this.image.data[index + 0],
						this.image.data[index + 1],
						this.image.data[index + 2],
						this.image.data[index + 3]
					),
					color
				)
			);

			this.image.data[index + 0] = result[0];
			this.image.data[index + 1] = result[1];
			this.image.data[index + 2] = result[2];
			this.image.data[index + 3] = result[3];
		}
	}

	pixelUnpacked(
		x: number,
		y: number,
		r: number,
		g: number,
		b: number,
		a: number
	) {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;

		x |= 0;
		y |= 0;

		const index = (y * this.width + x) * 4;

		if (a === 255) {
			this.image.data[index + 0] = r;
			this.image.data[index + 1] = g;
			this.image.data[index + 2] = b;
			this.image.data[index + 3] = a;
		} else if (a > 0) {
			const result = unpack(
				blend(
					pack(
						this.image.data[index + 0],
						this.image.data[index + 1],
						this.image.data[index + 2],
						this.image.data[index + 3]
					),
					pack(r, g, b, a)
				)
			);

			this.image.data[index + 0] = result[0];
			this.image.data[index + 1] = result[1];
			this.image.data[index + 2] = result[2];
			this.image.data[index + 3] = result[3];
		}
	}

	blit(source: ImageData, x = 0, y = 0, transform = Matrix3.identity) {
		if (transform.isIdentity()) {
			for (let sy = 0; sy < source.height; sy++) {
				if (sy + y < 0 || sy + y >= this.height) {
					continue;
				}

				for (let sx = 0; sx < source.width; sx++) {
					if (sx + x < 0 || sx + x >= this.width) {
						continue;
					}

					const sIndex = (sy * source.width + sx) * 4;

					this.pixelUnpacked(
						sx + x,
						sy + y,
						source.data[sIndex + 0],
						source.data[sIndex + 1],
						source.data[sIndex + 2],
						source.data[sIndex + 3]
					);
				}
			}
		} else {
			const bounds = transform.applyToRect(
				x,
				y,
				source.width,
				source.height
			);
			const inverse = transform.inv();

			for (
				let sy = Math.floor(bounds.y);
				sy < Math.ceil(bounds.y + bounds.height);
				sy++
			) {
				for (
					let sx = Math.floor(bounds.x);
					sx < Math.ceil(bounds.x + bounds.width);
					sx++
				) {
					const point = inverse.apply(sx, sy);
					point.x -= x;
					point.y -= y;

					if (
						point.x < 0 ||
						point.x >= source.width ||
						point.y < 0 ||
						point.y >= source.height
					) {
						continue;
					}

					const sIndex =
						(Math.floor(point.y) * source.width +
							Math.floor(point.x)) *
						4;

					this.pixel(
						sx,
						sy,
						pack(
							source.data[sIndex + 0],
							source.data[sIndex + 1],
							source.data[sIndex + 2],
							source.data[sIndex + 3]
						)
					);
				}
			}
		}
	}

	blitMask(
		source: ImageData,
		mask: ImageData,
		x = 0,
		y = 0,
		transform = Matrix3.identity
	) {
		if (transform.isIdentity()) {
			for (let sy = 0; sy < source.height; sy++) {
				if (sy + y < 0 || sy + y >= this.height) {
					continue;
				}

				for (let sx = 0; sx < source.width; sx++) {
					if (sx + x < 0 || sx + x >= this.width) {
						continue;
					}

					const mIndex = (sy * mask.width + sx) * 4;

					if (mIndex + 3 >= mask.data.length) {
						continue;
					}

					const sIndex = (sy * source.width + sx) * 4;

					if (
						mask.data[mIndex] === 255 &&
						mask.data[mIndex + 1] === 255 &&
						mask.data[mIndex + 2] === 255 &&
						mask.data[mIndex + 3] === 255
					) {
						this.pixelUnpacked(
							sx + x,
							sy + y,
							source.data[sIndex + 0],
							source.data[sIndex + 1],
							source.data[sIndex + 2],
							source.data[sIndex + 3]
						);
					}
				}
			}
		} else {
			const bounds = transform.applyToRect(
				x,
				y,
				source.width,
				source.height
			);
			const inverse = transform.inv();

			for (
				let sy = Math.floor(bounds.y);
				sy < Math.ceil(bounds.y + bounds.height);
				sy++
			) {
				for (
					let sx = Math.floor(bounds.x);
					sx < Math.ceil(bounds.x + bounds.width);
					sx++
				) {
					const point = inverse.apply(sx, sy);
					point.x -= x;
					point.y -= y;

					if (
						point.x < 0 ||
						point.x >= source.width ||
						point.y < 0 ||
						point.y >= source.height
					) {
						continue;
					}

					const mIndex =
						(Math.floor(point.y) * mask.width +
							Math.floor(point.x)) *
						4;

					if (mIndex + 3 >= mask.data.length) {
						continue;
					}

					const sIndex =
						(Math.floor(point.y) * source.width +
							Math.floor(point.x)) *
						4;

					if (
						mask.data[mIndex] === 255 &&
						mask.data[mIndex + 1] === 255 &&
						mask.data[mIndex + 2] === 255 &&
						mask.data[mIndex + 3] === 255
					) {
						this.pixel(
							sx,
							sy,
							pack(
								source.data[sIndex + 0],
								source.data[sIndex + 1],
								source.data[sIndex + 2],
								source.data[sIndex + 3]
							)
						);
					}
				}
			}
		}
	}

	line(x0: number, y0: number, x1: number, y1: number, color: PackedColor) {
		x0 |= 0;
		y0 |= 0;
		x1 |= 0;
		y1 |= 0;

		if (x0 - x1 === 0) {
			for (let y = y0; y <= y1; y++) {
				this.pixel(x0, y, color);
			}

			return;
		}

		if (y0 - y1 === 0) {
			for (let x = x0; x <= x1; x++) {
				this.pixel(x, y0, color);
			}

			return;
		}

		if (x0 > x1) {
			[x0, x1] = [x1, x0];
			[y0, y1] = [y1, y0];
		}

		const slope = (y1 - y0) / (x1 - x0);

		if (slope === 1) {
			if (y0 > y1) {
				for (let x = x0, y = y0; x <= x1; x++, y--) {
					this.pixel(x, y, color);
				}

				return;
			} else {
				for (let x = x0, y = y0; x <= x1; x++, y++) {
					this.pixel(x, y, color);
				}

				return;
			}
		}

		if (slope === -1) {
			if (y0 > y1) {
				for (let x = x0, y = y0; x <= x1; x++, y--) {
					this.pixel(x, y, color);
				}

				return;
			} else {
				for (let x = x0, y = y0; x <= x1; x++, y++) {
					this.pixel(x, y, color);
				}

				return;
			}
		}

		const dx = Math.abs(x1 - x0);
		const dy = Math.abs(y1 - y0);
		const sx = Math.sign(x1 - x0);
		const sy = Math.sign(y1 - y0);
		let err = dx - dy;

		while (true) {
			this.pixel(x0, y0, color);

			if (x0 === x1 && y0 === y1) {
				return;
			}

			const e2 = 2 * err;

			if (e2 > -dy) {
				err -= dy;
				x0 += sx;
			}
			if (e2 < dx) {
				err += dx;
				y0 += sy;
			}
		}
	}

	fillRect(
		sx: number,
		sy: number,
		sw: number,
		sh: number,
		color: PackedColor,
		transform = Matrix3.identity
	) {
		if (transform.isIdentity()) {
			for (let x = sx; x < sx + sw; x++) {
				for (let y = sy; y < sy + sh; y++) {
					this.pixel(x, y, color);
				}
			}
		} else {
			const bounds = transform.applyToRect(sx, sy, sw, sh);

			const inverse = transform.inv();

			for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
				for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
					const point = inverse.apply(x, y);

					// Check if the inverted point is within the rectangle.
					if (
						point.x >= sx &&
						point.x < sx + sw &&
						point.y >= sy &&
						point.y < sy + sh
					) {
						this.pixel(x, y, color);
					}
				}
			}
		}
	}

	traceRect(
		sx: number,
		sy: number,
		sw: number,
		sh: number,
		color: PackedColor,
		transform = Matrix3.identity
	) {
		if (transform.isIdentity()) {
			this.line(sx, sy, sx + sw, sy, color);
			this.line(sx + sw, sy, sx + sw, sy + sh, color);
			this.line(sx, sy + sh, sx + sw, sy + sh, color);
			this.line(sx, sy, sx, sy + sh, color);
		} else {
			const tl = transform.apply(sx, sy);
			const tr = transform.apply(sx + sw, sy);
			const bl = transform.apply(sx, sy + sh);
			const br = transform.apply(sx + sw, sy + sh);

			this.line(tl.x, tl.y, tr.x, tr.y, color);
			this.line(tr.x, tr.y, br.x, br.y, color);
			this.line(br.x, br.y, bl.x, bl.y, color);
			this.line(bl.x, bl.y, tl.x, tl.y, color);
		}
	}

	fillCirc(
		sx: number,
		sy: number,
		sr: number,
		color: PackedColor,
		transform = Matrix3.identity
	) {
		if (transform.isIdentity()) {
			let dx = sr;
			let dy = 0;
			let error = 1 - sr;

			while (dx >= dy) {
				this.line(-dx + sx, -dy + sy, -dx + sx, dy + sy, color);
				this.line(-dy + sx, -dx + sy, -dy + sx, dx + sy, color);
				this.line(dy + sx, -dx + sy, dy + sx, dx + sy, color);
				this.line(dx + sx, -dy + sy, dx + sx, dy + sy, color);

				dy++;

				if (error < 0) {
					error += 2 * dy + 1;
				} else {
					dx--;
					error += 2 * (dy - dx + 1);
				}
			}
		} else {
			const d = sr * 2 + 1;
			const bounds = transform.applyToRect(sx - d / 2, sy - d / 2, d, d);

			const inverse = transform.inv();

			for (
				let x = Math.floor(bounds.x);
				x < Math.ceil(bounds.x + bounds.width);
				x++
			) {
				for (
					let y = Math.floor(bounds.y);
					y < Math.ceil(bounds.y + bounds.height);
					y++
				) {
					const point = inverse.apply(x, y);
					const distance = Math.sqrt(
						(point.x - sx) ** 2 + (point.y - sy) ** 2
					);

					// Check if the inverted point is within the circle.
					if (distance <= d / 2) {
						// NOTE: For debugging it can be useful to visualize the transformed pixels using light values.
						// this.pixel(x, y, colors.fromHsl(0, 0, (point.x + point.y) / (this.width + this.height)));
						this.pixel(x, y, color);
					}
				}
			}
		}
	}

	traceCirc(
		sx: number,
		sy: number,
		sr: number,
		color: PackedColor,
		transform = Matrix3.identity
	) {
		if (transform.isIdentity()) {
			let dx = sr;
			let dy = 0;
			let error = 1 - sr;

			while (dx >= dy) {
				this.pixel(dx + sx, dy + sy, color);
				this.pixel(dy + sx, dx + sy, color);
				this.pixel(-dx + sx, dy + sy, color);
				this.pixel(-dy + sx, dx + sy, color);
				this.pixel(-dx + sx, -dy + sy, color);
				this.pixel(-dy + sx, -dx + sy, color);
				this.pixel(dx + sx, -dy + sy, color);
				this.pixel(dy + sx, -dx + sy, color);

				dy++;

				if (error < 0) {
					error += 2 * dy + 1;
				} else {
					dx--;
					error += 2 * (dy - dx + 1);
				}
			}
		} else {
			const d = sr * 2 + 1;
			const bounds = transform.applyToRect(sx - d / 2, sy - d / 2, d, d);

			const inverse = transform.inv();

			for (
				let x = Math.floor(bounds.x);
				x < Math.ceil(bounds.x + bounds.width);
				x++
			) {
				for (
					let y = Math.floor(bounds.y);
					y < Math.ceil(bounds.y + bounds.height);
					y++
				) {
					const point = inverse.apply(x, y);
					const distance = Math.sqrt(
						(point.x - sx) ** 2 + (point.y - sy) ** 2
					);

					if (Math.abs(distance - sr) < 0.58) {
						this.pixel(x, y, color);
					}
				}
			}
		}
	}

	fillTri(
		sx0: number,
		sy0: number,
		sx1: number,
		sy1: number,
		sx2: number,
		sy2: number,
		color: PackedColor,
		transform = Matrix3.identity
	) {
		const left = Math.min(sx0, sx1, sx2);
		const right = Math.max(sx0, sx1, sx2);
		const top = Math.min(sy0, sy1, sy2);
		const bottom = Math.max(sy0, sy1, sy2);

		if (transform.isIdentity()) {
			for (let x = Math.floor(left); x < Math.ceil(right); x++) {
				for (let y = Math.floor(top); y < Math.ceil(bottom); y++) {
					if (isPointInTri(x, y, sx0, sy0, sx1, sy1, sx2, sy2)) {
						this.pixel(x, y, color);
					}
				}
			}
		} else {
			const bounds = transform.applyToRect(
				left,
				top,
				right - left,
				bottom - top
			);

			const inverse = transform.inv();

			for (
				let x = Math.floor(bounds.x);
				x < Math.ceil(bounds.x + bounds.width);
				x++
			) {
				for (
					let y = Math.floor(bounds.y);
					y < Math.ceil(bounds.y + bounds.height);
					y++
				) {
					const point = inverse.apply(x, y);

					if (
						isPointInTri(
							point.x,
							point.y,
							sx0,
							sy0,
							sx1,
							sy1,
							sx2,
							sy2
						)
					) {
						this.pixel(x, y, color);
					}
				}
			}
		}
	}

	traceTri(
		sx0: number,
		sy0: number,
		sx1: number,
		sy1: number,
		sx2: number,
		sy2: number,
		color: PackedColor,
		transform = Matrix3.identity
	) {
		if (transform.isIdentity()) {
			this.line(sx0, sy0, sx1, sy1, color);
			this.line(sx1, sy1, sx2, sy2, color);
			this.line(sx2, sy2, sx0, sy0, color);
		} else {
			const p0 = transform.apply(sx0, sy0);
			const p1 = transform.apply(sx1, sy1);
			const p2 = transform.apply(sx2, sy2);

			this.line(p0.x, p0.y, p1.x, p1.y, color);
			this.line(p1.x, p1.y, p2.x, p2.y, color);
			this.line(p2.x, p2.y, p0.x, p0.y, color);
		}
	}
}

export class VirtualScreen {
	virtual = true;
	canvas: OffscreenCanvas;
	context: OffscreenCanvasRenderingContext2D;

	constructor(
		public width: number,
		public height: number,
		public image = new ImageData(width, height)
	) {
		this.canvas = new OffscreenCanvas(width, height);
		this.context = this.canvas.getContext("2d")!;
	}

	commit() {
		this.context.putImageData(this.image, 0, 0);
	}

	clear() {
		for (let i = 0; i < this.image.data.length; i += 4) {
			this.image.data[i + 0] = 0;
			this.image.data[i + 1] = 0;
			this.image.data[i + 2] = 0;
			this.image.data[i + 3] = 255;
		}
	}

	pixel(x: number, y: number, color: PackedColor) {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;

		const [r, g, b, a] = unpack(color);

		x |= 0;
		y |= 0;

		const index = (y * this.width + x) * 4;

		if (a === 255) {
			this.image.data[index + 0] = r;
			this.image.data[index + 1] = g;
			this.image.data[index + 2] = b;
			this.image.data[index + 3] = a;
		} else if (a > 0) {
			const result = unpack(
				blend(
					pack(
						this.image.data[index + 0],
						this.image.data[index + 1],
						this.image.data[index + 2],
						this.image.data[index + 3]
					),
					color
				)
			);

			this.image.data[index + 0] = result[0];
			this.image.data[index + 1] = result[1];
			this.image.data[index + 2] = result[2];
			this.image.data[index + 3] = result[3];
		}
	}

	pixelUnpacked(
		x: number,
		y: number,
		r: number,
		g: number,
		b: number,
		a: number
	) {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;

		x |= 0;
		y |= 0;

		const index = (y * this.width + x) * 4;

		if (a === 255) {
			this.image.data[index + 0] = r;
			this.image.data[index + 1] = g;
			this.image.data[index + 2] = b;
			this.image.data[index + 3] = a;
		} else if (a > 0) {
			const result = unpack(
				blend(
					pack(
						this.image.data[index + 0],
						this.image.data[index + 1],
						this.image.data[index + 2],
						this.image.data[index + 3]
					),
					pack(r, g, b, a)
				)
			);

			this.image.data[index + 0] = result[0];
			this.image.data[index + 1] = result[1];
			this.image.data[index + 2] = result[2];
			this.image.data[index + 3] = result[3];
		}
	}

	blit(source: ImageData, x = 0, y = 0) {
		for (let sy = 0; sy < source.height; sy++) {
			if (sy + y < 0 || sy + y >= this.height) {
				continue;
			}

			for (let sx = 0; sx < source.width; sx++) {
				if (sx + x < 0 || sx + x >= this.width) {
					continue;
				}

				const sIndex = (sy * source.width + sx) * 4;

				this.pixelUnpacked(
					sx + x,
					sy + y,
					source.data[sIndex + 0],
					source.data[sIndex + 1],
					source.data[sIndex + 2],
					source.data[sIndex + 3]
				);
			}
		}
	}

	blitMask(source: ImageData, mask: ImageData, x = 0, y = 0) {
		for (let sy = 0; sy < source.height; sy++) {
			if (sy + y < 0 || sy + y >= this.height) {
				continue;
			}

			for (let sx = 0; sx < source.width; sx++) {
				if (sx + x < 0 || sx + x >= this.width) {
					continue;
				}

				const mIndex = (sy * mask.width + sx) * 4;

				if (mIndex + 3 >= mask.data.length) {
					continue;
				}

				const sIndex = (sy * source.width + sx) * 4;

				if (
					mask.data[mIndex] === 255 &&
					mask.data[mIndex + 1] === 255 &&
					mask.data[mIndex + 2] === 255 &&
					mask.data[mIndex + 3] === 255
				) {
					this.pixelUnpacked(
						sx + x,
						sy + y,
						source.data[sIndex + 0],
						source.data[sIndex + 1],
						source.data[sIndex + 2],
						source.data[sIndex + 3]
					);
				}
			}
		}
	}

	line(x0: number, y0: number, x1: number, y1: number, color: PackedColor) {
		if (x0 - x1 === 0) {
			for (let y = y0; y <= y1; y++) {
				this.pixel(x0, y, color);
			}

			return;
		}

		if (y0 - y1 === 0) {
			for (let x = x0; x <= x1; x++) {
				this.pixel(x, y0, color);
			}

			return;
		}

		if (x0 > x1) {
			[x0, x1] = [x1, x0];
			[y0, y1] = [y1, y0];
		}

		const slope = (y1 - y0) / (x1 - x0);

		if (slope === 1) {
			if (y0 > y1) {
				for (let x = x0, y = y0; x <= x1; x++, y--) {
					this.pixel(x, y, color);
				}

				return;
			} else {
				for (let x = x0, y = y0; x <= x1; x++, y++) {
					this.pixel(x, y, color);
				}

				return;
			}
		}

		if (slope === -1) {
			if (y0 > y1) {
				for (let x = x0, y = y0; x <= x1; x++, y--) {
					this.pixel(x, y, color);
				}

				return;
			} else {
				for (let x = x0, y = y0; x <= x1; x++, y++) {
					this.pixel(x, y, color);
				}

				return;
			}
		}

		const dx = Math.abs(x1 - x0);
		const dy = Math.abs(y1 - y0);
		const sx = Math.sign(x1 - x0);
		const sy = Math.sign(y1 - y0);
		let err = dx - dy;

		while (true) {
			this.pixel(x0, y0, color);

			if (x0 === x1 && y0 === y1) {
				return;
			}

			const e2 = 2 * err;

			if (e2 > -dy) {
				err -= dy;
				x0 += sx;
			}
			if (e2 < dx) {
				err += dx;
				y0 += sy;
			}
		}
	}

	fillRect(
		sx: number,
		sy: number,
		sw: number,
		sh: number,
		color: PackedColor,
		transform = Matrix3.identity
	) {
		if (transform.isIdentity()) {
			for (let x = sx; x < sx + sw; x++) {
				for (let y = sy; y < sy + sh; y++) {
					this.pixel(x, y, color);
				}
			}
		} else {
			const bounds = transform.applyToRect(sx, sy, sw, sh);

			const inverse = transform.inv();

			for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
				for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
					const point = inverse.apply(x, y);

					// Check if the inverted point is within the rectangle.
					if (
						point.x >= sx &&
						point.x < sx + sw &&
						point.y >= sy &&
						point.y < sy + sh
					) {
						this.pixel(x, y, color);
					}
				}
			}
		}
	}

	traceRect(
		sx: number,
		sy: number,
		sw: number,
		sh: number,
		color: PackedColor,
		transform = Matrix3.identity
	) {
		if (transform.isIdentity()) {
			this.line(sx, sy, sx + sw, sy, color);
			this.line(sx + sw, sy, sx + sw, sy + sh, color);
			this.line(sx, sy + sh, sx + sw, sy + sh, color);
			this.line(sx, sy, sx, sy + sh, color);
		} else {
			const tl = transform.apply(sx, sy);
			const tr = transform.apply(sx + sw, sy);
			const bl = transform.apply(sx, sy + sh);
			const br = transform.apply(sx + sw, sy + sh);

			this.line(tl.x, tl.y, tr.x, tr.y, color);
			this.line(tr.x, tr.y, br.x, br.y, color);
			this.line(br.x, br.y, bl.x, bl.y, color);
			this.line(bl.x, bl.y, tl.x, tl.y, color);
		}
	}

	fillCirc(
		sx: number,
		sy: number,
		sr: number,
		color: PackedColor,
		transform = Matrix3.identity
	) {
		if (transform.isIdentity()) {
			let dx = sr;
			let dy = 0;
			let error = 1 - sr;

			while (dx >= dy) {
				this.line(-dx + sx, -dy + sy, -dx + sx, dy + sy, color);
				this.line(-dy + sx, -dx + sy, -dy + sx, dx + sy, color);
				this.line(dy + sx, -dx + sy, dy + sx, dx + sy, color);
				this.line(dx + sx, -dy + sy, dx + sx, dy + sy, color);

				dy++;

				if (error < 0) {
					error += 2 * dy + 1;
				} else {
					dx--;
					error += 2 * (dy - dx + 1);
				}
			}
		} else {
			const d = sr * 2 + 1;
			const bounds = transform.applyToRect(sx - d / 2, sy - d / 2, d, d);

			const inverse = transform.inv();

			for (
				let x = Math.floor(bounds.x);
				x < Math.ceil(bounds.x + bounds.width);
				x++
			) {
				for (
					let y = Math.floor(bounds.y);
					y < Math.ceil(bounds.y + bounds.height);
					y++
				) {
					const point = inverse.apply(x, y);
					const distance = Math.sqrt(
						(point.x - sx) ** 2 + (point.y - sy) ** 2
					);

					// Check if the inverted point is within the circle.
					if (distance <= d / 2) {
						// NOTE: For debugging it can be useful to visualize the transformed pixels using light values.
						// this.pixel(x, y, colors.fromHsl(0, 0, (point.x + point.y) / (this.width + this.height)));
						this.pixel(x, y, color);
					}
				}
			}
		}
	}

	traceCirc(
		sx: number,
		sy: number,
		sr: number,
		color: PackedColor,
		transform = Matrix3.identity
	) {
		if (transform.isIdentity()) {
			let dx = sr;
			let dy = 0;
			let error = 1 - sr;

			while (dx >= dy) {
				this.pixel(dx + sx, dy + sy, color);
				this.pixel(dy + sx, dx + sy, color);
				this.pixel(-dx + sx, dy + sy, color);
				this.pixel(-dy + sx, dx + sy, color);
				this.pixel(-dx + sx, -dy + sy, color);
				this.pixel(-dy + sx, -dx + sy, color);
				this.pixel(dx + sx, -dy + sy, color);
				this.pixel(dy + sx, -dx + sy, color);

				dy++;

				if (error < 0) {
					error += 2 * dy + 1;
				} else {
					dx--;
					error += 2 * (dy - dx + 1);
				}
			}
		} else {
			const d = sr * 2 + 1;
			const bounds = transform.applyToRect(sx - d / 2, sy - d / 2, d, d);

			const inverse = transform.inv();

			for (
				let x = Math.floor(bounds.x);
				x < Math.ceil(bounds.x + bounds.width);
				x++
			) {
				for (
					let y = Math.floor(bounds.y);
					y < Math.ceil(bounds.y + bounds.height);
					y++
				) {
					const point = inverse.apply(x, y);
					const distance = Math.sqrt(
						(point.x - sx) ** 2 + (point.y - sy) ** 2
					);

					if (Math.abs(distance - sr) < 0.58) {
						this.pixel(x, y, color);
					}
				}
			}
		}
	}

	fillTri(
		sx0: number,
		sy0: number,
		sx1: number,
		sy1: number,
		sx2: number,
		sy2: number,
		color: PackedColor,
		transform = Matrix3.identity
	) {
		const left = Math.min(sx0, sx1, sx2);
		const right = Math.max(sx0, sx1, sx2);
		const top = Math.min(sy0, sy1, sy2);
		const bottom = Math.max(sy0, sy1, sy2);

		if (transform.isIdentity()) {
			for (let x = Math.floor(left); x < Math.ceil(right); x++) {
				for (let y = Math.floor(top); y < Math.ceil(bottom); y++) {
					if (isPointInTri(x, y, sx0, sy0, sx1, sy1, sx2, sy2)) {
						this.pixel(x, y, color);
					}
				}
			}
		} else {
			const bounds = transform.applyToRect(
				left,
				top,
				right - left,
				bottom - top
			);

			const inverse = transform.inv();

			for (
				let x = Math.floor(bounds.x);
				x < Math.ceil(bounds.x + bounds.width);
				x++
			) {
				for (
					let y = Math.floor(bounds.y);
					y < Math.ceil(bounds.y + bounds.height);
					y++
				) {
					const point = inverse.apply(x, y);

					if (
						isPointInTri(
							point.x,
							point.y,
							sx0,
							sy0,
							sx1,
							sy1,
							sx2,
							sy2
						)
					) {
						this.pixel(x, y, color);
					}
				}
			}
		}
	}

	traceTri(
		sx0: number,
		sy0: number,
		sx1: number,
		sy1: number,
		sx2: number,
		sy2: number,
		color: PackedColor,
		transform = Matrix3.identity
	) {
		if (transform.isIdentity()) {
			this.line(sx0, sy0, sx1, sy1, color);
			this.line(sx1, sy1, sx2, sy2, color);
			this.line(sx2, sy2, sx0, sy0, color);
		} else {
			const p0 = transform.apply(sx0, sy0);
			const p1 = transform.apply(sx1, sy1);
			const p2 = transform.apply(sx2, sy2);

			this.line(p0.x, p0.y, p1.x, p1.y, color);
			this.line(p1.x, p1.y, p2.x, p2.y, color);
			this.line(p2.x, p2.y, p0.x, p0.y, color);
		}
	}
}

export class Sprite {
	// @ts-expect-error
	image: ImageData;

	constructor(
		public asset: Aseprite,
		public frame = 0,
		public subregion: Rect = {
			x: 0,
			y: 0,
			width: asset.width,
			height: asset.height,
		}
	) {
		this.update();
	}

	static fromArrayBuffer(arrayBuffer: ArrayBuffer) {
		const aseprite = new Aseprite(arrayBuffer);

		return new Sprite(aseprite);
	}

	get width() {
		return this.subregion.width;
	}

	get height() {
		return this.subregion.height;
	}

	update() {
		this.image = new ImageData(this.subregion.width, this.subregion.height);

		const frame = this.asset.frames[this.frame];

		if (!frame) {
			console.error(`Frame ${this.frame} does not exist.`);
			return;
		}

		const transparent = this.asset.palette[0];

		for (let x = 0; x < this.subregion.width; x++) {
			for (let y = 0; y < this.subregion.height; y++) {
				for (let i = frame.layers.length - 1; i >= 0; i--) {
					const layer = frame.layers[i];
					let rendered = false;

					for (let j = layer.cels.length - 1; j >= 0; j--) {
						const cel = layer.cels[j];

						const dx = x + this.subregion.x - cel.x;
						const dy = y + this.subregion.y - cel.y;

						if (
							dy < 0 ||
							dy >= cel.height ||
							dx < 0 ||
							dx >= cel.width
						) {
							continue;
						}

						const pixel = cel.pixels[dy * cel.width + dx];
						const index = y * this.subregion.width + x;
						const [r, g, b, a] = unpack(
							fromAsepritePixel(this.asset, pixel)
						);

						if (
							a === 0 ||
							(this.asset.header.depth !==
								AsepriteColorDepth.Index &&
								transparent &&
								transparent.red === r &&
								transparent.green === g &&
								transparent.blue === b) ||
							(this.asset.header.depth !==
								AsepriteColorDepth.Index &&
								!transparent &&
								r === 0 &&
								g === 0 &&
								b === 0) ||
							(this.asset.header.depth ===
								AsepriteColorDepth.Index &&
								pixel === 0)
						) {
							continue;
						}

						this.image.data[index * 4 + 0] = r;
						this.image.data[index * 4 + 1] = g;
						this.image.data[index * 4 + 2] = b;
						this.image.data[index * 4 + 3] = a;

						rendered = true;
					}

					if (rendered) {
						break;
					}
				}
			}
		}
	}

	render(
		screen: Surface,
		sx: number,
		sy: number,
		transform = Matrix3.identity
	) {
		if (transform.isIdentity()) {
			for (let x = 0; x < this.subregion.width; x++) {
				for (let y = 0; y < this.subregion.height; y++) {
					const index = (y * this.subregion.width + x) * 4;
					if (this.image.data[index + 3] === 0) {
						continue;
					}

					screen.pixelUnpacked(
						x + sx,
						y + sy,
						this.image.data[index + 0],
						this.image.data[index + 1],
						this.image.data[index + 2],
						this.image.data[index + 3]
					);
				}
			}
		} else {
			const bounds = transform.applyToRect(
				sx,
				sy,
				this.subregion.width,
				this.subregion.height
			);

			const inverse = transform.inv();

			for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
				for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
					const point = inverse.apply(x, y);

					if (
						point.x >= sx &&
						point.x < sx + this.subregion.width &&
						point.y >= sy &&
						point.y < sy + this.subregion.height
					) {
						const index =
							(Math.floor(point.y - sy) * this.subregion.width +
								Math.floor(point.x - sx)) *
							4;

						if (this.image.data[index + 3] === 0) {
							continue;
						}

						screen.pixelUnpacked(
							x,
							y,
							this.image.data[index + 0],
							this.image.data[index + 1],
							this.image.data[index + 2],
							this.image.data[index + 3]
						);
					}
				}
			}
		}
	}
}

export class AnimatedSprite extends Sprite {
	// @ts-expect-error
	image: ImageData;

	duration = 0;

	start: number;
	end: number;

	animation?: string;
	direction: AsepriteTagAnimationDirection =
		AsepriteTagAnimationDirection.Forward;
	repeat: number = 0;
	iterations = 0;
	playing = false;

	constructor(
		public asset: Aseprite,
		public frame = 0,
		public subregion: Rect = {
			x: 0,
			y: 0,
			width: asset.width,
			height: asset.height,
		}
	) {
		super(asset, frame, subregion);

		this.start = 0;
		this.end = asset.frames.length - 1;

		this.update();
	}

	static fromArrayBuffer(arrayBuffer: ArrayBuffer) {
		const aseprite = new Aseprite(arrayBuffer);

		return new AnimatedSprite(aseprite);
	}

	get width() {
		return this.subregion.width;
	}

	get height() {
		return this.subregion.height;
	}

	pause() {
		this.playing = false;
	}

	play() {
		this.playing = true;
	}

	setAnimation(animation?: string) {
		this.iterations = 0;
		this.duration = 0;
		this.animation = animation;

		if (animation) {
			const tag = this.asset.tags.find((tag) => tag.name === animation);

			if (tag) {
				if (
					tag.direction === AsepriteTagAnimationDirection.Reverse ||
					tag.direction ===
						AsepriteTagAnimationDirection.PingPongReverse
				) {
					this.frame = tag.to;
				} else {
					this.frame = tag.from;
				}

				this.start = tag.from;
				this.end = tag.to;

				this.direction = tag.direction;
				this.repeat = tag.repeat;
			} else {
				console.error(`Animation ${animation} does not exist.`);
			}
		} else {
			this.start = 0;
			this.end = this.asset.frames.length - 1;
		}
	}

	update(dt: DeltaTime = 0 as DeltaTime) {
		this.duration += dt;

		while (this.duration >= this.asset.frames[this.frame].duration) {
			this.duration -= this.asset.frames[this.frame].duration;

			if (!this.playing) {
				continue;
			}

			if (this.repeat !== 0 && this.iterations >= this.repeat) {
				this.playing = false;
				continue;
			}

			switch (this.direction) {
				case AsepriteTagAnimationDirection.Forward:
					this.frame++;

					if (this.frame > this.end) {
						this.iterations++;
						this.frame = this.start;
					}
					break;
				case AsepriteTagAnimationDirection.Reverse:
					this.frame--;

					if (this.frame < this.start) {
						this.iterations++;
						this.frame = this.end;
					}
					break;
				case AsepriteTagAnimationDirection.PingPong:
					if (this.iterations % 2 === 0) {
						this.frame++;

						if (this.frame > this.end) {
							this.iterations++;
							this.frame = this.end;
						}
					} else {
						this.frame--;

						if (this.frame < this.start) {
							this.iterations++;
							this.frame = this.start;
						}
					}
					break;
				case AsepriteTagAnimationDirection.PingPongReverse:
					if (this.iterations % 2 !== 0) {
						this.frame++;

						if (this.frame > this.end) {
							this.iterations++;
							this.frame = this.end;
						}
					} else {
						this.frame--;

						if (this.frame < this.start) {
							this.iterations++;
							this.frame = this.start;
						}
					}

					break;
			}
		}

		super.update();
	}
}

export class SpriteSheet {
	rows: number;
	cols: number;

	sprites: Sprite[] = [];

	constructor(public asset: Aseprite) {
		const width = this.asset.width - this.asset.header.grid.x;
		const height = this.asset.height - this.asset.header.grid.y;

		this.rows = Math.floor(height / this.asset.header.grid.height);
		this.cols = Math.floor(width / this.asset.header.grid.width);

		this.init();
	}

	static fromArrayBuffer(arrayBuffer: ArrayBuffer) {
		const aseprite = new Aseprite(arrayBuffer);

		return new SpriteSheet(aseprite);
	}

	init() {
		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.cols; x++) {
				const subregion = {
					x: x * this.asset.header.grid.width,
					y: y * this.asset.header.grid.height,
					width: this.asset.header.grid.width,
					height: this.asset.header.grid.height,
				};
				this.sprites.push(new Sprite(this.asset, 0, subregion));
			}
		}
	}

	update() {
		for (const sprite of this.sprites) {
			sprite.update();
		}
	}
}

export class AnimatedSpriteSheet {
	rows: number;
	cols: number;

	sprites: AnimatedSprite[] = [];

	static fromArrayBuffer(arrayBuffer: ArrayBuffer) {
		const aseprite = new Aseprite(arrayBuffer);

		return new AnimatedSpriteSheet(aseprite);
	}

	constructor(public asset: Aseprite) {
		const width = this.asset.width - this.asset.header.grid.x;
		const height = this.asset.height - this.asset.header.grid.y;

		this.rows = Math.floor(height / this.asset.header.grid.height);
		this.cols = Math.floor(width / this.asset.header.grid.width);

		this.init();
	}

	init() {
		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.cols; x++) {
				const subregion: Rect = {
					x: x * this.asset.header.grid.width,
					y: y * this.asset.header.grid.height,
					width: this.asset.header.grid.width,
					height: this.asset.header.grid.height,
				};
				this.sprites.push(new AnimatedSprite(this.asset, 0, subregion));
			}
		}
	}

	update(dt: DeltaTime = 0 as DeltaTime) {
		for (const sprite of this.sprites) {
			sprite.update(dt);
		}
	}
}

export const blit = (source: ImageData, target: ImageData, x = 0, y = 0) => {
	for (let sy = 0; sy < source.height; sy++) {
		if (sy + y < 0 || sy + y >= target.height) {
			continue;
		}

		for (let sx = 0; sx < source.width; sx++) {
			if (sx + x < 0 || sx + x >= target.width) {
				continue;
			}

			const sIndex = (sy * source.width + sx) * 4;
			const tIndex = ((sy + y) * target.width + (sx + x)) * 4;
			target.data[tIndex + 0] = source.data[sIndex + 0];
			target.data[tIndex + 1] = source.data[sIndex + 1];
			target.data[tIndex + 2] = source.data[sIndex + 2];
			target.data[tIndex + 3] = source.data[sIndex + 3];
		}
	}
};

export const blitMask = (
	source: ImageData,
	target: ImageData,
	mask: ImageData,
	x = 0,
	y = 0
) => {
	for (let sy = 0; sy < source.height; sy++) {
		if (sy + y < 0 || sy + y >= target.height) {
			continue;
		}

		for (let sx = 0; sx < source.width; sx++) {
			if (sx + x < 0 || sx + x >= target.width) {
				continue;
			}

			const mIndex = ((sy + y) * mask.width + (sx + x)) * 4;

			if (mIndex + 3 >= mask.data.length) {
				continue;
			}

			const sIndex = (sy * source.width + sx) * 4;
			const tIndex = ((sy + y) * target.width + (sx + x)) * 4;

			if (
				mask.data[mIndex] === 255 &&
				mask.data[mIndex + 1] === 255 &&
				mask.data[mIndex + 2] === 255 &&
				mask.data[mIndex + 3] === 255
			) {
				target.data[tIndex + 0] = source.data[sIndex + 0];
				target.data[tIndex + 1] = source.data[sIndex + 1];
				target.data[tIndex + 2] = source.data[sIndex + 2];
				target.data[tIndex + 3] = source.data[sIndex + 3];
			}
		}
	}
};
