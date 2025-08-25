import { useQuery, useQueryClient } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/query-core';
import { timeblockController } from '@/feature/day-plan/interface/controller/timeblock-controller';
import { Block } from '@/feature/day-plan/entity/block';

export const timeblockDayKey = (localDate: string) => ['blocks', localDate] as const;
export const timeblockKey = (id: string) => ['block', id] as const;

export function useDayTimeblockIdsQuery(localDate: string) {
    const qc = useQueryClient();

    return useQuery({
        queryKey: timeblockDayKey(localDate),
        placeholderData: keepPreviousData,
        staleTime: 15_000,
        refetchOnWindowFocus: false,
        queryFn: async () => {
            const res = await timeblockController.handleGetDayTimeblocks(localDate);

            if (!res.ok) throw new Error(res.error);

            const blocks = res.value as Block[];
            for (const t of blocks) {
                qc.setQueryData(timeblockKey(t.id), t);
            }

            return blocks.map(t => t.id);
        },
    });
}
