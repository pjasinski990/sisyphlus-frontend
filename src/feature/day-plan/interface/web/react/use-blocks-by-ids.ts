import { useQuery, useQueryClient } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/query-core';
import { Block } from '@/feature/day-plan/entity/block';
import { timeblockController } from '@/feature/day-plan/interface/controller/timeblock-controller';
import { timeblockKey } from '@/feature/day-plan/interface/web/react/use-day-timeblocks-ids';

export function useBlocksByIdsQuery(ids: string[], opts?: { enabled?: boolean }) {
    const qc = useQueryClient();
    const norm = Array.from(new Set(ids)).sort();

    return useQuery({
        queryKey: ['blocks', 'byIds', norm],
        enabled: (opts?.enabled ?? true) && norm.length > 0,
        placeholderData: keepPreviousData,
        staleTime: 15_000,
        refetchOnWindowFocus: false,
        queryFn: async () => {
            const res = await timeblockController.handleGetByIds(norm);
            if (!res.ok) throw new Error(res.error);
            const list = res.value as Block[];

            for (const t of list) {
                qc.setQueryData(timeblockKey(t.id), t);
            }

            return new Map(list.map(t => [t.id, t] as const));
        },
    });
}
