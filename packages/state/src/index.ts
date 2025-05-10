export type Primitive =
	| string
	| number
	| boolean
	| null
	| undefined
	| object
	| Array<Primitive>;
export type AnyFunction = (...args: any[]) => any;

export type AtomBase = {
	id: number;
	children: Set<AnyAtom>;
	parents: Set<AnyAtom>;
};

export type ReadAtom<Value> = AtomBase & {
	value: Value;
};

export type DynamicReadAtom<Value> = AtomBase & {
	value: Value;
	read: (get: AtomGet) => Value;
};

export type DynamicReadWriteAtom<
	ReadValue,
	WriteValue,
	Args extends Array<unknown>
> = AtomBase & {
	value: ReadValue;
	read: (get: AtomGet) => ReadValue;
	write: (get: AtomGet, set: AtomSet, ...args: Args) => WriteValue;
};

export type ReadWriteAtom<
	ReadValue,
	WriteValue,
	Args extends Array<unknown>
> = AtomBase & {
	value: ReadValue;
	write: (get: AtomGet, set: AtomSet, ...args: Args) => WriteValue;
};

export type Atom<ReadValue, WriteValue, Args extends Array<unknown> = []> =
	| ReadAtom<ReadValue>
	| ReadWriteAtom<ReadValue, WriteValue, Args>
	| DynamicReadAtom<ReadValue>
	| DynamicReadWriteAtom<ReadValue, WriteValue, Args>;

export type AnyAtom = Atom<any, any, any>;
export type AnyReadAtom = ReadAtom<any>;
export type AnyReadWriteAtom = ReadWriteAtom<any, any, any>;

export type AtomReadValue<A> = A extends Atom<
	infer ReadValue,
	infer _WriteValue
>
	? ReadValue
	: never;

export type AtomWriteValue<A> = A extends Atom<
	infer _ReadValue,
	infer WriteValue
>
	? WriteValue
	: never;

export type AtomGet = <A>(
	atom: A
) => A extends Atom<infer ReadValue, infer _WriteValue> ? ReadValue : never;

export type DynamicReader = <Value>(get: AtomGet) => Value;

export type AtomSet = {
	<ReadValue, A extends ReadAtom<ReadValue>>(atom: A, value: ReadValue): void;

	<
		ReadValue,
		WriteValue,
		Args extends Array<unknown>,
		A extends DynamicReadWriteAtom<ReadValue, WriteValue, Args>
	>(
		atom: A,
		...args: A extends ReadWriteAtom<
			infer _ReadValue,
			infer _WriteValue,
			infer Args
		>
			? Args
			: never
	): A extends DynamicReadWriteAtom<
		infer _ReadValue,
		infer WriteValue,
		infer _Args
	>
		? WriteValue
		: never;

	<
		ReadValue,
		WriteValue,
		Args extends Array<unknown>,
		A extends ReadWriteAtom<ReadValue, WriteValue, Args>
	>(
		atom: A,
		...args: A extends ReadWriteAtom<
			infer _ReadValue,
			infer _WriteValue,
			infer _Args
		>
			? Args
			: never
	): A extends ReadWriteAtom<infer _ReadValue, infer WriteValue, infer _Args>
		? WriteValue
		: never;
};

export type AtomWriter = <Value, Args extends Array<unknown>>(
	get: AtomGet,
	set: AtomSet,
	...args: Args
) => Value;

export type AtomFactory = {
	<Reader extends (get: AtomGet) => any>(reader: Reader): Reader extends (
		get: AtomGet
	) => infer Value
		? DynamicReadAtom<Value>
		: never;
	<
		Reader extends (get: AtomGet) => any,
		Writer extends (get: AtomGet, set: AtomSet, ...args: Array<any>) => any
	>(
		reader: Reader,
		writer: Writer
	): Reader extends (get: AtomGet) => infer ReadValue
		? Writer extends (
				get: AtomGet,
				set: AtomSet,
				...args: infer Args
		  ) => infer Resolved
			? DynamicReadWriteAtom<ReadValue, Resolved, Args>
			: never
		: never;
	<
		ReadValue,
		Writer extends (get: AtomGet, set: AtomSet, ...args: Array<any>) => any
	>(
		reader: ReadValue,
		writer: Writer
	): ReadValue extends Primitive
		? Writer extends (
				get: AtomGet,
				set: AtomSet,
				...args: infer Args
		  ) => infer Resolved
			? ReadWriteAtom<ReadValue, Resolved, Args>
			: never
		: never;
	<Value>(reader: Value): Value extends Primitive ? ReadAtom<Value> : never;
};

export class Store {
	id = 0;
	queue: Array<AnyAtom> = [];

	// @ts-expect-error
	atom: AtomFactory = (
		reader: Primitive | (<T>(get: AtomGet) => T),
		writer?: (get: AtomGet, set: AtomSet, ...args: Array<any>) => any
	) => {
		const atom: AtomBase = {
			id: this.id++,
			children: new Set(),
			parents: new Set(),
		};

		if (typeof reader === "function") {
			// @ts-expect-error
			const get: AtomGet = (child: AnyReadAtom) => {
				atom.children.add(child);
				child.parents.add(atom as AnyAtom);

				return this.get(child);
			};

			// @ts-expect-error
			(atom as DynamicReadAtom<any>).read = reader;
			(atom as DynamicReadAtom<any>).value = reader(get);
		} else {
			(atom as ReadAtom<any>).value = reader;
		}

		if (writer !== undefined) {
			(atom as ReadWriteAtom<any, any, any>).write = writer;
		}

		return atom as AnyAtom;
	};

	// @ts-expect-error
	get: AtomGet = (atom: AnyReadAtom) => {
		return atom.value;
	};

	set: AtomSet = (
		atom: AnyReadAtom | AnyReadWriteAtom,
		...args: Array<unknown>
	) => {
		let value: unknown = undefined;

		if (atom.hasOwnProperty("write")) {
			value = (atom as AnyReadWriteAtom).write(
				this.get,
				this.set,
				...args
			);
		} else if (atom.hasOwnProperty("read")) {
			throw new Error("Cannot set a dynamic read atom");
		} else {
			atom.value = args[0];
		}

		for (const parent of atom.parents) {
			this.queue.push(parent);
		}

		this.update();

		return value;
	};

	update = () => {
		while (this.queue.length > 0) {
			const atom = this.queue.shift()!;

			const previous = atom.value;

			if (!atom.hasOwnProperty("read")) {
				throw new Error("Cannot dynamically update non-dynamic atom");
			}

			const next = (atom as DynamicReadAtom<any>).read(this.get);

			if (previous === next) {
				continue;
			}

			atom.value = next;

			for (const parent of atom.parents) {
				this.queue.unshift(parent);
			}
		}
	};
}

export const ROOT_STORE = new Store();

export const atom = ROOT_STORE.atom;
export const get = ROOT_STORE.get;
export const set = ROOT_STORE.set;
export const update = ROOT_STORE.update;
