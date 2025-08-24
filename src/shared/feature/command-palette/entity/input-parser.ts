export type Span = { start: number; end: number }; // inclusive-exclusive
export type Hint =
    | { kind: 'time'; span?: Span; display: string }
    | { kind: 'duration'; span?: Span; display: string }
    | { kind: 'date'; span?: Span; display: string }
    | { kind: 'rrule'; span?: Span; display: string }
    | { kind: 'field'; name: string; span?: Span; display?: string };

export type Parsed<T> =
    | { ok: true; value: T }
    | { ok: false; error: string };

export type RichParse<T> =
    | ({ ok: true; value: T; hints: Hint[] })
    | ({ ok: false; error: string; hints: Hint[] });

export interface RichInputParser<T> {
    parse: (text: string) => RichParse<T>;
}
