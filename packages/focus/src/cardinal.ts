export enum CardinalDirection {
	North,
	East,
	South,
	West,
}

export type CardinalGrid<T> = T[][];

export class CardinalFocus<T> {
	public locked = false;
	private row = 0;
	private col = 0;

	constructor(public items: CardinalGrid<T>, public wrap: boolean = false) {}

	lock() {
		if (this.locked) {
			return false;
		}

		this.locked = true;

		return true;
	}

	unlock() {
		if (this.locked) {
			this.locked = false;
		}

		return true;
	}

	get current() {
		return this.items[this.row][this.col];
	}

	set current(value) {
		if (this.locked) {
			return;
		}

		for (let row = 0; row < this.items.length; row++) {
			const col = this.items[row].indexOf(value);

			if (col !== -1) {
				this.row = row;
				this.col = col;

				return;
			}
		}
	}

	move(direction: CardinalDirection) {
		switch (direction) {
			case CardinalDirection.North:
				return this.north();
			case CardinalDirection.East:
				return this.east();
			case CardinalDirection.South:
				return this.south();
			case CardinalDirection.West:
				return this.west();
		}
	}

	north() {
		if (this.locked) {
			return false;
		}

		let row = this.row - 1;

		if (row < 0) {
			if (this.wrap) {
				row = this.items.length - 1;
			} else {
				row = 0;
			}
		}

		if (this.items[row][this.col]) {
			this.row = row;
			return true;
		} else {
			return false;
		}
	}

	east() {
		if (this.locked) {
			return false;
		}

		let col = this.col + 1;

		if (col >= this.items[this.row].length) {
			if (this.wrap) {
				col = 0;
			} else {
				col = this.items[this.row].length - 1;
			}
		}

		if (this.items[this.row][col]) {
			this.col = col;
			return true;
		} else {
			return false;
		}
	}

	south() {
		if (this.locked) {
			return false;
		}

		let row = this.row + 1;

		if (row >= this.items.length) {
			if (this.wrap) {
				row = 0;
			} else {
				row = this.items.length - 1;
			}
		}

		if (this.items[row][this.col]) {
			this.row = row;
			return true;
		} else {
			return false;
		}
	}

	west() {
		if (this.locked) {
			return false;
		}

		let col = this.col - 1;

		if (col < 0) {
			if (this.wrap) {
				col = this.items[this.row].length - 1;
			} else {
				col = 0;
			}
		}

		if (this.items[this.row][col]) {
			this.col = col;
			return true;
		} else {
			return false;
		}
	}
}
