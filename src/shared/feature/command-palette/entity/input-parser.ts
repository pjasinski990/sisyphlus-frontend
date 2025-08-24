export type Parsed<T> =
    | ({ ok: true; value: T; })
    | ({ ok: false; error: string; });

export interface InputParser<T> {
    parse: (text: string) => Parsed<T>;
}
