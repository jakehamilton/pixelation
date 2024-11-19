import { noop } from "./util";
import { Tagged } from "./tagged";
import { Screen, Surface } from "./graphics";
import { Inputs } from "./input";
import { Audio } from "./audio";

export type Fps = Tagged<"Fps", number>;
export type Time = Tagged<"Time", number>;
export type DeltaTime = Tagged<"DeltaTime", number>;

export type Setup = (surface: Surface, inputs: Inputs, audio: Audio) => void;
export type Update = (
    surface: Surface,
    inputs: Inputs,
    audio: Audio,
    dt: DeltaTime,
    t: Time
) => void;
export type Render = (
    surface: Surface,
    inputs: Inputs,
    dt: DeltaTime,
    t: Time,
    fps: Fps
) => void;

export interface Component {
    setup?: Setup;
    update?: Update;
    render: Render;
}

export interface RunOptions {
    surface: Surface;
    setup?: Setup;
    update?: Update;
    render?: Render;
}

export const run = ({
    surface,
    setup = noop,
    update = noop,
    render = noop,
}: RunOptions) => {
    let t = 0 as Time;
    let fps = 0 as Fps;
    let frames = 0;
    let fpsDelta = 0;

    const inputs = new Inputs(surface);
    const audio = new Audio();

    let visible = document.visibilityState === "visible";

    window.addEventListener("visibilitychange", () => {
        visible = document.visibilityState === "visible";

        if (!visible) {
            fps = 0 as Fps;
            frames = 0;
            fpsDelta = 0;
        }
    });

    const loop = (time: number) => {
        if (!visible) {
            requestAnimationFrame(loop);

            return;
        }

        const dt = (time - t) as DeltaTime;

        t = time as Time;

        fpsDelta += dt;

        if (fpsDelta >= 1_000) {
            fps = frames as Fps;
            frames = 0;
            fpsDelta = 0;
        }

        audio.update();

        update(surface, inputs, audio, dt, t);

        inputs.update();

        render(surface, inputs, dt, t, fps);

        surface.commit();

        frames++;

        requestAnimationFrame(loop);
    };

    setup(surface, inputs, audio);

    requestAnimationFrame(loop);
};
