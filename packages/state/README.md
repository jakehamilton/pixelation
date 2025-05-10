# @pixelation/state

> Composable, reactive state management for the Pixelation Engine.

## Installation

```shell
npm install @pixelation/state
```

## Usage

```ts
import { atom, get, set } from "@pixelation/state";

// Create readable state.
const number = atom(0);

// Change an atom's value.
set(number, 42);

// Get an atom's value.
get(number); // 42

// Derive state from other atoms.
const derived = atom((get) => get(number) * 10);

// Get derived state just like normal state.
get(derived); // 420

// Create write actions for state that take over when `set` is called.
const reset = atom(null, (get, set) => {
    set(number, 0);

    return get(number);
});

// Call a write action.
set(reset);

// Write actions can accept arguments supplied through `set`.
const modify = atom(null, (get, set, value = 0) => {
    set(number, 0);

    return value;
});

// Call a write action with arguments.
set(reset, 9000);

// Write atoms can have derived state.
const double = atom(
    (get) => get(number) * 2,
    (get, set, value) => {
        let current = value;

        if (value === undefined) {
            current = get(number);
        }

        const result = current * 2;

        set(number, result);

        return result;
    }
);

// Interact with read/write atoms just like normal state.
set(double, 1); // 2
get(double); // 2
set(double); // 4
```

## Performance

> [!WARNING]
> Careful construction of the state graph is necessary for responsive games. This library does not
> perform cycle checking or try to optimize your state graph. It is the responsibility of the
> programmer using this library to ensure that the code your write is the code that runs.

This library propagates all state changes whenever a call to `set` is made. Via that call all
atoms which depend on the modified atom are queued to update. If any of those atoms change from
their previous value, the atoms that depend on it are added to the queue. This process repeats
until there are no more atoms to process.
