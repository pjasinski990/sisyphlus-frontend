import React from 'react';

export interface CustomPayload {
    children?: React.ReactNode;
}

export const CustomDialog: React.FC<{ id: string; payload?: unknown }> = ({ id, payload }) => {
    const p = payload as CustomPayload ?? { children: <div>Empty custom dialog</div> };

    return (
        <div className='p-4 md:p-5'>
            {p.children}
        </div>
    );
};
