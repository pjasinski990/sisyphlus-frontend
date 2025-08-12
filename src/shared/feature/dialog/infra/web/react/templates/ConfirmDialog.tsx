import React from 'react';
import { useDialog } from '../useDialog';

type ConfirmPayload = {
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
};

type ConfirmResult = { confirmed: true } | undefined;

export const ConfirmDialog: React.FC<{ id: string; payload: unknown }> = ({ id, payload }) => {
    const { resolve, dismiss } = useDialog();
    const p = (payload as ConfirmPayload) ?? { title: 'Are you sure?' };

    return (
        <div className='p-4 md:p-5'>
            <h3 className='text-lg font-semibold'>{p.title}</h3>
            {p.message ? <p className='mt-2 text-sm opacity-80'>{p.message}</p> : null}

            <div className='mt-5 flex items-center justify-end gap-2'>
                <button
                    onClick={() => dismiss(id)}
                    className='px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-sm'
                >
                    {p.cancelText ?? 'Cancel'}
                </button>
                <button
                    onClick={() => resolve(id, { confirmed: true } satisfies ConfirmResult)}
                    className={`px-3 py-1.5 rounded-lg text-sm text-white ${
                        p.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {p.confirmText ?? 'Confirm'}
                </button>
            </div>
        </div>
    );
};
