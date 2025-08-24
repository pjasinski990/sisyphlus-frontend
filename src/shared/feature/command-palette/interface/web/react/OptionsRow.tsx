import { z } from 'zod';
import { parseWithSyntax } from '@/shared/feature/command-palette/infra/parsing/parse-with-syntax';
import React from 'react';
import { motion } from 'framer-motion';
import { CommandSyntax, type HeadMatcher } from '@/shared/feature/command-palette/entity/syntax';
import {
    commandPaletteController
} from '@/shared/feature/command-palette/interface/controller/command-palette-controller';

const presentAnimate = { scale: [1, 1.15, 1], opacity: [1, 0.85, 1] };
const presentTransition = { duration: 0.18 };

function summarize(v: unknown): string {
    if (Array.isArray(v)) return v.slice(0, 2).join(', ') + (v.length > 2 ? '…' : '');
    if (typeof v === 'string') return v.length > 24 ? v.slice(0, 24) + '…' : v;
    if (v == null) return '';
    return String(v);
}

const Chip: React.FC<{
    label: string;
    provided: boolean;
    valid?: boolean;
    value?: string;
    tooltip?: string;
    rightIcon?: React.ReactNode;
}> = ({ label, provided, valid = true, value, tooltip, rightIcon }) => {
    const state =
        provided && valid ? 'on' :
            provided && !valid ? 'bad' : 'off';

    const cls =
        state === 'on'
            ? 'border-secondary-1 bg-secondary-1/30'
            : state === 'bad'
                ? 'border-danger/60 bg-danger/10 text-danger'
                : 'text-muted-foreground border-surface-1/60';

    return (
        <motion.span
            key={`${label}-${state}-${value ?? ''}`}
            className={`px-2 py-1 rounded-md border text-xs inline-flex items-center gap-1 ${cls}`}
            animate={provided ? presentAnimate : {}}
            transition={presentTransition}
            title={tooltip}
        >
            <span className='truncate max-w-[16rem]'>
                {label}{value ? ': ' : ''}{value}
            </span>
            {rightIcon}
        </motion.span>
    );
};

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
                        const provided = raw != null && String(raw).trim().length > 0;
                        const valid = provided ? (p.schema as z.ZodType).safeParse(raw).success : false;
                        const label = p.rest ? p.name : p.name;
                        const tip = p.hint ?? (p.example ? `e.g. ${p.example}` : undefined);
                        return (
                            <Chip
                                key={`pos-${i}`}
                                label={label}
                                provided={provided}
                                valid={provided ? valid : true}
                                value={provided ? summarize(raw) : undefined}
                                tooltip={tip}
                            />
                        );
                    })}
                </div>
            )}

            {pre.length > 0 && (
                <div className='flex flex-wrap items-center gap-2'>
                    {pre.map((p, i) => {
                        const raw = values[p.name];
                        const provided = Array.isArray(raw) ? raw.length > 0 : raw != null && String(raw).length > 0;

                        let valid = true;
                        if (provided) {
                            if (Array.isArray(raw)) {
                                valid = raw.every(v => (p.schema as z.ZodType).safeParse(v).success);
                            } else {
                                valid = (p.schema as z.ZodType).safeParse(raw).success;
                            }
                        }

                        const baseLabel = `${headToDisplay(p.head)}${p.name}`;
                        const tip = p.hint ?? (p.example ? `e.g. ${headToDisplay(p.head)}${p.example}` : undefined);
                        const value = provided ? summarize(raw) : undefined;

                        return (
                            <Chip
                                key={`pre-${i}`}
                                label={baseLabel}
                                provided={provided}
                                valid={valid}
                                value={value}
                                tooltip={tip}
                                rightIcon={p.multi ? <span aria-hidden>⋮</span> : undefined}
                            />
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

function headToDisplay(head: HeadMatcher): string {
    return head.kind === 'literal' ? head.literal : `/${head.regex.source}/`;
}
