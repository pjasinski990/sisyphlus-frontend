import React from 'react';
import { DailyTimeline } from '@/feature/timeline/interface/web/react/DailyTimeline';
import { Task } from '@/feature/timeline/entity/task';
import { v4 as uuid } from 'uuid';
import { Inbox } from '@/feature/inbox/interface/web/react/Inbox';

export const Dashboard: React.FC = () => {
    const mockTasks = [
        {
            id: uuid(),
            timespan: {
                from: '8:00',
                to: '9:00',
            },
            title: 'Beat It',
        },
        {
            id: uuid(),
            timespan: {
                from: '9:15',
                to: '11:00',
            },
            title: 'Coffee & TV',
        },
        {
            id: uuid(),
            timespan: {
                from: '12:00',
                to: '13:00',
            },
            title: 'Run To The Store',
        },
        {
            id: uuid(),
            timespan: {
                from: '13:00',
                to: '14:00',
            },
            title: 'Pick Up The Pieces',
        },
        {
            id: uuid(),
            timespan: {
                from: '14:00',
                to: '15:00',
            },
            title: 'Carry That Weight',
        },
        {
            id: uuid(),
            timespan: {
                from: '18:00',
                to: '22:00',
            },
            title: 'Take It Easy',
        }
    ] satisfies Task[];

    return (
        <div className='flex flex-col flex-1 max-w-[1200px] mx-auto min-h-0'>
            <TopBar />
            <div className='flex flex-1 gap-4 min-h-0'>
                <Inbox />
                <DailyTimeline tasks={ mockTasks } />
            </div>
        </div>
    );
};

const TopBar: React.FC = () => {
    return (
        <div className='flex items-center mt-8 px-8 py-4 bg-surface-2 rounded-xl defined-shadow'>
            <h2>
                {today()}
            </h2>
            <div className='flex justify-center items-center ml-auto h-12 w-120 bg-surface-1 rounded-full relative'>
                <div className={'h-12 w-40 bg-accent rounded-full absolute inset-0'} />
                30 / 90 minutes
            </div>
        </div>
    );
};

function today(): string {
    const now = new Date();
    return now.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
}
