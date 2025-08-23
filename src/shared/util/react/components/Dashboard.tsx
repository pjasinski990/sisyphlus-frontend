import React from 'react';
import { TimelinePanel } from '@/feature/day-plan/interface/web/react/timeline/TimelinePanel';
import { TodayList } from '@/feature/day-plan/interface/web/react/today-list/TodayList';

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
