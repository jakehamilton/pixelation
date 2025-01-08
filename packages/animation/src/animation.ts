import * as engine from "@pixelation/engine";

import {
	AnimationProgress,
	AnimationDuration,
	AnimationFn,
	AnimationState,
	AnimationDirection,
	Animatable,
} from "./animatable";

export class Animation implements Animatable {
	state = AnimationState.Stopped;

	public readonly duration: AnimationDuration;

	private time = 0 as engine.lifecycle.Time;

	constructor(
		private readonly animate: AnimationFn,
		duration: number,
		public loop = false,
		public direction: AnimationDirection = AnimationDirection.Forward
	) {
		this.duration = duration as AnimationDuration;
	}

	update(
		surface: engine.graphics.Surface,
		inputs: engine.input.Inputs,
		audio: engine.audio.Audio,
		dt: engine.lifecycle.DeltaTime,
		t: engine.lifecycle.Time
	) {
		if (this.state !== AnimationState.Playing) {
			return;
		}

		// Not using shorthand here because TypeScript still doesn't understand tagged types.
		this.time = (this.time + dt) as engine.lifecycle.Time;

		let isFinished = this.time >= this.duration;
		let progress: AnimationProgress;

		if (isFinished) {
			progress = 1 as AnimationProgress;
		} else {
			progress = (this.time / this.duration) as AnimationProgress;
		}

		if (this.direction === AnimationDirection.Reverse) {
			progress = ((1 as AnimationProgress) -
				progress) as AnimationProgress;
		}

		this.animate(progress, surface, inputs, audio, dt, t);

		if (isFinished) {
			this.stop();

			if (this.loop) {
				this.play();
			}
		}
	}

	play() {
		this.state = AnimationState.Playing;
	}

	pause() {
		this.state = AnimationState.Paused;
	}

	stop() {
		this.state = AnimationState.Stopped;
		this.time = 0 as engine.lifecycle.Time;
	}

	reverse() {
		if (this.direction === AnimationDirection.Forward) {
			this.direction = AnimationDirection.Reverse;
		} else {
			this.direction = AnimationDirection.Forward;
		}
	}
}
