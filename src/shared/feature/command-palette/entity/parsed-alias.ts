import { PaletteConfig } from '@/shared/feature/command-palette/entity/palette-config';

export interface ParsedAlias {
    alias: string;
    rest: string;
}

export function parseAlias(line: string, cfg: PaletteConfig): ParsedAlias | null {
    const s = line.trimStart();
    if (!s.startsWith(cfg.trigger)) return null;
    const start = cfg.trigger.length;
    let i = start;
    while (i < s.length && !cfg.delimiter.test(s[i]!)) i++;
    const alias = s.slice(start, i);
    if (!alias) return null;
    while (i < s.length && cfg.delimiter.test(s[i]!)) i++;
    const rest = s.slice(i);
    return { alias, rest };
}
