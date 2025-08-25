import { useQuery, useQueryClient } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/query-core';
import { Block } from '@/feature/day-plan/entity/block';
import { timeblockController } from '@/feature/day-plan/interface/controller/timeblock-controller';
import { timeblockKey } from '@/feature/day-plan/interface/web/react/use-day-timeblocks-ids';

export const useBlocksByIdsKey = (ids: string[]) => {
    return ['blocks', 'byIds', ids] as const;
};

export function useBlocksByIdsQuery(ids: string[], opts?: { enabled?: boolean }) {
    const qc = useQueryClient();
    const norm = Array.from(new Set(ids)).sort();

    return useQuery({
        queryKey: useBlocksByIdsKey(norm),
        enabled: (opts?.enabled ?? true) && norm.length > 0,
        staleTime: 15_000,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const cached = new Map<string, Block>();
            const missing: string[] = [];

            for (const id of norm) {
                const hit = qc.getQueryData<Block>(timeblockKey(id));
                if (hit) cached.set(id, hit);
                else missing.push(id);
            }

            if (missing.length === 0) return cached;

            const res = await timeblockController.handleGetByIds(missing);
            if (!res.ok) throw new Error(res.error);
            const fetched = res.value as Block[];

            for (const b of fetched) qc.setQueryData(timeblockKey(b.id), b);

            for (const b of fetched) cached.set(b.id, b);
            return cached;
        },
    });
}
