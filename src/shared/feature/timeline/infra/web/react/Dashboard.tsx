import React from 'react';
import { DailyTimeline } from '@/shared/feature/timeline/infra/web/react/DailyTimeline';

export const Dashboard: React.FC = () => {
    return (
        <div className={'flex flex-col flex-1 max-w-[1200px] mx-auto'}>
            <TopBar />
            <DailyTimeline hourSpan={{ from: 0, to: 24 }} />
        </div>
    );
}

const TopBar: React.FC = () => {
    return (
        <div className={'flex items-center mt-8 px-8 py-4 bg-surface-2 rounded-xl defined-shadow'}>
            <h2>
                content
            </h2>
        </div>
    );
}
