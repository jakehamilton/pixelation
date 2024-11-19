export const noop = () => {};

export const cloneArrayBuffer = (buffer: ArrayBuffer) => {
    const clone = new ArrayBuffer(buffer.byteLength);

    new Uint8Array(clone).set(new Uint8Array(buffer));

    return clone;
};
