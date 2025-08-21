export interface PaletteConfig {
    delimiter: RegExp;
    quotes: ReadonlyArray<string>;
}

export const defaultPaletteConfig: PaletteConfig = {
    delimiter: /([\t ])+/,
    quotes: ['"', "'"],
};
