import { PaletteConfig } from '@/shared/feature/command-palette/entity/palette-config';

export interface ParsedAlias {
    alias: string;
    rest: string;
}

export function parseAlias(line: string, cfg: PaletteConfig): ParsedAlias | null {
    const s = line.trimStart();
    let i = 0;
    while (i < s.length && !cfg.delimiter.test(s[i]!)) i++;
    const alias = s.slice(0, i);
    if (!alias) return null;
    while (i < s.length && cfg.delimiter.test(s[i]!)) i++;
    const rest = s.slice(i);
    return { alias, rest };
}
