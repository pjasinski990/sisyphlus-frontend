import React from 'react';

export interface ContextMenuPayload {
    className?: string;
    children?: React.ReactNode;
}

export const ContextMenuDialog: React.FC<{ className?: string, payload?: unknown }> = ({ className, payload }) => {
    const p = payload as ContextMenuPayload ?? { children: <div>Empty menu dialog</div> };

    return (
        <div className={`${className}`}>
            {p.children}
        </div>
    );
};
