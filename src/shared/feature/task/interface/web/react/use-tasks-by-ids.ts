import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { Task } from '@/shared/feature/task/entity/task';
import { taskController } from '@/shared/feature/task/interface/controller/inbox-controller';

export function useTasksByIdsQuery(ids: string[], opts?: { enabled?: boolean }) {
    const norm = Array.from(new Set(ids)).sort();
    return useQuery({
        queryKey: ['tasks', 'byIds', norm],
        enabled: !!opts?.enabled && norm.length > 0,
        queryFn: async () => {
            const res = await taskController.handleGetByIds(norm);
            if (!res.ok) throw new Error(res.error);
            const list = res.value as Task[];
            return new Map(list.map(t => [t.id, t]));
        },
        placeholderData: keepPreviousData,
        staleTime: 15_000,
        refetchOnWindowFocus: false,
    });
}
