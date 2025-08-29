import React from 'react';
import { useDayBlockIdsQuery } from '@/feature/day-plan/interface/web/react/use-day-timeblocks-ids';
import { todayLocalDate } from '@/shared/util/local-date-helper';
import { useBlocksByIdsQuery } from '@/feature/day-plan/interface/web/react/use-blocks-by-ids';
import { RowSkeleton } from '@/shared/util/react/components/RowSkeleton';
import { BlockCard } from '@/feature/day-plan/interface/web/react/timeline/BlockCard';
import { timelineConfig } from '@/feature/day-plan/entity/timeline-config';
import { AnimatePresence, LayoutGroup } from 'framer-motion';

export const BlockLayer = () => {
    const blockIdsQ = useDayBlockIdsQuery(todayLocalDate());

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

    const entries = blocksQ.data ? Array.from(blocksQ.data) : [];

    return (
        <div className='inset-x-10 h-full pointer-events-none relative'>
            <LayoutGroup id='timeline'>
                <AnimatePresence initial={false} mode='popLayout'>
                    {entries.map(([blockId, block]) => {
                        if (block) {
                            return (
                                <BlockCard key={blockId} cfg={timelineConfig} block={block} />
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
                </AnimatePresence>
            </LayoutGroup>
        </div>
    );
};
