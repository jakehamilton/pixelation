import { Aseprite } from "@pixelation/aseprite";
import { fromAsepritePixel, Color, PackedColor, unpack, pack } from "./colors";
import { isPointInTri, Matrix3, Rect } from "./geometry";

export type Surface = Screen | VirtualScreen;

export class Screen {
    virtual = false;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    constructor(
        public width: number,
        public height: number,
        public image = new ImageData(width, height)
    ) {
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("tabindex", "0");
        this.canvas.style.imageRendering = "pixelated";

        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext("2d")!;
        this.context.imageSmoothingEnabled = false;
    }

    commit() {
        this.context.putImageData(this.image, 0, 0);
    }

    clear() {
        for (let i = 0; i < this.image.data.length; i += 4) {
            this.image.data[i + 0] = 0;
            this.image.data[i + 1] = 0;
            this.image.data[i + 2] = 0;
            this.image.data[i + 3] = 255;
        }
    }

    pixel(x: number, y: number, color: PackedColor) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;

        x |= 0;
        y |= 0;

        const index = (y * this.width + x) * 4;

        const [r, g, b, a] = unpack(color);

        this.image.data[index + 0] = r;
        this.image.data[index + 1] = g;
        this.image.data[index + 2] = b;
        this.image.data[index + 3] = a;
    }

    line(x0: number, y0: number, x1: number, y1: number, color: PackedColor) {
        x0 |= 0;
        y0 |= 0;
        x1 |= 0;
        y1 |= 0;

        if (x0 - x1 === 0) {
            for (let y = y0; y <= y1; y++) {
                this.pixel(x0, y, color);
            }

            return;
        }

        if (y0 - y1 === 0) {
            for (let x = x0; x <= x1; x++) {
                this.pixel(x, y0, color);
            }

            return;
        }

        if (x0 > x1) {
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }

        const slope = (y1 - y0) / (x1 - x0);

        if (slope === 1) {
            if (y0 > y1) {
                for (let x = x0, y = y0; x <= x1; x++, y--) {
                    this.pixel(x, y, color);
                }

                return;
            } else {
                for (let x = x0, y = y0; x <= x1; x++, y++) {
                    this.pixel(x, y, color);
                }

                return;
            }
        }

        if (slope === -1) {
            if (y0 > y1) {
                for (let x = x0, y = y0; x <= x1; x++, y--) {
                    this.pixel(x, y, color);
                }

                return;
            } else {
                for (let x = x0, y = y0; x <= x1; x++, y++) {
                    this.pixel(x, y, color);
                }

                return;
            }
        }

        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = Math.sign(x1 - x0);
        const sy = Math.sign(y1 - y0);
        let err = dx - dy;

        while (true) {
            this.pixel(x0, y0, color);

            if (x0 === x1 && y0 === y1) {
                return;
            }

            const e2 = 2 * err;

            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
    }

    fillRect(
        sx: number,
        sy: number,
        sw: number,
        sh: number,
        color: PackedColor,
        transform = Matrix3.identity
    ) {
        const bounds = transform.applyToRect(sx, sy, sw, sh);

        const inverse = transform.inv();

        for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
            for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
                const point = inverse.apply(x, y);

                // Check if the inverted point is within the rectangle.
                if (
                    point.x >= sx &&
                    point.x < sx + sw &&
                    point.y >= sy &&
                    point.y < sy + sh
                ) {
                    this.pixel(x, y, color);
                }
            }
        }
    }

    traceRect(
        sx: number,
        sy: number,
        sw: number,
        sh: number,
        color: PackedColor,
        transform = Matrix3.identity
    ) {
        const tl = transform.apply(sx, sy);
        const tr = transform.apply(sx + sw, sy);
        const bl = transform.apply(sx, sy + sh);
        const br = transform.apply(sx + sw, sy + sh);

        this.line(tl.x, tl.y, tr.x, tr.y, color);
        this.line(tr.x, tr.y, br.x, br.y, color);
        this.line(br.x, br.y, bl.x, bl.y, color);
        this.line(bl.x, bl.y, tl.x, tl.y, color);
    }

    fillCirc(
        sx: number,
        sy: number,
        sr: number,
        color: PackedColor,
        transform = Matrix3.identity
    ) {
        const d = sr * 2 + 1;
        const bounds = transform.applyToRect(sx - d / 2, sy - d / 2, d, d);

        const inverse = transform.inv();

        for (
            let x = Math.floor(bounds.x);
            x < Math.ceil(bounds.x + bounds.width);
            x++
        ) {
            for (
                let y = Math.floor(bounds.y);
                y < Math.ceil(bounds.y + bounds.height);
                y++
            ) {
                const point = inverse.apply(x, y);
                const distance = Math.sqrt(
                    (point.x - sx) ** 2 + (point.y - sy) ** 2
                );

                // Check if the inverted point is within the circle.
                if (distance <= d / 2) {
                    // NOTE: For debugging it can be useful to visualize the transformed pixels using light values.
                    // this.pixel(x, y, colors.fromHsl(0, 0, (point.x + point.y) / (this.width + this.height)));
                    this.pixel(x, y, color);
                }
            }
        }
    }

    traceCirc(
        sx: number,
        sy: number,
        sr: number,
        color: PackedColor,
        transform = Matrix3.identity
    ) {
        const d = sr * 2 + 1;
        const bounds = transform.applyToRect(sx - d / 2, sy - d / 2, d, d);

        const inverse = transform.inv();

        for (
            let x = Math.floor(bounds.x);
            x < Math.ceil(bounds.x + bounds.width);
            x++
        ) {
            for (
                let y = Math.floor(bounds.y);
                y < Math.ceil(bounds.y + bounds.height);
                y++
            ) {
                const point = inverse.apply(x, y);
                const distance = Math.sqrt(
                    (point.x - sx) ** 2 + (point.y - sy) ** 2
                );

                if (Math.abs(distance - sr) < 0.58) {
                    this.pixel(x, y, color);
                }
            }
        }
    }

    fillTri(
        sx0: number,
        sy0: number,
        sx1: number,
        sy1: number,
        sx2: number,
        sy2: number,
        color: PackedColor,
        transform = Matrix3.identity
    ) {
        const left = Math.min(sx0, sx1, sx2);
        const right = Math.max(sx0, sx1, sx2);
        const top = Math.min(sy0, sy1, sy2);
        const bottom = Math.max(sy0, sy1, sy2);

        const bounds = transform.applyToRect(
            left,
            top,
            right - left,
            bottom - top
        );

        const inverse = transform.inv();

        for (
            let x = Math.floor(bounds.x);
            x < Math.ceil(bounds.x + bounds.width);
            x++
        ) {
            for (
                let y = Math.floor(bounds.y);
                y < Math.ceil(bounds.y + bounds.height);
                y++
            ) {
                const point = inverse.apply(x, y);

                if (
                    isPointInTri(point.x, point.y, sx0, sy0, sx1, sy1, sx2, sy2)
                ) {
                    this.pixel(x, y, color);
                }
            }
        }
    }

    traceTri(
        sx0: number,
        sy0: number,
        sx1: number,
        sy1: number,
        sx2: number,
        sy2: number,
        color: PackedColor,
        transform = Matrix3.identity
    ) {
        const p0 = transform.apply(sx0, sy0);
        const p1 = transform.apply(sx1, sy1);
        const p2 = transform.apply(sx2, sy2);

        this.line(p0.x, p0.y, p1.x, p1.y, color);
        this.line(p1.x, p1.y, p2.x, p2.y, color);
        this.line(p2.x, p2.y, p0.x, p0.y, color);
    }
}

export class VirtualScreen {
    virtual = true;
    canvas: OffscreenCanvas;
    context: OffscreenCanvasRenderingContext2D;

    constructor(
        public width: number,
        public height: number,
        public image = new ImageData(width, height)
    ) {
        this.canvas = new OffscreenCanvas(width, height);
        this.context = this.canvas.getContext("2d")!;
    }

    commit() {
        this.context.putImageData(this.image, 0, 0);
    }

    clear() {
        for (let i = 0; i < this.image.data.length; i += 4) {
            this.image.data[i + 0] = 0;
            this.image.data[i + 1] = 0;
            this.image.data[i + 2] = 0;
            this.image.data[i + 3] = 255;
        }
    }

    pixel(x: number, y: number, color: PackedColor) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;

        const index = (y * this.width + x) * 4;

        const [r, g, b, a] = unpack(color);

        this.image.data[index + 0] = r;
        this.image.data[index + 1] = g;
        this.image.data[index + 2] = b;
        this.image.data[index + 3] = a;
    }

    line(x0: number, y0: number, x1: number, y1: number, color: PackedColor) {
        if (x0 - x1 === 0) {
            for (let y = y0; y <= y1; y++) {
                this.pixel(x0, y, color);
            }

            return;
        }

        if (y0 - y1 === 0) {
            for (let x = x0; x <= x1; x++) {
                this.pixel(x, y0, color);
            }

            return;
        }

        if (x0 > x1) {
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }

        const slope = (y1 - y0) / (x1 - x0);

        if (slope === 1) {
            if (y0 > y1) {
                for (let x = x0, y = y0; x <= x1; x++, y--) {
                    this.pixel(x, y, color);
                }

                return;
            } else {
                for (let x = x0, y = y0; x <= x1; x++, y++) {
                    this.pixel(x, y, color);
                }

                return;
            }
        }

        if (slope === -1) {
            if (y0 > y1) {
                for (let x = x0, y = y0; x <= x1; x++, y--) {
                    this.pixel(x, y, color);
                }

                return;
            } else {
                for (let x = x0, y = y0; x <= x1; x++, y++) {
                    this.pixel(x, y, color);
                }

                return;
            }
        }

        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = Math.sign(x1 - x0);
        const sy = Math.sign(y1 - y0);
        let err = dx - dy;

        while (true) {
            this.pixel(x0, y0, color);

            if (x0 === x1 && y0 === y1) {
                return;
            }

            const e2 = 2 * err;

            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
    }

    fillRect(
        sx: number,
        sy: number,
        sw: number,
        sh: number,
        color: PackedColor,
        transform = Matrix3.identity
    ) {
        const bounds = transform.applyToRect(sx, sy, sw, sh);

        const inverse = transform.inv();

        for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
            for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
                const point = inverse.apply(x, y);

                // Check if the inverted point is within the rectangle.
                if (
                    point.x >= sx &&
                    point.x < sx + sw &&
                    point.y >= sy &&
                    point.y < sy + sh
                ) {
                    this.pixel(x, y, color);
                }
            }
        }
    }

    traceRect(
        sx: number,
        sy: number,
        sw: number,
        sh: number,
        color: PackedColor,
        transform = Matrix3.identity
    ) {
        const tl = transform.apply(sx, sy);
        const tr = transform.apply(sx + sw, sy);
        const bl = transform.apply(sx, sy + sh);
        const br = transform.apply(sx + sw, sy + sh);

        this.line(tl.x, tl.y, tr.x, tr.y, color);
        this.line(tr.x, tr.y, br.x, br.y, color);
        this.line(br.x, br.y, bl.x, bl.y, color);
        this.line(bl.x, bl.y, tl.x, tl.y, color);
    }

    fillCirc(
        sx: number,
        sy: number,
        sr: number,
        color: PackedColor,
        transform = Matrix3.identity
    ) {
        const d = sr * 2 + 1;
        const bounds = transform.applyToRect(sx - d / 2, sy - d / 2, d, d);

        const inverse = transform.inv();

        for (
            let x = Math.floor(bounds.x);
            x < Math.ceil(bounds.x + bounds.width);
            x++
        ) {
            for (
                let y = Math.floor(bounds.y);
                y < Math.ceil(bounds.y + bounds.height);
                y++
            ) {
                const point = inverse.apply(x, y);
                const distance = Math.sqrt(
                    (point.x - sx) ** 2 + (point.y - sy) ** 2
                );

                // Check if the inverted point is within the circle.
                if (distance <= d / 2) {
                    // NOTE: For debugging it can be useful to visualize the transformed pixels using light values.
                    // this.pixel(x, y, colors.fromHsl(0, 0, (point.x + point.y) / (this.width + this.height)));
                    this.pixel(x, y, color);
                }
            }
        }
    }

    traceCirc(
        sx: number,
        sy: number,
        sr: number,
        color: PackedColor,
        transform = Matrix3.identity
    ) {
        const d = sr * 2 + 1;
        const bounds = transform.applyToRect(sx - d / 2, sy - d / 2, d, d);

        const inverse = transform.inv();

        for (
            let x = Math.floor(bounds.x);
            x < Math.ceil(bounds.x + bounds.width);
            x++
        ) {
            for (
                let y = Math.floor(bounds.y);
                y < Math.ceil(bounds.y + bounds.height);
                y++
            ) {
                const point = inverse.apply(x, y);
                const distance = Math.sqrt(
                    (point.x - sx) ** 2 + (point.y - sy) ** 2
                );

                if (Math.abs(distance - sr) < 0.58) {
                    this.pixel(x, y, color);
                }
            }
        }
    }

    fillTri(
        sx0: number,
        sy0: number,
        sx1: number,
        sy1: number,
        sx2: number,
        sy2: number,
        color: PackedColor,
        transform = Matrix3.identity
    ) {
        const left = Math.min(sx0, sx1, sx2);
        const right = Math.max(sx0, sx1, sx2);
        const top = Math.min(sy0, sy1, sy2);
        const bottom = Math.max(sy0, sy1, sy2);

        const bounds = transform.applyToRect(
            left,
            top,
            right - left,
            bottom - top
        );

        const inverse = transform.inv();

        for (
            let x = Math.floor(bounds.x);
            x < Math.ceil(bounds.x + bounds.width);
            x++
        ) {
            for (
                let y = Math.floor(bounds.y);
                y < Math.ceil(bounds.y + bounds.height);
                y++
            ) {
                const point = inverse.apply(x, y);

                if (
                    isPointInTri(point.x, point.y, sx0, sy0, sx1, sy1, sx2, sy2)
                ) {
                    this.pixel(x, y, color);
                }
            }
        }
    }

    traceTri(
        sx0: number,
        sy0: number,
        sx1: number,
        sy1: number,
        sx2: number,
        sy2: number,
        color: PackedColor,
        transform = Matrix3.identity
    ) {
        const p0 = transform.apply(sx0, sy0);
        const p1 = transform.apply(sx1, sy1);
        const p2 = transform.apply(sx2, sy2);

        this.line(p0.x, p0.y, p1.x, p1.y, color);
        this.line(p1.x, p1.y, p2.x, p2.y, color);
        this.line(p2.x, p2.y, p0.x, p0.y, color);
    }
}

export class Sprite {
    // @ts-expect-error
    image: ImageData;

    constructor(
        public asset: Aseprite,
        public frame = 0,
        public subregion: Rect = {
            x: 0,
            y: 0,
            width: asset.width,
            height: asset.height,
        }
    ) {
        this.update();
    }

    static fromArrayBuffer(arrayBuffer: ArrayBuffer) {
        const aseprite = new Aseprite(arrayBuffer);

        return new Sprite(aseprite);
    }

    get width() {
        return this.subregion.width;
    }

    get height() {
        return this.subregion.height;
    }

    update() {
        this.image = new ImageData(this.subregion.width, this.subregion.height);

        const frame = this.asset.frames[this.frame];

        if (!frame) {
            console.error(`Frame ${this.frame} does not exist.`);
            return;
        }

        const transparent = this.asset.palette[0];

        for (let x = 0; x < this.subregion.width; x++) {
            for (let y = 0; y < this.subregion.height; y++) {
                for (let i = frame.layers.length - 1; i >= 0; i--) {
                    const layer = frame.layers[i];
                    let rendered = false;

                    for (let j = layer.cels.length - 1; j >= 0; j--) {
                        const cel = layer.cels[j];

                        const dx = x + this.subregion.x - cel.x;
                        const dy = y + this.subregion.y - cel.y;

                        if (
                            dy < 0 ||
                            dy >= cel.height ||
                            dx < 0 ||
                            dx >= cel.width
                        ) {
                            continue;
                        }

                        const pixel = cel.pixels[dy * cel.width + dx];
                        const index = y * this.subregion.width + x;
                        const [r, g, b, a] = unpack(
                            fromAsepritePixel(this.asset, pixel)
                        );

                        if (
                            a === 0 ||
                            (transparent &&
                                transparent.red === r &&
                                transparent.green === g &&
                                transparent.blue === b) ||
                            (!transparent && r === 0 && g === 0 && b === 0)
                        ) {
                            continue;
                        }

                        this.image.data[index * 4 + 0] = r;
                        this.image.data[index * 4 + 1] = g;
                        this.image.data[index * 4 + 2] = b;
                        this.image.data[index * 4 + 3] = a;

                        rendered = true;
                    }

                    if (rendered) {
                        break;
                    }
                }
            }
        }
    }

    render(
        screen: Surface,
        sx: number,
        sy: number,
        transform = Matrix3.identity
    ) {
        const bounds = transform.applyToRect(
            sx,
            sy,
            this.subregion.width,
            this.subregion.height
        );

        const inverse = transform.inv();

        for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
            for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
                const point = inverse.apply(x, y);

                if (
                    point.x >= sx &&
                    point.x < sx + this.subregion.width &&
                    point.y >= sy &&
                    point.y < sy + this.subregion.height
                ) {
                    const index =
                        (Math.floor(point.y - sy) * this.subregion.width +
                            Math.floor(point.x - sx)) *
                        4;

                    if (this.image.data[index + 3] === 0) {
                        continue;
                    }

                    const color = pack(
                        this.image.data[index + 0],
                        this.image.data[index + 1],
                        this.image.data[index + 2],
                        this.image.data[index + 3]
                    );

                    screen.pixel(x, y, color);
                }
            }
        }
    }
}
