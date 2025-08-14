import { z } from 'zod';
import { CommandSyntax } from '@/shared/feature/command-palette/entity/syntax';
import { PaletteConfig } from '@/shared/feature/command-palette/entity/palette-config';
import { tokenizeArgs } from './syntax-tokenizer';

export function parseWithSyntax(
    rest: string,
    syntax: CommandSyntax,
    schema: z.ZodType<unknown>,
    cfg: PaletteConfig
): Record<string, unknown> {
    const toks = tokenizeArgs(rest, syntax, cfg);

    const values: Record<string, unknown> = {};
    const positionals = syntax.positionals ?? [];
    const prefixes = new Map<string, { multi: boolean }>();
    for (const p of (syntax.prefixes ?? [])) prefixes.set(p.name, { multi: !!p.multi });

    const prefBuckets = new Map<string, Array<string>>();
    for (const t of toks) {
        if (t.kind === 'prefixed') {
            const bucket = prefBuckets.get(t.name) ?? [];
            bucket.push(t.raw);
            prefBuckets.set(t.name, bucket);
        }
    }
    for (const [name, { multi }] of prefixes.entries()) {
        const arr = prefBuckets.get(name) ?? [];
        values[name] = multi ? arr : (arr[0] ?? undefined);
    }

    const words = toks.filter(t => t.kind === 'word').map(t => t.value);
    let wi = 0;
    for (let pi = 0; pi < positionals.length; pi++) {
        const spec = positionals[pi]!;
        if (spec.rest) {
            const joined = words.slice(wi).join(' ').trim();
            values[spec.name] = joined.length ? joined : undefined;
            wi = words.length;
        } else {
            values[spec.name] = words[wi] ?? undefined;
            wi++;
        }
    }

    return schema.parse(values) as Record<string, unknown>;
}
