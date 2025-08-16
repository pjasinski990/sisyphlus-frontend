import React from 'react';
import { Inbox } from '@/feature/inbox/interface/web/react/Inbox';
import { TimelinePanel } from '@/feature/timeline/interface/web/react/TimelinePanel';

export const Dashboard: React.FC = () => {
    return (
        <div className='flex flex-col flex-1 max-w-[1200px] mx-auto min-h-0'>
            <TopBar />
            <div className='flex flex-1 gap-4 min-h-0'>
                <Inbox />
                <TimelinePanel />
            </div>
        </div>
    );
};

const TopBar: React.FC = () => {
    return (
        <div className='flex items-center mt-8 px-8 py-4 bg-surface-2 rounded-xl defined-shadow min-h-32'>
            <div>
                Current focus: Coffee & TV
            </div>
        </div>
    );
};
