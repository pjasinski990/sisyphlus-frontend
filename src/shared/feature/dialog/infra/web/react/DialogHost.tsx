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
                    const DialogTemplate = getDialogTemplate(d.key);
                    if (!DialogTemplate) return null;

                    const baseZ = 50;
                    const zIndex = (d.zIndex ?? baseZ) + index;

                    return (
                        <React.Fragment key={d.id}>
                            {d.modal && (
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
                                initial={{ opacity: 0, scale: 0.80, y: 0 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.60, y: 0 }}
                                transition={{ duration: 0.08, type: 'tween' }}
                                className='fixed inset-0 p-4 md:p-6 grid place-items-center overflow-hidden'
                                style={{ pointerEvents: 'none', zIndex: zIndex + 1 }}
                            >
                                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                                <div
                                    className='pointer-events-auto bg-surface-3 rounded-2xl shadow-xl min-w-[320px] max-w-[92vw] md:max-w-[560px] w-full'
                                    onMouseDown={(e) => e.stopPropagation()}
                                    role='dialog'
                                    aria-modal={d.modal}
                                >
                                    <DialogTemplate id={d.id} payload={d.payload} />
                                </div>
                            </motion.div>
                        </React.Fragment>
                    );
                })}
            </AnimatePresence>
        </>
    );
};
