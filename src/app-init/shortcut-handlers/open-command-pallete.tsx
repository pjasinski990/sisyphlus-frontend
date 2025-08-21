import { dialogController } from '@/shared/feature/dialog/infra/controllers/dialog-controller';
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CommandSyntax, HeadMatcher, PrefixSpec } from '@/shared/feature/command-palette/entity/syntax';
import {
    commandPaletteController
} from '@/shared/feature/command-palette/interface/controller/command-palette-controller';

// TODO refactor, cleanup, show enum options, show required / optionals
export async function openCommandPalette(withCommand?: string) {
    await dialogController.handleOpen({
        key: 'custom',
        payload: { children: <CommandPalette initialValue={withCommand ?? ''} /> },
        options: { modal: true, dismissible: true },
    });
}

function headToDisplay(head: HeadMatcher): string {
    return head.kind === 'literal' ? head.literal : `/${head.regex.source}/`;
}

function findActiveAlias(input: string, aliases: string[]): string | null {
    for (const a of aliases) {
        if (input.startsWith(a)) return a;
    }
    return null;
}

function sliceAfterAlias(input: string, alias: string): string {
    const head = `${alias}`;
    if (!input.startsWith(head)) return input;
    const rest = input.slice(head.length);
    return rest.startsWith(' ') ? rest.slice(1) : rest;
}

function isPrefixProvided(rest: string, p: PrefixSpec): boolean {
    if (p.head.kind === 'literal') {
        const lit = p.head.literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`${lit}\\S+`);
        return re.test(rest);
    } else {
        try {
            return p.head.regex.test(rest);
        } catch {
            return false;
        }
    }
}

const presentAnimate = { scale: [1, 1.2, 1], opacity: [1, 0.85, 1] };
const presentTransition = { duration: 0.15 };

const OptionsRow: React.FC<{
    syntax?: CommandSyntax;
    rest: string;
}> = ({ syntax, rest }) => {
    if (!syntax) return null;

    const positionals = syntax.positionals ?? [];
    const prefixes = syntax.prefixes ?? [];

    return (
        <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className='mt-2 px-3 pb-2 flex flex-wrap items-center gap-2'
        >
            {positionals.length > 0 && (
                <div className='flex flex-wrap items-center gap-2'>
                    {positionals.map((pos, i) => {
                        const label = pos.rest ? `${pos.name}` : pos.name;
                        const filled = /\S/.test(rest.replace(/(?:^|\s)([@#!]\S+)/g, '').trim());
                        return (
                            <motion.span
                                key={`pos-${i}-${filled ? 'on' : 'off'}`}
                                className={`px-2 py-1 rounded-md border text-xs ${
                                    filled ? 'border-secondary-1 bg-secondary-1/30' : 'text-muted-foreground border-surface-1/60'
                                }`}
                                animate={filled ? presentAnimate : {}}
                                transition={presentTransition}
                            >
                                {label}
                            </motion.span>
                        );
                    })}
                </div>
            )}

            {prefixes.length > 0 && (
                <div className='flex flex-wrap items-center gap-2'>
                    {prefixes.map((p, i) => {
                        const provided = isPrefixProvided(rest, p);
                        return (
                            <motion.span
                                key={`pre-${i}-${provided ? 'on' : 'off'}`}
                                className={`px-2 py-1 rounded-md border text-xs inline-flex items-center gap-1 ${
                                    provided ? 'border-secondary-1 bg-secondary-1/30' : 'text-muted-foreground border-surface-1/60'
                                }`}
                                animate={provided ? presentAnimate : {}}
                                transition={presentTransition}
                                title={p.multi ? 'Can be used multiple times' : undefined}
                            >
                                <span className=''>{headToDisplay(p.head)}{p.name}</span>
                                {p.multi && <span aria-hidden>⋮</span>}
                            </motion.span>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export const CommandPalette: React.FC<{ initialValue?: string }> = ({ initialValue }) => {
    const [value, setValue] = React.useState<string>(initialValue ?? '');
    const [error, setError] = React.useState<string | null>(null);
    const [submitting, setSubmitting] = React.useState(false);
    const inputRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
        if (inputRef.current) {
            const len = inputRef.current.value.length;
            inputRef.current.selectionStart = len;
            inputRef.current.selectionEnd = len;
        }
    }, []);

    const autosize = React.useCallback(() => {
        const el = inputRef.current;
        if (!el) return;
        el.style.height = '0px';
        const next = Math.min(el.scrollHeight, 220);
        el.style.height = `${next}px`;
    }, []);

    React.useLayoutEffect(() => {
        autosize();
    }, [value, autosize]);

    const suggestions = React.useMemo(() => {
        const trimmed = value.trimStart();
        const match = trimmed.match(/^\S+/);
        const command = match ? match[0] : '';
        return commandPaletteController.handleSuggest(command, 20);
    }, [value]);

    const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = async (e) => {
        if (e.key === 'Escape') return;

        if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            const el = e.currentTarget;
            const start = el.selectionStart ?? value.length;
            const end = el.selectionEnd ?? value.length;
            const next = value.slice(0, start) + '\n' + value.slice(end);
            setValue(next);
            requestAnimationFrame(() => {
                if (inputRef.current) {
                    inputRef.current.selectionStart = inputRef.current.selectionEnd = start + 1;
                    autosize();
                }
            });
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            await submit();
        }
    };

    const active = React.useMemo(() => {
        for (const s of suggestions) {
            const alias = findActiveAlias(value, s.aliases);
            if (alias) {
                const rest = sliceAfterAlias(value, alias);
                return { entry: s, alias, rest };
            }
        }
        return null;
    }, [suggestions, value]);

    const submit = React.useCallback(async () => {
        if (submitting) return;

        setSubmitting(true);
        setError(null);
        const res = await commandPaletteController.handleExecuteLine(value);
        if (!res.ok) {
            setError(res.error);
        } else {
            dialogController.handleCloseTop();
        }
        setSubmitting(false);
    }, [value, submitting]);

    return (
        <div className='w-full'>
            <div className='flex flex-col w-full px-4 py-2 rounded-lg bg-surface-2'>
                <textarea
                    ref={inputRef}
                    className='w-full bg-transparent outline-none text-base placeholder:text-muted-foreground text-[1.1rem] leading-[1.4] resize-none min-h-[2.5rem] max-h-[14rem]'
                    placeholder={'in do laundry @home !low #chore'}
                    value={value}
                    onChange={(e) => { setValue(e.target.value); setError(null); }}
                    onKeyDown={onKeyDown}
                    /* eslint-disable-next-line jsx-a11y/no-autofocus */
                    autoFocus
                    disabled={submitting}
                    rows={1}
                />
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        className='mt-2 text-sm text-danger'
                        initial={{ opacity: 0, y: -2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2 }}
                        transition={{ duration: 0.15 }}
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className='mt-2 mx-2 relative overflow-y-auto overflow-x-auto'>
                <div className='divide-y divide-surface-1/50'>
                    <div className='w-full pb-2'>
                        <AnimatePresence initial={false} mode='popLayout'>
                            {active ? (
                                <motion.div
                                    key={`opts-${active.entry.id}-${active.alias}`}
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.15 }}
                                    className='h-full flex items-center'
                                >
                                    <OptionsRow syntax={active.entry.syntax} rest={active.rest} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key='opts-empty'
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.6 }}
                                    exit={{ opacity: 0 }}
                                    className='h-full flex items-center px-3 text-xs text-muted-foreground'
                                >
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {suggestions.map((s) => {
                        const activeAlias = findActiveAlias(value, s.aliases);
                        return (
                            <button
                                key={s.id}
                                type='button'
                                className='flex justify-between items-start gap-3 p-3 text-sm hover:bg-secondary-1/10 cursor-pointer w-full bg-transparent text-left'
                                onClick={() => {
                                    setValue(s.aliases.at(0) ?? '');
                                    inputRef.current?.focus();
                                }}
                            >
                                <div className='min-w-0 flex-1'>
                                    <div className='font-medium break-words'>{s.title}</div>
                                    <div className='text-muted-foreground text-xs break-words'>{s.subtitle}</div>
                                </div>

                                <div className='flex gap-2 text-muted'>
                                    {s.aliases.map((a, i) => {
                                        const isActive = a === activeAlias;
                                        return (
                                            <motion.span
                                                key={i + (isActive ? '-active' : '-inactive')}
                                                initial={isActive ? { scale: 1, opacity: 1 } : {}}
                                                animate={
                                                    isActive
                                                        ? { scale: [1, 1.2, 1], opacity: [1, 0.85, 1] }
                                                        : {}
                                                }
                                                transition={{ duration: 0.15 }}
                                                className={`px-2 py-1 border rounded-md text-sm ${isActive ? 'text-text-1 border-secondary-1 bg-secondary-1/30' : ''}`}
                                            >
                                                {a}
                                            </motion.span>
                                        );
                                    })}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {suggestions.length === 0 && (
                    <div className='px-2 py-3 text-sm text-muted-foreground'>No commands found</div>
                )}
            </div>
        </div>
    );
};
