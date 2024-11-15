# @pixelation/aseprite

> A library for parsing Aseprite files.

## Installation

```shell
npm install @pixelation/aseprite
```

## Usage

To parse an Aseprite file, create a new instance of the `Aseprite` class with the file
provided as an array buffer.

```ts
import { Aseprite } from "@pixelation/aseprite";

const response = await fetch("./example.aseprite");
const file = await response.arrayBuffer();

const sprite = new Aseprite(file);
```

Sprite data is now accessible from this instance.

```ts
// Contains information about the whole file.
sprite.header;

// Contains information about each frame in the file.
sprite.frames;

// Contains the file's palette (if one exists).
sprite.palette;

// For example to work with each frame in the image.
for (const frame of sprite.frames) {
    // Do something with each frame...
}
```
