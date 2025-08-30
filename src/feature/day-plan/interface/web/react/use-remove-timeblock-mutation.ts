import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { timeblockController } from '@/feature/day-plan/interface/controller/timeblock-controller';
import { Block } from '@/feature/day-plan/entity/block';
import { timeblockDayKey, timeblockKey } from '@/feature/day-plan/interface/web/react/use-day-timeblocks-ids';

type Ctx = {
    id: string;
    prevBlock?: Block;
    touchedByIds: Array<{ qKey: QueryKey; data: Map<string, Block> }>;
};

export function useRemoveTimeblockMutation(localDate: string) {
    const qc = useQueryClient();
    const dayKey = timeblockDayKey(localDate);

    return useMutation<string, Error, string, Ctx>({
        mutationFn: async (id: string) => {
            const res = await timeblockController.handleRemove(id);
            if (!res.ok) throw new Error(res.error);
            return id;
        },

        onMutate: async (id) => {
            await Promise.all([
                qc.cancelQueries({ queryKey: timeblockKey(id) }),
                qc.cancelQueries({ queryKey: dayKey }),
            ]);

            const prevBlock = qc.getQueryData<Block>(timeblockKey(id));

            const touchedByIds: Array<{ qKey: QueryKey; data: Map<string, Block> }> = [];
            for (const [qKey, data] of qc.getQueriesData<Map<string, Block>>({
                queryKey: ['blocks', 'byIds'],
            })) {
                if (!(data instanceof Map) || !data.has(id)) continue;
                touchedByIds.push({ qKey: qKey as QueryKey, data });
                const next = new Map(data);
                next.delete(id);
                qc.setQueryData(qKey as QueryKey, next);
            }

            qc.removeQueries({ queryKey: timeblockKey(id) });

            return { id, prevBlock, touchedByIds };
        },

        onError: (_err, _id, ctx) => {
            if (!ctx) return;
            if (ctx.prevBlock) qc.setQueryData(timeblockKey(ctx.id), ctx.prevBlock);
            for (const { qKey, data } of ctx.touchedByIds) {
                qc.setQueryData(qKey, data);
            }
        },

        onSuccess: (id) => {
            qc.removeQueries({ queryKey: timeblockKey(id) });

            for (const [qKey, data] of qc.getQueriesData<Map<string, Block>>({
                queryKey: ['blocks', 'byIds'],
            })) {
                if (!(data instanceof Map) || !data.has(id)) continue;
                const next = new Map(data);
                next.delete(id);
                qc.setQueryData(qKey as QueryKey, next);
            }

            qc.invalidateQueries({ queryKey: dayKey });
        },

        onSettled: () => {},
    });
}
