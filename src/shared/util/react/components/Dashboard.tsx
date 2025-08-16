import React from 'react';
import { Inbox } from '@/feature/inbox/interface/web/react/Inbox';
import { TimelinePanel } from '@/feature/timeline/interface/web/react/TimelinePanel';

export const Dashboard: React.FC = () => {
    return (
        <div className='flex flex-col flex-1 max-w-[1200px] mx-auto min-h-0'>
            <div className='flex flex-1 gap-4 min-h-0'>
                <Inbox />
                <TimelinePanel />
            </div>
        </div>
    );
};
