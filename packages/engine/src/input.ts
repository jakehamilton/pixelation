import { Screen, Surface } from "./graphics";

export class MouseInput {
    x = 0;
    y = 0;
    visible = false;

    primary = false;
    secondary = false;
    middle = false;

    constructor(public root: HTMLElement, public surface: Surface) {
        root.addEventListener("mouseenter", () => {
            this.visible = true;
        });

        root.addEventListener("mouseleave", () => {
            this.visible = false;
        });

        root.addEventListener("mousemove", (event) => {
            const rect = root.getBoundingClientRect();

            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            this.x = Math.floor((x / rect.width) * this.surface.width);
            this.y = Math.floor((y / rect.height) * this.surface.height);
        });

        root.addEventListener("mousedown", (event) => {
            switch (event.button) {
                case 0:
                    this.primary = true;
                    break;
                case 1:
                    this.middle = true;
                    break;
                case 2:
                    this.secondary = true;
                    break;
            }
        });

        root.addEventListener("mouseup", (event) => {
            switch (event.button) {
                case 0:
                    this.primary = false;
                    break;
                case 1:
                    this.middle = false;
                    break;
                case 2:
                    this.secondary = false;
                    break;
            }
        });

        root.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });
    }

    update() {}
}

export class KeyboardInput {
    keys = {
        ["`"]: { held: false, pressed: false },
        ["1"]: { held: false, pressed: false },
        ["2"]: { held: false, pressed: false },
        ["3"]: { held: false, pressed: false },
        ["4"]: { held: false, pressed: false },
        ["5"]: { held: false, pressed: false },
        ["6"]: { held: false, pressed: false },
        ["7"]: { held: false, pressed: false },
        ["8"]: { held: false, pressed: false },
        ["9"]: { held: false, pressed: false },
        ["0"]: { held: false, pressed: false },
        ["-"]: { held: false, pressed: false },
        ["="]: { held: false, pressed: false },
        ["Backspace"]: { held: false, pressed: false },
        ["Tab"]: { held: false, pressed: false },
        ["q"]: { held: false, pressed: false },
        ["w"]: { held: false, pressed: false },
        ["e"]: { held: false, pressed: false },
        ["r"]: { held: false, pressed: false },
        ["t"]: { held: false, pressed: false },
        ["y"]: { held: false, pressed: false },
        ["u"]: { held: false, pressed: false },
        ["i"]: { held: false, pressed: false },
        ["o"]: { held: false, pressed: false },
        ["p"]: { held: false, pressed: false },
        ["["]: { held: false, pressed: false },
        ["]"]: { held: false, pressed: false },
        ["\\"]: { held: false, pressed: false },
        ["CapsLock"]: { held: false, pressed: false },
        ["a"]: { held: false, pressed: false },
        ["s"]: { held: false, pressed: false },
        ["d"]: { held: false, pressed: false },
        ["f"]: { held: false, pressed: false },
        ["g"]: { held: false, pressed: false },
        ["h"]: { held: false, pressed: false },
        ["j"]: { held: false, pressed: false },
        ["k"]: { held: false, pressed: false },
        ["l"]: { held: false, pressed: false },
        [";"]: { held: false, pressed: false },
        ["'"]: { held: false, pressed: false },
        ["Enter"]: { held: false, pressed: false },
        ["ShiftLeft"]: { held: false, pressed: false },
        ["z"]: { held: false, pressed: false },
        ["x"]: { held: false, pressed: false },
        ["c"]: { held: false, pressed: false },
        ["v"]: { held: false, pressed: false },
        ["b"]: { held: false, pressed: false },
        ["n"]: { held: false, pressed: false },
        ["m"]: { held: false, pressed: false },
        [","]: { held: false, pressed: false },
        ["."]: { held: false, pressed: false },
        ["/"]: { held: false, pressed: false },
        ["ShiftRight"]: { held: false, pressed: false },
        ["ControlLeft"]: { held: false, pressed: false },
        ["MetaLeft"]: { held: false, pressed: false },
        ["AltLeft"]: { held: false, pressed: false },
        ["Space"]: { held: false, pressed: false },
        ["AltRight"]: { held: false, pressed: false },
        ["MetaRight"]: { held: false, pressed: false },
        ["ContextMenu"]: { held: false, pressed: false },
        ["ControlRight"]: { held: false, pressed: false },
        ["ArrowLeft"]: { held: false, pressed: false },
        ["ArrowUp"]: { held: false, pressed: false },
        ["ArrowRight"]: { held: false, pressed: false },
        ["ArrowDown"]: { held: false, pressed: false },
    };

    constructor(public root: HTMLElement) {
        root.addEventListener("keydown", (event) => {
            event.preventDefault();

            switch (event.key) {
                case "Shift":
                case "Control":
                case "Meta":
                case "Alt":
                    if (
                        event.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT
                    ) {
                        this.keys[`${event.key}Right`].held = true;
                    } else {
                        this.keys[`${event.key}Left`].held = true;
                    }
                    break;
                case " ":
                    this.keys["Space"].held = true;
                    break;
                default:
                    if (this.keys.hasOwnProperty(event.key)) {
                        this.keys[event.key as keyof typeof this.keys].held =
                            true;
                    }
                    break;
            }
        });

        root.addEventListener("keyup", (event) => {
            event.preventDefault();

            switch (event.key) {
                case "Shift":
                case "Control":
                case "Meta":
                case "Alt":
                    if (
                        event.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT
                    ) {
                        this.keys[`${event.key}Right`].held = false;
                        this.keys[`${event.key}Right`].pressed = true;
                    } else {
                        this.keys[`${event.key}Left`].held = false;
                        this.keys[`${event.key}Left`].pressed = true;
                    }
                    break;
                case " ":
                    this.keys["Space"].held = false;
                    this.keys["Space"].pressed = true;
                    break;
                default:
                    if (this.keys.hasOwnProperty(event.key)) {
                        this.keys[event.key as keyof typeof this.keys].held =
                            false;
                        this.keys[event.key as keyof typeof this.keys].pressed =
                            true;
                    }
                    break;
            }
        });
    }

    update() {
        for (const key in this.keys) {
            this.keys[key as keyof typeof this.keys].pressed = false;
        }
    }

    held(key: keyof typeof this.keys) {
        return this.keys[key].held;
    }

    pressed(key: keyof typeof this.keys) {
        return this.keys[key].pressed;
    }
}

export class GamepadInput {
    connected = false;
    device: Gamepad | null = null;

    buttons: Array<{
        held: boolean;
        pressed: boolean;
    }> = [];

    constructor(public root: HTMLElement) {}

    update() {
        for (let i = 0; i < this.buttons.length; i++) {
            const button = this.device?.buttons[i];
            const state = this.buttons[i];

            if (button) {
                if (state.pressed) {
                    state.pressed = false;
                }

                if (state.held && !button.pressed) {
                    state.pressed = true;
                }

                state.held = button.pressed;
            }
        }
    }

    connect(event: GamepadEvent) {
        this.connected = true;
        this.device = event.gamepad;
        this.buttons = this.device.buttons.map(() => ({
            held: false,
            pressed: false,
        }));
    }

    disconnect() {
        this.connected = false;
    }

    held(button: number) {
        // We use the raw button state for held status to avoid waiting a frame like we need to for the pressed state.
        return this.device?.buttons[button].pressed ?? false;
    }

    pressed(button: number) {
        return this.buttons[button]?.pressed ?? false;
    }

    analog(button: number) {
        return this.device?.buttons[button].value ?? 0;
    }

    axis(index: number) {
        return this.device?.axes[index] ?? 0;
    }
}

export class Inputs {
    root: HTMLElement;

    mouse: MouseInput;
    keyboard: KeyboardInput;
    gamepads: [GamepadInput, GamepadInput, GamepadInput, GamepadInput];

    constructor(public surface: Surface) {
        if (surface.virtual) {
            this.root = document.createElement("div");
        } else {
            this.root = (surface as Screen).canvas;
        }

        this.mouse = new MouseInput(this.root, this.surface);
        this.keyboard = new KeyboardInput(this.root);
        this.gamepads = [
            new GamepadInput(this.root),
            new GamepadInput(this.root),
            new GamepadInput(this.root),
            new GamepadInput(this.root),
        ];

        window.addEventListener("gamepadconnected", (event: GamepadEvent) => {
            if (event.gamepad.index >= 4) {
                return;
            }

            const gamepad = this.gamepads[event.gamepad.index];

            gamepad.connect(event);
        });

        window.addEventListener(
            "gamepaddisconnected",
            (event: GamepadEvent) => {
                if (event.gamepad.index >= 4) {
                    return;
                }

                const gamepad = this.gamepads[event.gamepad.index];

                gamepad.disconnect();
            }
        );
    }

    update() {
        this.mouse.update();
        this.keyboard.update();

        for (const gamepad of this.gamepads) {
            gamepad.update();
        }
    }
}
