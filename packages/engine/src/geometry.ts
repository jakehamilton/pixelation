export interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

export class Matrix3 {
	data: number[];

	constructor(values: number[] | number[][]) {
		if (values.length === 0) {
			throw new Error("Matrix3 requires 9 elements, but got none.");
		}

		if (Array.isArray(values[0])) {
			this.data = (values as number[][]).flat();
		} else {
			this.data = values as number[];
		}

		if (this.data.length !== 9) {
			throw new Error(
				`Matrix3 requires 9 elements, but got ${this.data.length}.`
			);
		}
	}

	static identity = new Matrix3([
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1],
	]);

	static fromTranslation(x: number, y: number) {
		return new Matrix3([
			[1, 0, x],
			[0, 1, y],
			[0, 0, 1],
		]);
	}

	static fromScale(x: number, y: number) {
		return new Matrix3([
			[x, 0, 0],
			[0, y, 0],
			[0, 0, 1],
		]);
	}

	static fromRotation(angle: number) {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		return new Matrix3([
			[cos, -sin, 0],
			[sin, cos, 0],
			[0, 0, 1],
		]);
	}

	static fromSkew(x: number, y: number) {
		return new Matrix3([
			[1, Math.tan(x), 0],
			[Math.tan(y), 1, 0],
			[0, 0, 1],
		]);
	}

	toString() {
		// prettier-ignore
		const [
			a, b, c,
			d, e, f,
			g, h, i
		] = this.data;

		const column0Length = Math.max(
			a.toString().length,
			d.toString().length,
			g.toString().length
		);
		const column1Length = Math.max(
			b.toString().length,
			e.toString().length,
			h.toString().length
		);
		const column2Length = Math.max(
			c.toString().length,
			f.toString().length,
			i.toString().length
		);

		const row0 = `${a.toString().padEnd(column0Length)} ${b
			.toString()
			.padEnd(column1Length)} ${c.toString().padEnd(column2Length)}`;
		const row1 = `${d.toString().padEnd(column0Length)} ${e
			.toString()
			.padEnd(column1Length)} ${f.toString().padEnd(column2Length)}`;
		const row2 = `${g.toString().padEnd(column0Length)} ${h
			.toString()
			.padEnd(column1Length)} ${i.toString().padEnd(column2Length)}`;

		const rowLength = row0.length;

		return `┌ ${" ".repeat(
			rowLength
		)} ┐\n│ ${row0} │\n│ ${row1} │\n│ ${row2} │\n└ ${" ".repeat(
			rowLength
		)} ┘`;
	}

	isIdentity() {
		if (this === Matrix3.identity) return true;

		const [a, b, c, d, e, f, g, h, i] = this.data;

		return (
			a === 1 &&
			b === 0 &&
			c === 0 &&
			d === 0 &&
			e === 1 &&
			f === 0 &&
			g === 0 &&
			h === 0 &&
			i === 1
		);
	}

	mul(other: Matrix3) {
		const a = this.data;
		const b = other.data;
		const c = [
			a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
			a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
			a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
			a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
			a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
			a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
			a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
			a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
			a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
		];
		return new Matrix3(c);
	}

	translate(x: number, y: number) {
		return new Matrix3([
			[1, 0, x],
			[0, 1, y],
			[0, 0, 1],
		]).mul(this);
	}

	scale(x: number, y: number) {
		return new Matrix3([
			[x, 0, 0],
			[0, y, 0],
			[0, 0, 1],
		]).mul(this);
	}

	rotate(angle: number) {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		return new Matrix3([
			[cos, -sin, 0],
			[sin, cos, 0],
			[0, 0, 1],
		]).mul(this);
	}

	skew(x: number, y: number) {
		return new Matrix3([
			[1, Math.tan(x), 0],
			[Math.tan(y), 1, 0],
			[0, 0, 1],
		]).mul(this);
	}

	inv() {
		// prettier-ignore
		const [
			a, b, c,
			d, e, f,
			g, h, i
		] = this.data;

		const det =
			a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);

		if (det === 0) {
			// TODO: It may be better to return an identity matrix here and simply log an error in the console so
			// that things don't explode.
			throw new Error("Matrix3 is not invertible.");
		}

		const invDet = 1 / det;

		return new Matrix3([
			(e * i - f * h) * invDet,
			(c * h - b * i) * invDet,
			(b * f - c * e) * invDet,
			(f * g - d * i) * invDet,
			(a * i - c * g) * invDet,
			(c * d - a * f) * invDet,
			(d * h - e * g) * invDet,
			(b * g - a * h) * invDet,
			(a * e - b * d) * invDet,
		]);
	}

	apply(x: number, y: number) {
		// prettier-ignore
		const [
			a, b, c,
			d, e, f,
			g, h, i
		] = this.data;

		return {
			x: a * x + b * y + c,
			y: d * x + e * y + f,
		};
	}

	applyToRect(x: number, y: number, width: number, height: number): Rect {
		const p1 = this.apply(x, y);
		const p2 = this.apply(x + width, y);
		const p3 = this.apply(x + width, y + height);
		const p4 = this.apply(x, y + height);

		const minX = Math.min(p1.x, p2.x, p3.x, p4.x);
		const maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
		const minY = Math.min(p1.y, p2.y, p3.y, p4.y);
		const maxY = Math.max(p1.y, p2.y, p3.y, p4.y);

		return {
			x: minX,
			y: minY,
			width: maxX - minX,
			height: maxY - minY,
		};
	}
}

export class Vector2 {
	constructor(public x: number, public y: number) {}

	add(other: Vector2) {
		return new Vector2(this.x + other.x, this.y + other.y);
	}

	sub(other: Vector2) {
		return new Vector2(this.x - other.x, this.y - other.y);
	}

	mul(scalar: number) {
		return new Vector2(this.x * scalar, this.y * scalar);
	}

	div(scalar: number) {
		return new Vector2(this.x / scalar, this.y / scalar);
	}

	mag() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	norm() {
		const magnitude = this.mag();
		return new Vector2(this.x / magnitude, this.y / magnitude);
	}
}

export const isPointInTri = (
	x: number,
	y: number,
	x0: number,
	y0: number,
	x1: number,
	y1: number,
	x2: number,
	y2: number
) => {
	const w1 =
		(x * (y2 - y0) - y * (x2 - x0) + x2 * y0 - y2 * x0) /
		((x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0));
	// const w2 = (x * (y0 - y1) - y * (x0 - x1) + x0 * y1 - y0 * x1) / ((x2 - x1) * (y0 - y1) - (y2 - y1) * (x0 - x1));

	// or we can get w2 in terms of w1
	const w2 = (y - y0 - w1 * (y1 - y0)) / (y2 - y0);

	if (w1 < 0 || w2 < 0) return false;
	if (w1 + w2 > 1) return false;
	return true;
};
