import { useMutation, useQueryClient } from '@tanstack/react-query';
import { timeblockController } from '@/feature/day-plan/interface/controller/timeblock-controller';
import { Block } from '@/feature/day-plan/entity/block';
import { timeblockDayKey, timeblockKey } from '@/feature/day-plan/interface/web/react/use-day-timeblocks-ids';
import { normalizeHHmm, parseIsoDurationMs } from '@/shared/util/time-utils';

type BlockPatch = Partial<Block> & { id: string };

export function useUpdateBlockInDayPlanMutation(localDate: string) {
    const qc = useQueryClient();
    const dayKey = timeblockDayKey(localDate);

    return useMutation({
        mutationFn: async (patch: BlockPatch) => {
            const res = await timeblockController.handleUpdate(patch);
            if (!res.ok) throw new Error(res.error);
            return res.value as Block;
        },

        onMutate: async (patch) => {
            const id = patch.id;

            await Promise.all([
                qc.cancelQueries({ queryKey: timeblockKey(id) }),
                qc.cancelQueries({ queryKey: dayKey }),
            ]);

            const prev = qc.getQueryData<Block>(timeblockKey(id));
            const optimistic = prev ? applyPatchAndRecalc(prev, patch) : undefined;

            if (optimistic) {
                qc.setQueryData(timeblockKey(id), optimistic);

                for (const [qKey, data] of qc.getQueriesData<Map<string, Block>>({
                    queryKey: ['blocks', 'byIds'],
                })) {
                    if (!(data instanceof Map) || !data.has(id)) continue;

                    const next = new Map(data);
                    next.set(id, optimistic);
                    qc.setQueryData(qKey, next);
                }
            }
            return { id, prev };
        },

        onError: (_err, _vars, ctx) => {
            if (!ctx) return;
            if (ctx.prev) qc.setQueryData(timeblockKey(ctx.id), ctx.prev);
        },

        onSuccess: (serverBlock, _vars, ctx) => {
            if (!ctx) return;
            qc.setQueryData(timeblockKey(ctx.id), serverBlock);

            for (const [qKey, data] of qc.getQueriesData<Map<string, Block>>({
                queryKey: ['blocks', 'byIds'],
            })) {
                if (!(data instanceof Map) || !data.has(ctx.id)) continue;
                const next = new Map(data);
                next.set(ctx.id, serverBlock);
                qc.setQueryData(qKey, next);
            }
            qc.invalidateQueries({ queryKey: dayKey });
        },

        onSettled: () => {},
    });
}

function applyPatchAndRecalc(prev: Block, patch: BlockPatch): Block {
    const merged = { ...prev, ...patch } as Block;
    const needsRecalc = has<Block>(patch, 'localDate')
        || has<Block>(patch, 'localTime')
        || has<Block>(patch, 'duration')
        || has<Block>(patch, 'timezone');

    if (!needsRecalc) return { ...merged, updatedAt: new Date().toISOString() };

    const hhmm = normalizeHHmm(merged.localTime);
    const startLocal = new Date(`${merged.localDate}T${hhmm}:00`);
    const durMs = parseIsoDurationMs(merged.duration);
    const endLocal = new Date(startLocal.getTime() + durMs);

    return {
        ...merged,
        startUtc: startLocal.toISOString(),
        endUtc: endLocal.toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

function has<T extends object>(obj: Partial<T>, key: keyof T): boolean {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
