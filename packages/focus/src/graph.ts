export interface GraphItem<T> {
	value: T;
	edges: Array<GraphItem<T> | null>;
}

export class GraphFocus<T> {
	public locked = false;
	private item: GraphItem<T>;

	constructor(public items: Array<GraphItem<T>>) {
		this.item = items[0];
	}

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
		return this.item;
	}

	set current(value) {
		if (this.locked) {
			return;
		}

		if (!this.items.includes(value)) {
			throw new Error(`Value "${value}" not found in focusable items.`);
		}

		this.item = value;
	}
}
