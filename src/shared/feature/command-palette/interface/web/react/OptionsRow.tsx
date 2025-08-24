import { z } from 'zod';
import { parseWithSyntax } from '@/shared/feature/command-palette/infra/parsing/parse-with-syntax';
import React from 'react';
import { motion } from 'framer-motion';
import { CommandSyntax, type HeadMatcher } from '@/shared/feature/command-palette/entity/syntax';
import { commandPaletteController } from '@/shared/feature/command-palette/interface/controller/command-palette-controller';
import { Tooltip } from '@/shared/util/react/components/Tooltip';

const presentAnimate = { scale: [1, 1.15, 1], opacity: [1, 0.85, 1] };
const presentTransition = { duration: 0.18 };

const Chip: React.FC<{
    label: string;
    provided: boolean;
    valid?: boolean;
    value?: string;
    tooltip?: string;
    rightIcon?: React.ReactNode;
    error?: boolean;
}> = ({ label, provided, valid = true, value, tooltip, rightIcon, error = false }) => {
    const state = error ? 'bad' : provided && !valid ? 'bad' : provided ? 'on' : 'off';
    const cls =
        state === 'on'
            ? 'border-secondary-1 bg-secondary-1/30'
            : state === 'bad'
                ? 'border-danger/60 bg-danger/10 text-danger'
                : 'text-muted-foreground border-surface-1/60';

    return (
        <Tooltip tooltip={tooltip}>
            <motion.span
                key={`${label}-${state}-${value ?? ''}`}
                className={`px-2 py-1 rounded-md border text-xs inline-flex items-center gap-1 ${cls}`}
                animate={provided ? presentAnimate : {}}
                transition={presentTransition}
            >
                <span className='truncate max-w-[16rem]'>
                    {label}{value ? ': ' : ''}{value}
                </span>
                {rightIcon}
            </motion.span>
        </Tooltip>
    );
};

function isProvidedScalar(v: unknown): boolean {
    if (v == null) return false;
    if (typeof v === 'string') return v.trim().length > 0;
    return true;
}

function isProvidedValue(v: unknown): boolean {
    if (Array.isArray(v)) return v.length > 0 && v.some(isProvidedScalar);
    return isProvidedScalar(v);
}

function validateScalar(schema: z.ZodType, v: unknown): { ok: boolean; msg?: string } {
    const res = schema.safeParse(v);
    if (res.success) return { ok: true };
    const first = res.error.issues[0];
    const path = first?.path?.join('.') || '';
    const msg = first?.message || 'Invalid value';
    return { ok: false, msg: path ? `${path}: ${msg}` : msg };
}

function validateValue(schema: z.ZodType, v: unknown): { ok: boolean; msg?: string } {
    if (Array.isArray(v)) {
        for (const it of v) {
            const r = validateScalar(schema, it);
            if (!r.ok) return r;
        }
        return { ok: true };
    }
    return validateScalar(schema, v);
}

function buildTip(baseHint?: string, example?: string, invalidMsg?: string, head?: HeadMatcher): string | undefined {
    if (invalidMsg) return invalidMsg;
    if (baseHint) return baseHint;
    if (example && head) return `e.g. ${headToDisplay(head)}${example}`;
    if (example) return `e.g. ${example}`;
    return undefined;
}

function headToDisplay(head: HeadMatcher): string {
    if (head.kind === 'regex' && head.regex.test('\n')) return '⏎ ';
    return head.kind === 'literal' ? head.literal : `${head.regex.source}`;
}

function summarize(v: unknown): string {
    if (Array.isArray(v)) return v.slice(0, 2).join(', ') + (v.length > 2 ? '…' : '');
    if (typeof v === 'string') return v.length > 24 ? v.slice(0, 24) + '…' : v;
    if (v == null) return '';
    return String(v);
}

export const OptionsRow: React.FC<{
    syntax?: CommandSyntax;
    rest: string;
}> = ({ syntax, rest }) => {
    if (!syntax) return null;

    const values = parseWithSyntax(rest, syntax, commandPaletteController.config);
    const pos = syntax.positionals ?? [];
    const pre = syntax.prefixes ?? [];

    return (
        <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className='mt-2 px-3 pb-2 flex flex-wrap items-center gap-2'
        >
            {pos.length > 0 && (
                <div className='flex flex-wrap items-center gap-2'>
                    {pos.map((p, i) => {
                        const raw = values[p.name];
                        const provided = isProvidedValue(raw);
                        const required = p.required ?? false;
                        const missingError = required && !provided;
                        const vres = provided ? validateValue(p.schema as z.ZodType, raw) : { ok: true };
                        const tip = buildTip(
                            p.hint,
                            p.example,
                            missingError ? 'Required' : provided && !vres.ok ? vres.msg : undefined
                        );
                        return (
                            <Chip
                                key={`pos-${i}`}
                                label={p.name}
                                provided={provided}
                                valid={vres.ok}
                                value={provided ? summarize(raw) : undefined}
                                tooltip={tip}
                                error={missingError}
                            />
                        );
                    })}
                </div>
            )}

            {pre.length > 0 && (
                <div className='flex flex-wrap items-center gap-2'>
                    {pre.map((p, i) => {
                        const raw = values[p.name];
                        const provided = isProvidedValue(raw);
                        const required = p.required ?? false;
                        const missingError = required && !provided;
                        const vres = provided ? validateValue(p.schema as z.ZodType, raw) : { ok: true };
                        const baseLabel = `${headToDisplay(p.head)}${p.name}`;
                        const tip = buildTip(
                            p.hint,
                            p.example,
                            missingError ? 'Required' : provided && !vres.ok ? vres.msg : undefined,
                            p.head
                        );
                        const count = Array.isArray(raw) ? raw.length : provided ? 1 : 0;
                        const rightIcon = p.multi && provided ? <span aria-hidden>×{count}</span> : undefined;

                        return (
                            <Chip
                                key={`pre-${i}`}
                                label={baseLabel}
                                provided={provided}
                                valid={vres.ok}
                                value={provided ? summarize(raw) : undefined}
                                tooltip={tip}
                                rightIcon={rightIcon}
                                error={missingError}
                            />
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};
