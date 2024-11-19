// The smooth update code here is ported from Werxzy's outstanding Picotron Solitaire Suite.
// Thank you Werxzy for open sourcing your game so that others may learn from it :)
// https://github.com/Werxzy/cards_api/blob/530568e70efb1fde592e067c98b8dcf8b0b2b9ef/util.lua#L56

export enum SmoothUpdateKind {
    Position = "p",
    Velocity = "v",
    Step = "s",
}

export const smooth = (
    position: number,
    dampening: number = 0.5,
    acceleration: number = 0.1,
    limit: number = 0.1
) => {
    let velocity = 0;

    const step = (next: number) => {
        const difference = (next - position) * acceleration;
        velocity += difference;
        velocity *= dampening;
        position += velocity;

        if (
            velocity < limit &&
            velocity > -limit &&
            difference < limit &&
            difference > -limit
        ) {
            position = next;
            velocity = 0;
        }
    };

    // @ts-ignore
    function update(): number;
    function update(value: number): number;
    function update(kind: SmoothUpdateKind.Step): number;
    function update(kind: SmoothUpdateKind.Position, value?: number): number;
    function update(kind: SmoothUpdateKind.Velocity, value?: number): number;
    function update(kind: SmoothUpdateKind | number, value?: number): number {
        if (arguments.length === 0) {
            return position;
        }

        switch (kind) {
            case SmoothUpdateKind.Position:
                if (value !== undefined) {
                    position = value;
                }

                return position;
            case SmoothUpdateKind.Velocity:
                if (
                    value !== undefined &&
                    velocity + value <= limit &&
                    velocity + value >= -limit
                ) {
                    velocity = value;
                }

                return velocity;
        }

        if (arguments.length === 1) {
            if (kind === SmoothUpdateKind.Step) {
                step(position);
            } else if (typeof kind === "number") {
                step(kind);
            }

            return position;
        }

        return position;
    }

    return update;
};

export type SmoothValue = ReturnType<typeof smooth>;
