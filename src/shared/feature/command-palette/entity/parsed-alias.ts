import { PaletteConfig } from '@/shared/feature/command-palette/entity/palette-config';

export interface ParsedAlias {
    alias: string;
    rest: string;
}

export function parseAlias(line: string, cfg: PaletteConfig): ParsedAlias | null {
    line = trimDelimiterStart(line, cfg.delimiter);

    const { head: candidate, rest } = sliceAtDelimiter(line, cfg.delimiter);
    if (!candidate) return null;

    return { alias: candidate, rest: trimDelimiterStart(rest, cfg.delimiter) };
}

function trimDelimiterStart(line: string, delimiter: RegExp): string {
    let i = 0;
    while (i < line.length && delimiter.test(line[i]!)) i++;
    return line.slice(i);
}

function sliceAtDelimiter(line: string, delimiter: RegExp): { head: string; rest: string } {
    let i = 0;
    while (i < line.length && !delimiter.test(line[i]!)) i++;
    return { head: line.slice(0, i), rest: line.slice(i) };
}
