import React from 'react';
import { Dashboard } from '@/shared/feature/timeline/infra/web/react/Dashboard';


export const HomePage: React.FC = () => {
    return (
        <div className={'flex flex-1'}>
            <Dashboard />
        </div>
    );
};
