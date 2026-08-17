import { noop } from "./util";
import { Tagged } from "./tagged";
import { Surface } from "./graphics";
import { Inputs } from "./input";
import { Audio } from "./audio";

export type Fps = Tagged<"Fps", number>;
export type Time = Tagged<"Time", number>;
export type DeltaTime = Tagged<"DeltaTime", number>;

/**
 * A Pixelation setup handler. This handler runs once at the beginning of the
 * engine's lifecycle. Typically, this is used for initializing data and preparing
 * any surfaces or resources.
 *
 * ```ts
 * let asset = null;
 *
 * const setup: Setup = () => {
 *		asset = loadMyAsset();
 * };
 * ```
 */
export type Setup = (surface: Surface, inputs: Inputs, audio: Audio) => void;

/**
 * A Pixelation cleanup handler. This handler runs after the component is no longer
 * needed. This is where resources that were allocated in the setup handler can be
 * disposed of.
 *
 * ```ts
 * let asset = null;
 *
 * const setup: Setup = () => {
 *		asset = loadMyAsset();
 * };
 *
 * const cleanup: Cleanup = () => {
 *		asset = null;
 * };
 * ```
 */
export type Cleanup = (surface: Surface, inputs: Inputs, audio: Audio) => void;

/**
 * A Pixelation update handler. This handler runs on every frame, before any
 * rendering happens.
 *
 * ```ts
 * const x = 0;
 * const y = 0;
 *
 * const update: Update = (surface, inputs, audio, dt, t) => {
 *		x = engine.easing.lerpSmooth(x, inputs.mouse.x, 0.008, dt);
 *		y = engine.easing.lerpSmooth(y, inputs.mouse.y, 0.008, dt);
 * };
 * ```
 */
export type Update = (
	surface: Surface,
	inputs: Inputs,
	audio: Audio,
	dt: DeltaTime,
	t: Time
) => void;

/**
 * A Pixelation render handler. This handler runs on every frame and
 * is responsible for performing all drawing operations.
 *
 * ```ts
 * const update: Render = (surface, inputs, audio, dt, t, fps) => {
 *		surface.fillRect(0, 0, 10, 10, engine.colors.fromHex("#ff0000"));
 * };
 * ```
 */
export type Render = (
	surface: Surface,
	inputs: Inputs,
	dt: DeltaTime,
	t: Time,
	fps: Fps
) => void;

export interface Component {
	setup?: Setup;
	cleanup?: Cleanup;
	update?: Update;
	render: Render;
}

export interface RunOptions {
	surface: Surface;
	setup?: Setup;
	update?: Update;
	render?: Render;
}

/**
 * Start a root component's lifecycle. Setup, update, and render
 * from the component lifecycle are used. Because this is the root
 * component, no cleanup handler exists.
 */
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
