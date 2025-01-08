import * as engine from "@pixelation/engine";

/**
 * Specifically, a number between 0 and 1 which we use for lerp-ing.
 */
export type AnimationProgress = engine.Tagged<"AnimationProgress", number>;

/**
 * The duration of an animation in milliseconds.
 */
export type AnimationDuration = engine.Tagged<"AnimationDuration", number>;

export type AnimationFn = (
	progress: AnimationProgress,
	surface: engine.graphics.Surface,
	inputs: engine.input.Inputs,
	audio: engine.audio.Audio,
	dt: engine.lifecycle.DeltaTime,
	t: engine.lifecycle.Time
) => void;

export enum AnimationState {
	Stopped,
	Playing,
	Paused,
}

export enum AnimationDirection {
	Forward,
	Reverse,
}

export interface Animatable {
	state: AnimationState;
	duration: AnimationDuration;

	update(
		surface: engine.graphics.Surface,
		inputs: engine.input.Inputs,
		audio: engine.audio.Audio,
		dt: engine.lifecycle.DeltaTime,
		t: engine.lifecycle.Time
	): void;

	play(): void;
	pause(): void;
	stop(): void;
}
