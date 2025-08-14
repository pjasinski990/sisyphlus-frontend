export interface PaletteConfig {
    trigger: string;
    delimiter: RegExp;
    quotes: ReadonlyArray<string>;
}

export const defaultPaletteConfig: PaletteConfig = {
    trigger: '/',
    delimiter: /\s+/,
    quotes: ['"', "'"],
};
