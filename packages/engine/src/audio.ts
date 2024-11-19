import { cloneArrayBuffer } from "./util";

export type Track = "main" | "sfx" | "speech" | "music";
export type Strategy = "once" | "once-restart" | "loop" | "loop-restart";

export interface AudioAssetOptions {
    track?: Track;
    strategy?: Strategy;
}

export class AudioAsset {
    ready = false;
    queued = false;
    playing = false;

    duration = 0;
    position = 0;
    started = 0;

    source: AudioBufferSourceNode;

    constructor(
        public audio: Audio,
        public raw: ArrayBuffer,
        public options: AudioAssetOptions = {
            track: "main",
            strategy: "once",
        }
    ) {
        if (!options.track) {
            options.track = "main";
        }

        if (!options.strategy) {
            options.strategy = "once";
        }

        audio.assets.push(this);

        this.source = new AudioBufferSourceNode(audio.context, {
            loop:
                options.strategy === "loop" ||
                options.strategy === "loop-restart",
        });

        this.source.connect(audio[options.track]);

        this.source.onended = () => {
            this.stop();
        };

        audio.context.decodeAudioData(cloneArrayBuffer(raw), (buffer) => {
            this.source.buffer = buffer;
            this.ready = true;

            this.duration = buffer.duration;
            this.position = 0;

            if (this.queued) {
                this.play();
            }
        });
    }

    destroy() {
        const index = this.audio.assets.indexOf(this);

        if (index !== -1) {
            this.audio.assets = this.audio.assets.splice(index, 1);
        }

        this.source.disconnect();
        this.source.buffer = null;
    }

    update() {
        const elapsed = this.audio.context.currentTime - this.started;
        this.position = elapsed % this.duration;

        if (this.playing && elapsed >= this.duration && !this.source.loop) {
            this.stop();
        }
    }

    clone() {
        return new AudioAsset(this.audio, this.raw, this.options);
    }

    play() {
        if (!this.ready) {
            this.queued = true;
            return;
        }

        if (this.playing) {
            if (
                this.options.strategy === "once-restart" ||
                this.options.strategy === "loop-restart"
            ) {
                this.source.stop();
            } else {
                return;
            }
        }

        this.started = this.audio.context.currentTime + 0.01;

        this.source.start(this.started);
    }

    stop() {
        if (!this.ready) {
            this.queued = false;
            return;
        }

        this.source.stop();
        this.started = 0;
        this.position = 0;
    }
}

export class Audio {
    context = new AudioContext();

    main = this.context.createGain();
    sfx = this.context.createGain();
    speech = this.context.createGain();
    music = this.context.createGain();

    assets: AudioAsset[] = [];

    constructor() {
        this.main.connect(this.context.destination);
        this.main.gain.value = 1;
        this.sfx.connect(this.main);
        this.main.gain.value = 1;
        this.speech.connect(this.main);
        this.main.gain.value = 1;
        this.music.connect(this.main);
        this.main.gain.value = 1;
    }

    asset(
        buffer: ArrayBuffer,
        options: AudioAssetOptions = {
            track: "main",
            strategy: "once",
        }
    ) {
        if (!options.track) {
            options.track = "main";
        }

        if (!options.strategy) {
            options.strategy = "once";
        }

        return new AudioAsset(this, buffer, options);
    }

    volume(track: Track, value: number) {
        this[track].gain.value = value;
    }

    once(asset: AudioAsset) {
        const clone = asset.clone();

        clone.play();

        const update = clone.update.bind(clone);

        clone.update = () => {
            update();

            if (!clone.playing) {
                clone.destroy();
            }
        };
    }

    play(asset: AudioAsset) {
        const clone = asset.clone();

        clone.play();

        return clone;
    }

    update() {
        for (const asset of this.assets) {
            asset.update();
        }
    }
}
