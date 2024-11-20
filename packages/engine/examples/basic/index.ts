import * as engine from "../../src";

import rgbaSpriteBuffer from "./sprites/rgba.aseprite?arraybuffer";
import grayscaleSpriteBuffer from "./sprites/grayscale.aseprite?arraybuffer";
import indexedSpriteBuffer from "./sprites/indexed.aseprite?arraybuffer";
import animatedSpriteBuffer from "./sprites/animated.aseprite?arraybuffer";

import sfxBuffer from "./audio/sfx.wav?arraybuffer";
import musicBuffer from "./audio/music.wav?arraybuffer";

const root = document.getElementById("root")!;
const screen = new engine.graphics.Screen(100, 100);

const rgbaSprite = engine.graphics.Sprite.fromArrayBuffer(rgbaSpriteBuffer);
const grayscaleSprite = engine.graphics.Sprite.fromArrayBuffer(
    grayscaleSpriteBuffer
);
const indexedSprite =
    engine.graphics.Sprite.fromArrayBuffer(indexedSpriteBuffer);
const animatedSprite =
    engine.graphics.AnimatedSprite.fromArrayBuffer(animatedSpriteBuffer);

let playerX = engine.easing.smooth(screen.width / 2, 0.5, 0.5, 2);
let playerY = engine.easing.smooth(screen.height / 2, 0.5, 0.5, 2);

const UP_BUTTON = 12;
const DOWN_BUTTON = 13;
const LEFT_BUTTON = 14;
const RIGHT_BUTTON = 15;

const LEFT_STICK_X = 0;
const LEFT_STICK_Y = 1;
const RIGHT_STICK_X = 2;
const RIGHT_STICK_Y = 3;

const STICK_SENSITIVITY = 0.1;

let sfx: engine.audio.AudioAsset;
let music: engine.audio.AudioAsset;

const setup: engine.lifecycle.Setup = (surface, inputs, audio) => {
    window.addEventListener(
        "click",
        () => {
            audio.context.resume();
            audio.play(music);
            // music.play();
            // sfx.play();
        },
        {
            once: true,
        }
    );

    screen.canvas.style.width = "800px";
    screen.canvas.style.height = "800px";
    screen.canvas.style.cursor = "none";

    root.appendChild(screen.canvas);

    sfx = audio.asset(sfxBuffer);
    music = audio.asset(musicBuffer, {
        strategy: "loop",
    });
};

const update: engine.lifecycle.Update = (surface, inputs, audio, dt) => {
    const gamepad = inputs.gamepads[0];

    const x = playerX();
    const y = playerY();

    let isMoving = false;

    if (
        inputs.keyboard.held("w") ||
        inputs.keyboard.held("ArrowUp") ||
        gamepad.held(UP_BUTTON) ||
        gamepad.axis(LEFT_STICK_Y) < 0 - STICK_SENSITIVITY
    ) {
        isMoving = true;
        playerY(y - 1);
    }

    if (
        inputs.keyboard.held("s") ||
        inputs.keyboard.held("ArrowDown") ||
        gamepad.held(DOWN_BUTTON) ||
        gamepad.axis(LEFT_STICK_Y) > 0 + STICK_SENSITIVITY
    ) {
        isMoving = true;
        playerY(y + 1);
    }

    if (
        inputs.keyboard.held("a") ||
        inputs.keyboard.held("ArrowLeft") ||
        gamepad.held(LEFT_BUTTON) ||
        gamepad.axis(LEFT_STICK_X) < 0 - STICK_SENSITIVITY
    ) {
        isMoving = true;
        playerX(x - 1);
    }

    if (
        inputs.keyboard.held("d") ||
        inputs.keyboard.held("ArrowRight") ||
        gamepad.held(RIGHT_BUTTON) ||
        gamepad.axis(LEFT_STICK_X) > 0 + STICK_SENSITIVITY
    ) {
        isMoving = true;
        playerX(x + 1);
    }

    if (isMoving) {
        console.log("play");
        animatedSprite.play();
    } else {
        console.log("pause");
        animatedSprite.pause();
    }

    if (inputs.keyboard.pressed("Space")) {
        audio.once(sfx);
    }

    // for (let i = 0; i < inputs.gamepads[0].buttons.length; i++) {
    // 	const button = inputs.gamepads[0].buttons[i];
    //
    // 	if (button.held) {
    // 		console.log("held", i);
    // 	}
    // }
    animatedSprite.update(dt);
};

const render: engine.lifecycle.Render = (surface, inputs, dt, t, fps) => {
    surface.clear();

    const step = 60;

    for (let x = 0; x < surface.width; x++) {
        for (let y = 0; y < surface.height; y++) {
            if (
                x !== 0 &&
                y !== 0 &&
                x !== surface.width - 1 &&
                y !== surface.height - 1
            ) {
                const hue =
                    (Math.sin((t + x * step + y * step) / 4_000) * 180 + 180) /
                    360;
                const color = engine.colors.fromHsl(hue, 1, 0.85);
                surface.pixel(x, y, color);
            } else {
                const hue =
                    (Math.sin((t - x * step - y * step) / 2_000) * 180 + 180) /
                    360;
                const color = engine.colors.fromHsl(hue, 0.85, 0.7);
                surface.pixel(x, y, color);
            }
        }
    }

    surface.line(
        0,
        0,
        surface.width - 1,
        surface.height - 1,
        engine.colors.fromHex("#ffffff")
    );
    surface.line(
        0,
        surface.height - 1,
        surface.width - 1,
        0,
        engine.colors.fromHex("#ffffff")
    );

    surface.pixel(0, 0, engine.colors.fromHex("#000000"));
    surface.pixel(surface.width - 1, 0, engine.colors.fromHex("#000000"));
    surface.pixel(0, surface.height - 1, engine.colors.fromHex("#000000"));
    surface.pixel(
        surface.width - 1,
        surface.height - 1,
        engine.colors.fromHex("#000000")
    );

    (() => {
        const rotation = ((t % 2_000) / 2_000) * (Math.PI * 2);
        const width = 10;
        const height = 10;
        const x = surface.width / 2 - width / 2 - 20;
        const y = surface.height / 2 - height / 2;
        const transform = new engine.geometry.Matrix3([
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ])
            .translate(-x - width / 2, -y - height / 2)
            .rotate(rotation)
            .translate(x + width / 2, y + height / 2);

        surface.traceRect(
            x,
            y,
            width,
            height,
            engine.colors.fromHex("#ff0000"),
            transform
        );
    })();

    (() => {
        const rotation = ((t % 2_000) / 2_000) * (Math.PI * 2);
        const base = 10;
        const height = 10;
        const x = surface.width / 2;
        const y = surface.height / 2;
        const transform = new engine.geometry.Matrix3([
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ])
            .translate(-x, -y)
            .rotate(rotation)
            .translate(x, y);

        const x0 = x - base / 2;
        const y0 = y + height / 2;
        const x1 = x + base / 2;
        const y1 = y + height / 2;
        const x2 = x;
        const y2 = y - height / 2;

        surface.traceTri(
            x0,
            y0,
            x1,
            y1,
            x2,
            y2,
            engine.colors.fromHex("#00ff00"),
            transform
        );
    })();

    (() => {
        const rotation = ((t % 2_000) / 2_000) * (Math.PI * 2);
        const radius = 4;
        const x = surface.width / 2 + 20;
        const y = surface.height / 2;
        const transform = new engine.geometry.Matrix3([
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ])
            .translate(-x, -y)
            .skew(0, 0.5)
            .rotate(rotation)
            .translate(x, y);

        surface.traceCirc(
            x,
            y,
            radius,
            engine.colors.fromHex("#0000ff"),
            transform
        );
    })();

    (() => {
        const rotation = ((t % 2_000) / 2_000) * (Math.PI * 2);
        const width = 10;
        const height = 10;
        const x = surface.width / 2 - width / 2 - 20;
        const y = surface.height / 2 - height / 2 + 20;
        const transform = new engine.geometry.Matrix3([
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ])
            .translate(-x - width / 2, -y - height / 2)
            .rotate(rotation)
            .translate(x + width / 2, y + height / 2);

        surface.fillRect(
            x,
            y,
            width,
            height,
            engine.colors.fromHex("#ff0000"),
            transform
        );
    })();

    (() => {
        const rotation = ((t % 2_000) / 2_000) * (Math.PI * 2);
        const base = 10;
        const height = 10;
        const x = surface.width / 2;
        const y = surface.height / 2 + 20;
        const transform = new engine.geometry.Matrix3([
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ])
            .translate(-x, -y)
            .rotate(rotation)
            .translate(x, y);

        const x0 = x - base / 2;
        const y0 = y + height / 2;
        const x1 = x + base / 2;
        const y1 = y + height / 2;
        const x2 = x;
        const y2 = y - height / 2;

        surface.fillTri(
            x0,
            y0,
            x1,
            y1,
            x2,
            y2,
            engine.colors.fromHex("#00ff00"),
            transform
        );
    })();

    (() => {
        const rotation = ((t % 2_000) / 2_000) * (Math.PI * 2);
        const radius = 4;
        const x = surface.width / 2 + 20;
        const y = surface.height / 2 + 20;
        const transform = new engine.geometry.Matrix3([
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ])
            .translate(-x, -y)
            .skew(0, 0.5)
            .rotate(rotation)
            .translate(x, y);

        surface.fillCirc(
            x,
            y,
            radius,
            engine.colors.fromHex("#0000ff"),
            transform
        );
    })();

    (() => {
        const rotation = ((t % 2_000) / 2_000) * (Math.PI * 2);
        const x = surface.width / 2 - 30;
        const y = surface.height / 2 - 30;
        const transform = new engine.geometry.Matrix3([
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ])
            .translate(-x - rgbaSprite.width / 2, -y - rgbaSprite.height / 2)
            .rotate(rotation)
            .translate(x, y);

        rgbaSprite.render(surface, x, y, transform);
    })();

    (() => {
        const rotation = ((t % 2_000) / 2_000) * (Math.PI * 2);
        const x = surface.width / 2;
        const y = surface.height / 2 - 30;
        const transform = new engine.geometry.Matrix3([
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ])
            .translate(-x - rgbaSprite.width / 2, -y - rgbaSprite.height / 2)
            .rotate(rotation)
            .translate(x, y);

        grayscaleSprite.render(surface, x, y, transform);
    })();

    (() => {
        const rotation = ((t % 2_000) / 2_000) * (Math.PI * 2);
        const x = surface.width / 2 + 30;
        const y = surface.height / 2 - 30;
        const transform = new engine.geometry.Matrix3([
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ])
            .translate(-x - rgbaSprite.width / 2, -y - rgbaSprite.height / 2)
            .rotate(rotation)
            .translate(x, y);

        indexedSprite.render(surface, x, y, transform);
    })();

    (() => {
        const size = 2;
        const transform = new engine.geometry.Matrix3([
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ]).translate(-size / 2 + 1, -size / 2 + 1);

        if (inputs.mouse.visible) {
            screen.fillCirc(
                inputs.mouse.x,
                inputs.mouse.y,
                size,
                engine.colors.fromHsl(0.85, 0.9, 0.75),
                transform
            );
        }
    })();

    (() => {
        const x = playerX();
        const y = playerY();
        const transform = new engine.geometry.Matrix3([
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ])
            .translate(
                -x - animatedSprite.width / 2,
                -y - animatedSprite.height / 2
            )
            .translate(x, y);

        animatedSprite.render(surface, playerX(), playerY(), transform);
    })();
};

engine.lifecycle.run({
    surface: screen,
    setup,
    update,
    render,
});