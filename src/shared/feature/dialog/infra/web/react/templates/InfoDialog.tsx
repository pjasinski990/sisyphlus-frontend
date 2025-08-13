import React from 'react';
import { useDialog } from '../useDialog';
import { ButtonPrimary } from '@/shared/util/react/components/Button';

export interface InfoPayload {
    title: string;
    children?: React.ReactNode;
    confirmText?: string;
}

export const InfoDialog: React.FC<{ id: string; payload?: unknown }> = ({ id, payload }) => {
    const { dismiss } = useDialog();
    const p = payload as InfoPayload ?? { title: 'Information' };

    return (
        <div className='p-4 md:p-5'>
            <h3 className='text-lg font-semibold'>{p.title}</h3>

            {p.children}

            <div className='mt-5 flex items-center justify-end gap-4'>
                <ButtonPrimary
                    onClick={() => dismiss(id)}
                >
                    {p.confirmText || 'Ok'}
                </ButtonPrimary>
            </div>
        </div>
    );
};
