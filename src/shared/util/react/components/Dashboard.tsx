import React from 'react';
import { TimelinePanel } from '@/feature/timeline/interface/web/react/TimelinePanel';
import { TodayList } from '@/feature/today/interface/web/react/TodayList';

export const Dashboard: React.FC = () => {
    return (
        <div className='flex flex-col flex-1 max-w-[1200px] mx-auto min-h-0'>
            <div className='flex flex-1 gap-4 min-h-0'>
                <TodayList />
                <TimelinePanel />
            </div>
        </div>
    );
};
