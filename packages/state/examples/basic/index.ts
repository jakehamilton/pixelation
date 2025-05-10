import { atom, get, set } from "../../src";

const a = atom(0);

const b = atom((get) => get(a) + 1);

const add = atom(null, (get, set, value: number) => {
	const current = get(a);

	set(a, current + value);
});

const doubleA = atom(
	(get) => get(a) * 2,
	(get, set) => {
		const current = get(a);

		set(a, current * 2);
	}
);

console.log({
	a: get(a),
	b: get(b),
});

set(a, 1);

console.log({
	a: get(a),
	b: get(b),
});

set(add, 1);

console.log({
	a: get(a),
	b: get(b),
});

set(doubleA);

console.log({
	a: get(a),
	b: get(b),
});
