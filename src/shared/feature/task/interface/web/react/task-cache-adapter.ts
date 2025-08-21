import { CacheAdapter } from '@/shared/feature/local-state/entity/cache-adapter';
import type { QueryClient } from '@tanstack/react-query';
import { Task } from '@/shared/feature/task/entity/task';

const qk = {
    task: (id: string) => ['task', id] as const,
};

export function createTaskCacheAdapter(): CacheAdapter {
    return {
        collections: ['task'],
        apply: (qc: QueryClient, item) => {
            if (item.kind !== 'collection' || item.collection !== 'task') return;

            if (item.upsert) {
                for (const raw of item.upsert) {
                    const t = raw as Task;
                    qc.setQueryData(qk.task(t.id), (prev: Task | undefined) => ({ ...(prev ?? {}), ...t }));
                }
            }
            if (item.remove) {
                for (const id of item.remove) {
                    qc.removeQueries({ queryKey: qk.task(id) });
                }
            }
        },
    };
}
