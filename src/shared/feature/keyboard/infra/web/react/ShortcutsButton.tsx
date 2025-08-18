import React from 'react';
import { Tooltip } from '@/shared/util/react/components/Tooltip';
import { Keyboard } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const ShortcutsButton: React.FC<{
    onClick?: () => void;
    className?: string;
}> = ({ onClick, className }) => {
    return (
        <Tooltip tooltip='Keyboard Shortcuts'>
            <button
                type='button'
                onClick={onClick}
                aria-label='Open keyboard shortcuts'
                className={
                    'inline-flex items-center cursor-pointer transition-colors text-foreground hover:text-accent' + (className ?? '')
                }
            >
                <span className='relative inline-block w-6 h-6'>
                    <AnimatePresence mode='wait' initial={false}>
                        <motion.span
                            key='shortcuts-icon'
                            className='absolute inset-0 flex items-center justify-center'
                            initial={{ opacity: 0.6, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0.6, scale: 0.92 }}
                            transition={{ duration: 0.12, ease: 'easeOut' }}
                        >
                            <Keyboard className='w-6 h-6 shrink-0' aria-hidden />
                        </motion.span>
                    </AnimatePresence>
                </span>
            </button>
        </Tooltip>
    );
};
