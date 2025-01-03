# @pixelation/focus

> Focus management for the Pixelation Engine.

## Installation

```shell
npm install @pixelation/focus
```

## Usage

```ts
import * as engine from "@pixelation/engine";

// To start using this package, import it into your code.
import * as Focus from "@pixelation/focus";
```

### Locking

All focus managers implement a locking interface to allow for restricting focus changes. This is useful
for preventing a user input from applying actions outside of an interactive element such as a text input.

```ts
// Any focus manager can be used.
const focus: LinearFocus | CardinalFocus | GraphFocus;

// Check whether the focus is currently locked.
focus.locked;

// Lock the current item as being focused. Any attempt to change the item will fail.
// If the focus was already locked, this method will return `false`.
focus.lock();

// Unlock the focus to allow changes again.
focus.unlock();
```

### Linear Focus

Linear focus is useful for a single list of items that should be focused in order. This list can optionally wrap around from the end to the beginning.

```ts
import { LinearFocus } from "@pixelation/focus";

const boxes = Array.from({ length: 5 }, (_, i) => ({
    x: 10 + i * 40,
    y: 10,
    width: 30,
    height: 30,
}));

const focus = new LinearFocus(
    // The items you want to manage focus for.
    boxes,
    // Whether focus should wrap.
    true
);

// Move to the next or previous entry in the focus list.
focus.next();
focus.prev();

// Get the currently focused item.
focus.current;

// Set the currently focused item.
focus.current = boxes[3];
```

### Cardinal Focus

Cardinal focus is useful for simple grids that should allow focus to flow between connected cells. Focus can optionally wrap around the grid.

```ts
import {
    CardinalFocus,
    CardinalGrid,
    CardinalDirection,
} from "@pixelation/focus";

interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}

const createBox = (row: number, col: number): Box => ({
    x: 10 + col * 40,
    y: 10 + row * 40,
    width: 30,
    height: 30,
});

const boxes: CardinalGrid<Box> = Array.from({ length: 5 }, (_, row) => {
    return Array.from({ length: 5 }, (_, col) => createBox(row, col));
});

const focus = new CardinalFocus(boxes, true);

// Move to an adjacent cell.
focus.move(CardinalDirection.North);
// Or move to an adjacent cell using a shorthand.
focus.north();
focus.east();
focus.south();
focus.west();

// Get the currently focused item.
focus.current;

// Set the currently focused item.
focus.current = boxes[0][3];
```

### Graph Focus

Graph focus can be used to create complex flows that do not fit into either linear or grid-based classifications. This focus manager requires more work from the implementer to handle deciding which item to transition to, but will help keep the data structure in place and provide an easy way to get or set the currently focused item.

```ts
import { GraphFocus, GraphItem } from "@pixelation/focus";

interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}

const rows = 3;
const cols = 5;
const boxes = Array.from(
    { length: rows * cols },
    (_, i): GraphItem<Box> => ({
        value: {
            x: 10 + (i % cols) * 40,
            y: 10 + Math.floor(i / cols) * 40,
            width: 30,
            height: 30,
        },
        edges: [],
    })
);

// Make some holes in the box grid.
boxes.splice(3, 1);
boxes.splice(5, 1);
boxes.splice(9, 2);

// Add connection for each box. The meaning here is up to the implementer. In this example the
// edges will represent a connection in a cardinal direction (north, east, south, west).
boxes[0].edges.push(null, boxes[1], boxes[4], null);
boxes[1].edges.push(null, boxes[2], null, boxes[0]);
boxes[2].edges.push(null, boxes[3], boxes[5], boxes[1]);
boxes[3].edges.push(null, null, boxes[7], boxes[2]);
boxes[4].edges.push(boxes[0], boxes[5], boxes[8], null);
boxes[5].edges.push(boxes[2], boxes[6], null, boxes[4]);
boxes[6].edges.push(null, boxes[7], boxes[9], boxes[5]);
boxes[7].edges.push(boxes[3], null, boxes[10], boxes[6]);
boxes[8].edges.push(boxes[4], boxes[9], null, null);
boxes[9].edges.push(boxes[6], boxes[10], null, boxes[8]);
boxes[10].edges.push(boxes[7], null, null, boxes[9]);

// Construct the focus manager.
const focus = new GraphFocus(boxes);

// Focus must be set manually.
const focused = focus.current;

const east = focused.edges[1];

if (east) {
    focused.current = east;
}
```
