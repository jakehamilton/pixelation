import * as engine from "@pixelation/engine";

export class Switcher {
	private current: engine.lifecycle.Component;
	private target: engine.lifecycle.Component | null = null;

	private isCurrentInitialized = false;
	private isTargetInitialized = false;

	private isSwitching = false;
	public duration = 0 as engine.lifecycle.Time;
	private time = 0 as engine.lifecycle.Time;

	// We require a surface in order to properly size the virtual screens. Because of this, we need to wait until
	// the first update call to create them.
	private front: engine.graphics.Surface | undefined;
	private back: engine.graphics.Surface | undefined;

	constructor(initial: engine.lifecycle.Component) {
		this.current = initial;
	}

	update(
		surface: engine.graphics.Surface,
		inputs: engine.input.Inputs,
		audio: engine.audio.Audio,
		dt: engine.lifecycle.DeltaTime,
		t: engine.lifecycle.Time
	) {
		if (this.front === undefined) {
			this.front = new engine.graphics.VirtualScreen(
				surface.width,
				surface.height
			);
		}

		if (this.back === undefined) {
			this.back = new engine.graphics.VirtualScreen(
				surface.width,
				surface.height
			);
		}

		if (!this.isCurrentInitialized) {
			this.current.setup?.(surface, inputs, audio);
			this.isCurrentInitialized = true;
		}

		if (this.target === null) {
			return;
		}

		if (!this.isTargetInitialized) {
			this.target.setup?.(surface, inputs, audio);
			this.isTargetInitialized = true;
		}

		this.time = (this.time + dt) as engine.lifecycle.Time;

		if (this.time >= this.duration) {
			this.current = this.target;
			this.target = null;

			this.isCurrentInitialized = false;
			this.isTargetInitialized = false;

			this.time = 0 as engine.lifecycle.Time;
			this.isSwitching = false;
		}
	}

	render(
		surface: engine.graphics.Surface,
		inputs: engine.input.Inputs,
		dt: engine.lifecycle.DeltaTime,
		t: engine.lifecycle.Time,
		fps: engine.lifecycle.Fps
	) {
		if (this.target === null) {
			this.current.render(surface, inputs, dt, t, fps);
			// surface.fillRect(0, 0, surface.width, surface.height, engine.colors.pack(0, 0, 0, 254));
		} else {
			this.current.render(this.front!, inputs, dt, t, fps);
			this.target.render(this.back!, inputs, dt, t, fps);

			const isFadeOut = this.time < this.duration / 2;

			const blend = isFadeOut
				? this.time / (this.duration / 2)
				: 1 - (this.time - this.duration / 2) / (this.duration / 2);

			const color = engine.colors.pack(0, 0, 0, Math.round(255 * blend));

			if (isFadeOut) {
				surface.blit(this.front!.image);
			} else {
				surface.blit(this.back!.image);
			}

			surface.fillRect(0, 0, surface.width, surface.height, color);
		}
	}

	switch(target: engine.lifecycle.Component, duration: number = 0) {
		if (this.isSwitching) {
			this.current = this.target!;
		}

		this.target = target;
		this.time = 0 as engine.lifecycle.Time;
		this.duration = duration as engine.lifecycle.Time;
		this.isSwitching = true;
	}
}
