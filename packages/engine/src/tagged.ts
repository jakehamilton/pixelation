/**
 * Create a tagged type, unique against the original type.
 *
 * @example
 * type Id = Tagged<"Id", String>;
 */
export type Tagged<Name extends string, Type> = Type & { __tag: Name };
