import { Timeline } from '@/feature/timeline/interface/web/react/Timeline';
import React from 'react';
import { mockBlocks } from '@/feature/timeline/infra/testing/mock-block';
import { TwoPartPillButton } from '@/shared/util/react/components/PillButton';
import { InboxIcon, ListPlusIcon } from 'lucide-react';

export const TimelinePanel: React.FC = () => {
    return (
        <div className={'flex flex-2 my-8 bg-surface-2 rounded-xl defined-shadow'}>
            <div className={'flex flex-col items- w-full min-h-0'}>
                <TopBar />
                <Timeline blocks={mockBlocks} />
            </div>
        </div>
    );
};

const TopBar: React.FC = () => {
    return (
        <div className={'flex justify-between mx-8 min-h-32'}>
            <div className='flex flex-col py-8'>
                <p className={'font-bold'}>
                    {today()}
                </p>
                <div>
                    Current focus: Coffee & TV
                </div>
            </div>
            <div className={'flex flex-col py-8 gap-4'}>
                <TwoPartPillButton
                    left={{
                        content: <InboxPillLeft />,
                        title: 'Open Inbox [I]',
                    }}
                    right={{
                        content: <InboxPillRight />,
                        title: 'Add to Inbox [A]',
                    }}
                />
            </div>
        </div>
    );
};

const InboxPillLeft = () => {
    return (
        <div className={'flex items-center gap-2'}>
            <InboxIcon className={'w-5 h-5'} />
            <span className={'uppercase font-semibold text-sm'}>
                Inbox
            </span>
        </div>
    );
};

const InboxPillRight = () => {
    return (
        <ListPlusIcon />
    );
};

function today(): string {
    const now = new Date();
    return now.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
}
