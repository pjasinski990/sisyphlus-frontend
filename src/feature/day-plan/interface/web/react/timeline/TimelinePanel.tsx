import { Timeline } from '@/feature/day-plan/interface/web/react/timeline/Timeline';
import React from 'react';
import { TwoPartPillButton } from '@/shared/util/react/components/PillButton';
import { InboxIcon, ListPlusIcon } from 'lucide-react';
import { openCommandPalette } from '@/app-init/shortcut-handlers/open-command-pallete';
import { openInbox } from '@/feature/inbox/interface/web/react/Inbox';
import { WavyText } from '@/shared/util/react/components/WavyText';
import { todayLocalDate } from '@/shared/util/local-date-helper';

export const TimelinePanel: React.FC = () => {

    return (
        <div className={'flex flex-2 my-8 bg-surface-2 rounded-xl defined-shadow'}>
            <div className={'flex flex-col items- w-full min-h-0'}>
                <TopBar />
                <Timeline />
            </div>
        </div>
    );
};

const TopBar: React.FC = () => {
    return (
        <div className={'flex justify-between mx-8 min-h-32'}>
            <div className='flex flex-col py-8'>
                <p className={'text-secondary-2 font-mono'}>
                    {todayLocalDate()}
                </p>
                <WavyText byLetter={false} className={'pt-2'} amp={'0.25rem'} text={'Current focus: Coffee & TV'} />
            </div>
            <div className={'flex flex-col py-8 gap-4'}>
                <TwoPartPillButton
                    left={{
                        content: <InboxPillLeft />,
                        title: 'Open Inbox [I]',
                        onClick: openInbox,
                    }}
                    right={{
                        content: <InboxPillRight />,
                        title: 'Add to Inbox [A]',
                        onClick: () => openCommandPalette('add '),
                    }}
                />
            </div>
        </div>
    );
};

const InboxPillLeft = () => {
    return (
        <div className={'flex items-center gap-2'}>
            <InboxIcon className={'w-5 h-5 stroke-secondary-1'} />
            <span className={'font-mono text-secondary-1 text-sm'}>
                inbox
            </span>
        </div>
    );
};

const InboxPillRight = () => {
    return (
        <ListPlusIcon className={'w-6 h-6 stroke-secondary-1'} />
    );
};
