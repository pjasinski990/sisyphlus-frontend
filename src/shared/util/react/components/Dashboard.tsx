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
        <div className='flex items-center mt-8 px-8 py-4 bg-surface-2 rounded-xl defined-shadow'>
            <div>
                Current focus: Carry That Weight
            </div>
            <div className='flex justify-center items-center ml-auto h-12 w-120 bg-surface-1 rounded-full relative'>
                <div className={'h-12 w-40 bg-accent rounded-full absolute inset-0'} />
                <div className={'h-10 w-10 rounded-full absolute left-29 bg-surface-3'}></div>
                30 / 90 minutes
            </div>
        </div>
    );
};
