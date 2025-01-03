export class LinearFocus<T> {
	public locked = false;
	private index = 0;

	constructor(public items: T[], public wrap: boolean = false) {}

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
		return this.items[this.index];
	}

	set current(value) {
		if (this.locked) {
			return;
		}

		const index = this.items.indexOf(value);

		if (index === -1) {
			throw new Error(`Value "${value}" not found in focusable items.`);
		} else {
			this.index = index;
		}
	}

	next() {
		if (this.locked) {
			return false;
		}

		let index = this.index + 1;

		if (index >= this.items.length) {
			if (this.wrap) {
				index = 0;
			} else {
				index = this.items.length - 1;
			}
		}

		this.index = index;

		return true;
	}

	prev() {
		if (this.locked) {
			return false;
		}

		let index = this.index - 1;

		if (index < 0) {
			if (this.wrap) {
				index = this.items.length - 1;
			} else {
				index = 0;
			}
		}

		this.index = index;

		return true;
	}
}
