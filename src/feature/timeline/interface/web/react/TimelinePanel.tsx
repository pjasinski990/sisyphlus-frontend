import { Timeline } from '@/feature/timeline/interface/web/react/Timeline';
import React from 'react';
import { mockBlocks } from '@/feature/timeline/infra/testing/mock-block';

export const TimelinePanel: React.FC = () => {
    return (
        <div className={'flex flex-2 mt-4 mb-8 bg-surface-2 rounded-xl defined-shadow'}>
            <div className={'flex flex-col items- w-full min-h-0'}>
                <div className={'px-6 border-b border-surface-1/50 text-center w-full'}>
                    <p className={'font-bold'}>
                        {today()}
                    </p>
                </div>
                <Timeline blocks={mockBlocks} />
            </div>
        </div>
    );
};

function today(): string {
    const now = new Date();
    return now.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
}
