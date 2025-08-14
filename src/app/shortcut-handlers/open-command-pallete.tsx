import { dialogController } from '@/shared/feature/dialog/infra/controllers/dialog-controller';
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { commandPaletteController } from '@/shared/feature/command-palette/interface/controller/command-palette-controller';

export async function openCommandPalette() {
    await dialogController.handleOpen({
        key: 'custom',
        payload: { children: <CommandPalette /> },
        options: { modal: true, dismissible: true },
    });
}

export const CommandPalette: React.FC<{ initialValue?: string }> = ({ initialValue }) => {
    const trigger = commandPaletteController.config.trigger;
    const [value, setValue] = React.useState<string>(initialValue ?? trigger);
    const [error, setError] = React.useState<string | null>(null);

    const suggestions = React.useMemo(() => {
        const t = trigger;
        const v = value.startsWith(t) ? value.slice(t.length).split(commandPaletteController.config.delimiter)[0] ?? '' : value;
        return commandPaletteController.handleSuggest(v, 20);
    }, [value, trigger]);

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = async (e) => {
        if (e.key === 'Escape') {
            return;
        } else if (e.key === 'Enter') {
            e.preventDefault();
            try {
                await commandPaletteController.handleExecuteLine(value);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to run command');
            }
        }
    };

    return (
        <div className='flex flex-col w-full border border-surface-1/50 px-4 py-2 rounded-lg bg-surface-2'>
            <input
                className='bg-transparent outline-none text-base placeholder:text-muted-foreground'
                type='text'
                placeholder={`Command… (e.g., ${trigger}in do laundry @home !low #chore)`}
                value={value}
                onChange={(e) => {
                    setValue(e.target.value); setError(null);
                }}
                onKeyDown={onKeyDown}
                /* eslint-disable-next-line jsx-a11y/no-autofocus */
                autoFocus
            />
            <AnimatePresence>{error && (
                <motion.div className='mt-2 text-sm text-danger' initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -2 }}>
                    {error}
                </motion.div>
            )}</AnimatePresence>
            <div className='mt-2 max-h-64 overflow-y-auto'>
                {suggestions.map(s => (
                    <div key={s.id} className='px-2 py-1 text-sm hover:bg-accent/10 rounded'>
                        <div className='font-medium'>{s.title}</div>
                        <div className='text-muted-foreground text-xs'>{s.subtitle ?? s.aliases.map(a => `${trigger}${a}`).join('  ')}</div>
                    </div>
                ))}
                {suggestions.length === 0 && (
                    <div className='px-2 py-3 text-sm text-muted-foreground'>Start with <kbd>{trigger}</kbd> then a command alias…</div>
                )}
            </div>
            <div className='mt-2 text-xs text-muted-foreground flex items-center gap-3'>
                <span>Enter to run</span>
                <span>Esc to close</span>
            </div>
        </div>
    );
};
