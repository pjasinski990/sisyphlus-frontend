import { dialogController } from '@/shared/feature/dialog/infra/controllers/dialog-controller';
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { commandPaletteController } from '@/shared/feature/command-palette/interface/controller/command-palette-controller';
import { CommandContext } from '@/shared/feature/command-palette/entity/command';
import { OptionsRow } from '@/shared/feature/command-palette/interface/web/react/OptionsRow';

// TODO refactor, cleanup, show enum options, show required / optionals
export async function openCommandPalette(withCommand?: string, context?: CommandContext) {
    await dialogController.handleOpen({
        key: 'custom',
        payload: { children: <CommandPalette context={context} initialValue={withCommand ?? ''} /> },
        options: { modal: true, dismissible: true },
    });
}

function findActiveAlias(input: string, aliases: string[]): string | null {
    const delimiter = commandPaletteController.handleGetConfig().delimiter;
    for (const a of aliases) {
        if (input.startsWith(a)) {
            const rest = input.slice(a.length);
            if (delimiter.test(rest)) {
                return a;
            }
        }
    }
    return null;
}

function sliceAfterAlias(input: string, alias: string): string {
    const head = `${alias}`;
    if (!input.startsWith(head)) return input;
    const rest = input.slice(head.length);
    return rest.startsWith(' ') ? rest.slice(1) : rest;
}

export const CommandPalette: React.FC<{ initialValue?: string, context?: CommandContext }> = ({ initialValue, context }) => {
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
        return commandPaletteController.handleSuggest(command, context, 20);
    }, [context, value]);

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
        const res = await commandPaletteController.handleExecuteLine(value, context);
        if (!res.ok) {
            setError(res.error);
        } else {
            dialogController.handleCloseTop();
        }
        setSubmitting(false);
    }, [submitting, value, context]);

    const previewNode = React.useMemo(() => {
        if (!active) return null;
        return commandPaletteController.handlePreview(value).preview ?? null;
    }, [active, value]);

    return (
        <div className='w-full'>
            <div className='flex flex-col w-full px-4 py-2 rounded-lg bg-surface-2'>
                <textarea
                    ref={inputRef}
                    className='w-full bg-transparent outline-none text-base placeholder:text-muted-foreground text-[1.1rem] leading-[1.4] resize-none min-h-[2.5rem] max-h-[14rem]'
                    placeholder={''}
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

            <div className='mt-2'>
                <div className='relative overflow-y-auto overflow-x-auto'>
                    <AnimatePresence initial={false} mode='wait'>
                        {previewNode && (
                            <div className='hidden md:block bg-surface-2 backdrop-blur rounded-lg p-2'>
                                <motion.div
                                    key='preview'

                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {previewNode}
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                    <div className='divide-y divide-surface-1/50'>
                        <div className='w-full pb-2'>
                            <AnimatePresence initial={false} mode='sync'>
                                {active ? (
                                    <motion.div
                                        key={`opts-${active.entry.id}-${active.alias}`}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 6 }}
                                        transition={{ duration: 0.15 }}
                                        className='h-full flex items-center'
                                    >
                                        <OptionsRow syntax={active.entry.syntax} rest={active.rest} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        layout
                                        key='opts-empty'
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.6 }}
                                        exit={{ opacity: 0 }}
                                        className='h-full flex items-center px-3 text-xs text-muted-foreground'
                                    />
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
                                        const alias = s.aliases.at(0);
                                        const fill = alias ? `${alias} ` : '';
                                        setValue(fill);
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
                                                    animate={isActive ? { scale: [1, 1.2, 1], opacity: [1, 0.85, 1] } : {}}
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
        </div>
    );
};
