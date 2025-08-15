import { dialogController } from '@/shared/feature/dialog/infra/controllers/dialog-controller';
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CommandSyntax, HeadMatcher, PrefixSpec } from '@/shared/feature/command-palette/entity/syntax';
import { commandPaletteController } from '@/shared/feature/command-palette/interface/controller/command-palette-controller';

// TODO refactor, cleanup, show enum options, show required / optionals
export async function openCommandPalette() {
    await dialogController.handleOpen({
        key: 'custom',
        payload: { children: <CommandPalette /> },
        options: { modal: true, dismissible: true },
    });
}

function headToDisplay(head: HeadMatcher): string {
    return head.kind === 'literal' ? head.literal : `/${head.regex.source}/`;
}

function findActiveAlias(input: string, trigger: string, aliases: string[]): string | null {
    for (const a of aliases) {
        if (input.startsWith(`${trigger}${a}`)) return a;
    }
    return null;
}

function sliceAfterAlias(input: string, trigger: string, alias: string): string {
    const head = `${trigger}${alias}`;
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

const presentAnimate = { scale: [1, 1.06, 1], boxShadow: ['0 0 0px rgba(255,255,255,0)', '0 0 6px rgba(255,255,255,0.9)', '0 0 0px rgba(255,255,255,0)'] };
const presentTransition = { duration: 0.18 };

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
            transition={{ duration: 0.16 }}
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
                                    filled ? 'text-accent border-accent/50 bg-accent/10' : 'text-muted-foreground border-surface-1/60'
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
                                    provided ? 'text-accent border-accent/50 bg-accent/10' : 'text-muted-foreground border-surface-1/60'
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
    const trigger = commandPaletteController.config.trigger;
    const [value, setValue] = React.useState<string>(initialValue ?? trigger);
    const [error, setError] = React.useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const suggestions = React.useMemo(() => {
        const t = trigger;
        const v = value.startsWith(t)
            ? value.slice(t.length).split(commandPaletteController.config.delimiter)[0] ?? ''
            : value;
        return commandPaletteController.handleSuggest(v, 20);
    }, [value, trigger]);

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = async (e) => {
        if (e.key === 'Escape') return;
        if (e.key === 'Enter') {
            e.preventDefault();
            try {
                await commandPaletteController.handleExecuteLine(value);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to run command');
            }
        }
    };

    const active = React.useMemo(() => {
        for (const s of suggestions) {
            const alias = findActiveAlias(value, trigger, s.aliases);
            if (alias) {
                const rest = sliceAfterAlias(value, trigger, alias);
                return { entry: s, alias, rest };
            }
        }
        return null;
    }, [suggestions, value, trigger]);

    return (
        <div className='w-full'>
            <div className='flex flex-col w-full px-4 py-2 rounded-lg bg-surface-2'>
                <input
                    ref={inputRef}
                    className='w-full bg-transparent outline-none text-base placeholder:text-muted-foreground text-[1.1rem]'
                    type='text'
                    placeholder={`${trigger}in do laundry @home !low #chore`}
                    value={value}
                    onChange={(e) => { setValue(e.target.value); setError(null); }}
                    onKeyDown={onKeyDown}
                    /* eslint-disable-next-line jsx-a11y/no-autofocus */
                    autoFocus
                />
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        className='mt-2 text-sm text-danger'
                        initial={{ opacity: 0, y: -2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2 }}
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                className='mt-2 mx-2 relative overflow-y-auto overflow-x-auto'
            >
                <div className='divide-y divide-surface-1/50'>
                    <div
                        className='w-full pb-2'
                    >
                        <AnimatePresence initial={false} mode='popLayout'>
                            {active ? (
                                <motion.div
                                    key={`opts-${active.entry.id}-${active.alias}`}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }}
                                    transition={{ duration: 0.16 }}
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
                        const activeAlias = findActiveAlias(value, trigger, s.aliases);
                        return (
                            <button
                                key={s.id}
                                type='button'
                                className='flex justify-between items-start gap-3 p-3 text-sm hover:bg-accent/10 cursor-pointer w-full bg-transparent text-left'
                                onClick={() => {
                                    setValue(`${trigger}${s.aliases.at(0)} `);
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
                                                        ? {
                                                            scale: [1, 1.1, 1],
                                                            opacity: [1, 0.85, 1],
                                                            boxShadow: [
                                                                '0 0 0px rgba(255,255,255,0)',
                                                                '0 0 6px rgba(255,255,255,1)',
                                                                '0 0 0px rgba(255,255,255,0)',
                                                            ],
                                                        }
                                                        : {}
                                                }
                                                transition={{ duration: 0.16 }}
                                                className={`px-2 py-1 border rounded-md text-sm ${isActive ? 'text-accent bg-accent/10' : ''}`}
                                            >
                                                {trigger}{a}
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
