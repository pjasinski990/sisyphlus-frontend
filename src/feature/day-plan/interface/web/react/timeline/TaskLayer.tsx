import React from 'react';
import { useDayTimeblockIdsQuery } from '@/feature/day-plan/interface/web/react/use-day-timeblocks-ids';
import { todayLocalDate } from '@/shared/util/local-date-helper';
import { useBlocksByIdsQuery } from '@/feature/day-plan/interface/web/react/use-blocks-by-ids';
import { RowSkeleton } from '@/shared/util/react/components/RowSkeleton';
import { BlockCard } from '@/feature/day-plan/interface/web/react/timeline/BlockCard';
import { timelineConfig } from '@/feature/day-plan/entity/timeline-config';

export const TaskLayer = () => {
    const blockIdsQ = useDayTimeblockIdsQuery(todayLocalDate());

    const ids = blockIdsQ.data ?? [];
    const hasBlocks = blockIdsQ.status === 'success' && ids.length > 0;

    const blocksQ = useBlocksByIdsQuery(ids, { enabled: hasBlocks });

    const isInitialBlocklistLoading = blockIdsQ.status === 'pending' && !blockIdsQ.data;
    if (isInitialBlocklistLoading) {
        return (
            <div className='flex flex-1 flex-col bg-surface-2 rounded-xl defined-shadow my-8'>
                <div className='flex flex-col gap-4 p-4'>
                    <RowSkeleton />
                    <RowSkeleton />
                    <RowSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className='h-full absolute inset-x-10 pointer-events-none'>
            {(blocksQ.data ? Array.from(blocksQ.data) : []).map(([blockId, block]) => {
                if (block) {
                    return (
                        <BlockCard
                            key={blockId}
                            cfg={timelineConfig}
                            block={block}
                        />
                    );
                }

                if (hasBlocks && blocksQ.status === 'pending') {
                    return <RowSkeleton key={blockId} />;
                }

                if (blocksQ.isFetching) {
                    return <RowSkeleton key={blockId} />;
                }

                return <div key={blockId} className='text-muted italic'>Task unavailable</div>;
            })}
        </div>
    );
};
