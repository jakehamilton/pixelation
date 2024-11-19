export type Tagged<Name extends string, Type> = Type & { __tag: Name };
