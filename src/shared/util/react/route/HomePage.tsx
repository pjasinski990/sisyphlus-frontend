import React from 'react';
import { Dashboard } from '@/shared/util/react/components/Dashboard';


export const HomePage: React.FC = () => {
    return (
        <div className={'flex flex-1'}>
            <Dashboard />
        </div>
    );
};
