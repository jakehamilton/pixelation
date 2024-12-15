# @pixelation/text

> Basic text support for the Pixelation Engine.

## Installation

```shell
npm install @pixelation/text
```

## Usage

```ts
import * as engine from "@pixelation/engine";

// To start using this package, import it into your code.
import * as Text from "@pixelation/text";

// English text can be created by supplying:
// - The text content.
// - The maximum width of the text area.
// - The maximum height of the text area.
// - The font variation.
// - The whitespace strategy.
// - An optional color to render the text in.
const text = new Text.English(
    "My Text!",
    Infinity, // Infinity can be used for the width to allow any amount of text.
    Infinity, // Infinity can be used for the height to allow any amount of text.
    Text.Variation.Normal,
    Text.WhiteSpace.BreakWord,
    engine.colors.fromHex("#000000") // If a color is not supplied, a default will be used.
);
```

The following `Variation` values are available:

-   `Variation.Normal`: The default font style.
-   `Variation.Compact`: A smaller, more condensed font style.

The following `WhiteSpace` values are available:

-   `WhiteSpace.BreakAll`: Causes characters to move to the next line if they reach the maximum width, even in the middle of a word.
-   `WhiteSpace.BreakWord`: Causes characters to move to the next line if they reach the maximum width, but will never break up a word. Instead, the whole word will be moved to the next line if it were to overflow.
