import React from 'react';
import { Theme } from '@/feature/theme/entity/theme';
import { themeController } from '../../controller/theme-controller';
import { Tooltip } from '@/shared/feature/utils/components/Tooltip';
import { Sun, Moon, Laptop } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const order: Theme[] = ['light', 'dark', 'system'];

function nextTheme(t: Theme): Theme {
    const i = order.indexOf(t);
    return order[(i + 1) % order.length];
}

export const ThemeButton: React.FC = () => {
    const [theme, setTheme] = React.useState<Theme>('system');
    const [effective, setEffective] = React.useState<'light' | 'dark'>('light');

    React.useEffect(() => {
        try {
            const stored = (localStorage.getItem('theme') as Theme | null) ?? 'system';
            setTheme(stored);
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setEffective(stored === 'system' ? (prefersDark ? 'dark' : 'light') : stored);
        } catch (error: unknown) {
            console.error(error);
        }
    }, []);

    React.useEffect(() => {
        return themeController.handleSystemThemeUpdated((t) => {
            if (theme === 'system') setEffective(t);
        });
    }, [theme]);

    const handleClick = () => {
        const next = nextTheme(theme);
        setTheme(next);
        themeController.handleNewTheme(next);
        if (next !== 'system') setEffective(next);
    };

    const label =
        theme === 'system' ? `System (${effective})` : theme.charAt(0).toUpperCase() + theme.slice(1);

    const iconFor = (t: Theme | 'light' | 'dark') => {
        switch (t) {
            case 'light':
                return <Sun className='w-6 h-6 shrink-0' aria-hidden />;
            case 'dark':
                return <Moon className='w-6 h-6 shrink-0' aria-hidden />;
            case 'system':
                return <Laptop className='w-6 h-6 shrink-0' aria-hidden />;
            default:
                return null;
        }
    };

    const currentVisual: 'light' | 'dark' | 'system' = theme === 'system' ? 'system' : theme;
    const currentIcon = currentVisual === 'system' ? iconFor('system') : iconFor(currentVisual);

    return (
        <Tooltip tooltip={label}>
            <button
                type='button'
                onClick={handleClick}
                aria-label={`Toggle theme, current: ${label}`}
                className='inline-flex items-center cursor-pointer transition-colors text-foreground hover:text-accent focus:outline-none rounded-md'
            >
                <span className='relative inline-block w-6 h-6'>
                    <AnimatePresence mode='wait' initial={false}>
                        <motion.span
                            key={`${currentVisual}-${effective}`}
                            className='absolute inset-0 flex items-center justify-center'
                            initial={{ opacity: 0.5, scale: 0.92, rotate: -8 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0.5, scale: 0.92, rotate: 8 }}
                            transition={{ duration: 0.12, ease: 'easeOut' }}
                        >
                            {currentIcon}
                        </motion.span>
                    </AnimatePresence>
                </span>
            </button>
        </Tooltip>
    );
};
