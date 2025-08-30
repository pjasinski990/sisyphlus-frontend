import React from 'react';
import { useDialog } from '../useDialog';
import { ButtonDanger, ButtonSecondary, ButtonSuccess } from '@/shared/util/react/components/Button';

type ConfirmPayload = {
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
};

export const ConfirmDialog: React.FC<{ id: string; payload?: unknown }> = ({ id, payload }) => {
    const { resolve, dismiss } = useDialog();
    const p = (payload as ConfirmPayload) ?? { title: 'Are you sure?' };

    return (
        <div className='p-4 md:p-5'>
            <h3 className='text-lg font-semibold'>{p.title}</h3>
            {p.message ? <p className='mt-2 text-sm opacity-80'>{p.message}</p> : null}

            <div className='mt-5 flex items-center justify-end gap-4'>
                <ButtonSecondary onClick={() => dismiss(id)}>
                    {p.cancelText ?? 'Cancel'}
                </ButtonSecondary>

                {p.danger ? (
                    <ButtonDanger onClick={() => resolve(id, { confirmed: true })}>
                        {p.confirmText ?? 'Confirm'}
                    </ButtonDanger>
                ) : (
                    <ButtonSuccess onClick={() => resolve(id, { confirmed: true })}>
                        {p.confirmText ?? 'Confirm'}
                    </ButtonSuccess>
                )}
            </div>
        </div>
    );
};
