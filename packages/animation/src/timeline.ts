import * as engine from "@pixelation/engine";

import {
	Animation,
	AnimationDirection,
	AnimationDuration,
	AnimationState,
} from "./animation";

export interface TimelineAnimation {
	animation: Animation;
	offset: engine.lifecycle.Time | number;
}

export class Timeline {
	state = AnimationState.Stopped;

	public readonly duration: AnimationDuration = 0 as AnimationDuration;

	private time = 0 as engine.lifecycle.Time;
	private completed: Array<boolean>;

	constructor(
		private readonly animations: TimelineAnimation[],
		public loop = false
	) {
		for (const { animation, offset } of animations) {
			if (animation.loop) {
				throw new Error("Timeline animations cannot loop.");
			}

			animation.stop();

			this.duration = Math.max(
				this.duration,
				offset + animation.duration
			) as AnimationDuration;
		}

		this.completed = new Array(animations.length).fill(false);
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

		for (let i = 0; i < this.animations.length; i++) {
			if (this.completed[i]) {
				continue;
			}

			const { animation, offset } = this.animations[i];

			if (animation.state !== AnimationState.Playing) {
				animation.play();
			}

			const end = offset + animation.duration;

			if (this.time >= offset) {
				animation.update(surface, inputs, audio, dt, t);
			}

			if (this.time >= end) {
				this.completed[i] = true;
			}
		}

		if (this.loop && this.time >= this.duration) {
			this.stop();
			this.play();
		}
	}

	play() {
		this.state = AnimationState.Playing;
	}

	pause() {
		this.state = AnimationState.Paused;

		for (let i = 0; i < this.animations.length; i++) {
			this.animations[i].animation.pause();
		}
	}

	stop() {
		this.state = AnimationState.Stopped;
		this.time = 0 as engine.lifecycle.Time;

		for (let i = 0; i < this.animations.length; i++) {
			this.completed[i] = false;
			this.animations[i].animation.stop();
		}
	}
}
