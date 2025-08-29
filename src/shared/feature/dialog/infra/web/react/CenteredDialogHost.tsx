import React from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { dialogController } from '@/shared/feature/dialog/infra/controllers/dialog-controller';
import { getDialogTemplate } from '@/shared/feature/dialog/infra/web/react/DialogTemplate';
import { CenteredDialogInstance } from '@/shared/feature/dialog/entity/dialog-instance';
import { useShortcutScope } from '@/shared/feature/keyboard/infra/web/react/useShortcutScope';

function AutoHeight({ children }: { children: React.ReactNode }) {
    const ref = React.useRef<HTMLDivElement>(null);
    const [h, setH] = React.useState<number | 'auto'>('auto');

    React.useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            const next = Math.ceil(entry.contentRect.height);
            setH(() => next);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return (
        <motion.div
            animate={{ height: h }}
            initial={{ height: 'auto' }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            style={{ overflow: 'hidden', willChange: 'height' }}
        >
            <div ref={ref}>{children}</div>
        </motion.div>
    );
}

export const CenteredDialogHost: React.FC = () => {
    const [state, setState] = React.useState(dialogController.handleGetRegistry().getState());
    React.useEffect(() => dialogController.handleGetRegistry().subscribe(setState), []);

    const centered = React.useMemo(
        () => state.stack.filter(d => d.options.variant === 'centered') as CenteredDialogInstance[],
        [state.stack]
    );

    const hasModal = centered.some(d => d.options.modal);

    return (
        <>
            {hasModal && (<MountModalShortcuts />)}
            <AnimatePresence>
                {centered.map((d, index) => {
                    const DialogTemplate = getDialogTemplate(d.key);
                    if (!DialogTemplate) return null;

                    const zIndex = d.options.zIndex + index;

                    return (
                        <React.Fragment key={d.id}>
                            <LayoutGroup id={d.id}>
                                {d.options.modal && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.5 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className='fixed inset-0 bg-black overflow-hidden'
                                        style={{ zIndex }}
                                        onMouseDown={() => {
                                            if (d.dismissible) dialogController.handleDismiss(d.id);
                                        }}
                                    />
                                )}

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.12, type: 'tween' }}
                                    className='fixed inset-0 p-4 md:p-6 overflow-hidden flex items-center justify-center'
                                    style={{ pointerEvents: 'none', zIndex: zIndex + 1 }}
                                >
                                    <div className='pointer-events-none w-full' style={{ maxWidth: 'min(92vw, 800px)' }}>
                                        <div className='pointer-events-auto bg-surface-3 rounded-2xl shadow-xl overflow-hidden'>
                                            <AutoHeight>
                                                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                                                <div onMouseDown={(e) => e.stopPropagation()} role='dialog' aria-modal={d.options.modal}>
                                                    <DialogTemplate id={d.id} payload={d.payload} />
                                                </div>
                                            </AutoHeight>
                                        </div>
                                    </div>
                                </motion.div>
                            </LayoutGroup>
                        </React.Fragment>
                    );
                })}
            </AnimatePresence>
        </>
    );
};

export const MountModalShortcuts: React.FC = () => {
    useShortcutScope('modal', true);
    return null;
};
