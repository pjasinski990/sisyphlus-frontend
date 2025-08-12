import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { dialogController } from '@/shared/feature/dialog/infra/controllers/dialog-controller';
import { getDialogTemplate } from '@/shared/feature/dialog/infra/web/react/DialogTemplate';

export const DialogHost: React.FC = () => {
    const [state, setState] = React.useState(dialogController.handleGetRegistry().getState());

    React.useEffect(() => dialogController.handleGetRegistry().subscribe(setState), []);

    return (
        <>
            <AnimatePresence>
                {state.stack.map((d, index) => {
                    const Cmp = getDialogTemplate(d.key);
                    if (!Cmp) return null;

                    const baseZ = 50; // adjust to your app
                    const zIndex = (d.zIndex ?? baseZ) + index;

                    return (
                        <React.Fragment key={d.id}>
                            {/* Overlay */}
                            {d.modal && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.5 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className='fixed inset-0 bg-black'
                                    style={{ zIndex }}
                                    onMouseDown={() => {
                                        if (d.dismissible) dialogController.handleDismiss(d.id);
                                    }}
                                />
                            )}

                            {/* Content */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.97, y: 6 }}
                                transition={{ duration: 0.18, type: 'spring', stiffness: 260, damping: 22 }}
                                className='fixed inset-0 p-4 md:p-6 grid place-items-center'
                                style={{ pointerEvents: 'none', zIndex: zIndex + 1 }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape' && d.dismissible) {
                                        e.stopPropagation();
                                        dialogController.handleDismiss(d.id);
                                    }
                                }}
                            >
                                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                                <div
                                    className='pointer-events-auto bg-[var(--surface-2,white)] text-[var(--text,black)] rounded-2xl shadow-xl min-w-[320px] max-w-[92vw] md:max-w-[560px] w-full'
                                    onMouseDown={(e) => e.stopPropagation()}
                                    role='dialog'
                                    aria-modal={d.modal}
                                >
                                    <Cmp id={d.id} payload={d.payload} />
                                </div>
                            </motion.div>
                        </React.Fragment>
                    );
                })}
            </AnimatePresence>
        </>
    );
};
