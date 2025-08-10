import React from 'react';
import { DailyTimeline } from '@/shared/feature/timeline/infra/web/react/DailyTimeline';
import { Task } from '@/shared/feature/timeline/entity/task';

export const Dashboard: React.FC = () => {
    const mockTasks = [
        {
            timespan: {
                from: '9:00',
                to: '10:00',
            },
            title: 'Coffee & TV',
        },
        {
            timespan: {
                from: '12:00',
                to: '15:00',
            },
            title: 'Sound & Color',
        },
    ] satisfies Task[];

    return (
        <div className='flex flex-col flex-1 max-w-[1200px] mx-auto min-h-0'>
            <TopBar />
            <div className='flex flex-1 min-h-0'>
                <DailyTimeline tasks={ mockTasks } />
            </div>
        </div>
    );
};

const TopBar: React.FC = () => {
    return (
        <div className='flex items-center mt-8 px-8 py-4 bg-surface-2 rounded-xl defined-shadow'>
            <h2>content</h2>
        </div>
    );
};
