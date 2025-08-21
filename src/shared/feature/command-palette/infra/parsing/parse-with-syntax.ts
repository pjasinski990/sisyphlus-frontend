import { z } from 'zod';
import { CommandSyntax } from '@/shared/feature/command-palette/entity/syntax';
import { PaletteConfig } from '@/shared/feature/command-palette/entity/palette-config';
import { ArgToken, tokenizeArgs } from './syntax-tokenizer';
import { nok, ok, Result } from '@/shared/feature/auth/entity/result';

export function parseWithSyntax(
    rest: string,
    syntax: CommandSyntax,
    schema: z.ZodTypeAny,
    cfg: PaletteConfig
): Result<string, Record<string, unknown>> {
    const toks = tokenizeArgs(rest, syntax, cfg);
    console.log(toks)

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

    let ti = 0;

    const skipPrefixed = () => {
        while (ti < toks.length && toks[ti]!.kind === 'prefixed') ti++;
    };

    for (let pi = 0; pi < positionals.length; pi++) {
        const spec = positionals[pi]!;

        if (spec.rest) {
            skipPrefixed();
            const parts: string[] = [];
            while (ti < toks.length && toks[ti]!.kind === 'word') {
                parts.push((toks[ti]! as Extract<ArgToken, { kind: 'word' }>).value);
                ti++;
            }
            const joined = parts.join(' ').trim();
            values[spec.name] = joined.length ? joined : undefined;
        } else {
            skipPrefixed();
            if (ti < toks.length && toks[ti]!.kind === 'word') {
                values[spec.name] = (toks[ti]! as Extract<ArgToken, { kind: 'word' }>).value;
                ti++;
            } else {
                values[spec.name] = undefined;
            }
        }
    }

    const res = schema.safeParse(values);
    if (res.success) {
        return ok(res);
    } else {
        const msg = res.error.issues
            .map(i => `${i.path.join('.') || '(root)'}: ${i.message}`)
            .join('; ');
        return nok(msg);
    }
}
