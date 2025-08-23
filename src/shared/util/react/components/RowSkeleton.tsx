import React from 'react';

export const RowSkeleton: React.FC = () => (
    <div className='rounded-lg bg-surface-1/50 p-4'>
        <div className='h-4 w-1/3 animate-pulse rounded bg-surface-1/80 mb-3' />
        <div className='h-3 w-2/3 animate-pulse rounded bg-surface-1/80' />
    </div>
);
