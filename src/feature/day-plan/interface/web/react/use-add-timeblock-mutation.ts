import { useMutation, useQueryClient } from '@tanstack/react-query';
import { timeblockController } from '@/feature/day-plan/interface/controller/timeblock-controller';
import { Block, TagBlock, TaskBlock } from '@/feature/day-plan/entity/block';
import {
    timeblockDayKey,
    timeblockKey,
} from '@/feature/day-plan/interface/web/react/use-day-timeblocks-ids';
import {
    ScheduleBlockDesc,
    ScheduleTagBlockDesc,
    ScheduleTaskBlockDesc
} from '@/feature/day-plan/entity/schedule-block-description';
import { v4 as uuid } from 'uuid';

export function useAddBlockToDayPlanMutation(localDate: string) {
    const qc = useQueryClient();
    const dayTimeblocks = timeblockDayKey(localDate);

    return useMutation({
        mutationFn: async (desc: ScheduleBlockDesc) => {
            const res = await timeblockController.handleSchedule(desc);
            if (!res.ok) throw new Error(res.error);
            return res.value;
        },

        onMutate: async (desc) => {
            await qc.cancelQueries({ queryKey: dayTimeblocks });

            const prevIds = qc.getQueryData<string[]>(dayTimeblocks) ?? [];

            const tempId = `temp-${uuid()}`;
            const temp = tempBlock({ ...desc, id: tempId });

            qc.setQueryData(timeblockKey(tempId), temp);

            const nextIds = [...prevIds, tempId];
            qc.setQueryData(dayTimeblocks, nextIds);

            const nextNorm = Array.from(new Set(nextIds)).sort();
            qc.setQueryData(['blocks','byIds', nextNorm], (old?: Map<string, Block>) => {
                const m = new Map(old ?? []);
                m.set(tempId, temp);
                return m;
            });

            return { prevIds, tempId, nextNorm };
        },

        onError: (_err, _vars, ctx) => {
            if (!ctx) return;
            qc.setQueryData(timeblockDayKey(localDate), ctx.prevIds);
            qc.removeQueries({ queryKey: timeblockKey(ctx.tempId) });
            qc.setQueryData(['blocks','byIds', ctx.nextNorm], (old?: Map<string, Block>) => {
                if (!old) return old;
                const m = new Map(old);
                m.delete(ctx.tempId);
                return m;
            });
        },

        onSuccess: (serverBlock, _vars, ctx) => {
            if (!ctx) return;

            qc.setQueryData<string[]>(timeblockDayKey(localDate), (old = []) => {
                const withoutTemp = old.filter(id => id !== ctx.tempId);
                return withoutTemp.includes(serverBlock.id) ? withoutTemp : [...withoutTemp, serverBlock.id];
            });

            qc.setQueryData(timeblockKey(serverBlock.id), serverBlock);
            qc.removeQueries({ queryKey: timeblockKey(ctx.tempId) });
            qc.invalidateQueries({ queryKey: ['blocks','byIds'] });
        },

        onSettled: () => {
            qc.invalidateQueries({ queryKey: timeblockDayKey(localDate) });
        }
    });
}

function tempBlock(desc: ScheduleBlockDesc & { id: string }): Block {
    if (desc.taskId) {
        return tempTaskBlock(desc);
    } else if (desc.tag) {
        return tempTagBlock(desc);
    }
    else throw new Error('Expected taskId or tag to be set');
}

function tempTaskBlock(desc: ScheduleTaskBlockDesc): TaskBlock {
    const { startUtc, endUtc } = buildOptimisticUtcInstants(desc);
    return {
        id: 'temp-block',
        taskId: desc.taskId,
        userId: 'temp-user',
        category: 'task-block',
        duration: desc.duration,
        localDate: desc.startLocalDate,
        localTime: desc.startLocalTime,
        timezone: desc.timezone,
        startUtc,
        endUtc,
    };
}

function tempTagBlock(desc: ScheduleTagBlockDesc): TagBlock {
    const { startUtc, endUtc } = buildOptimisticUtcInstants(desc);
    return {
        id: 'temp-block',
        tag: desc.tag,
        userId: 'temp-user',
        category: 'tag-block',
        duration: desc.duration,
        localDate: desc.startLocalDate,
        localTime: desc.startLocalTime,
        timezone: desc.timezone,
        startUtc,
        endUtc,
    };
}

function buildOptimisticUtcInstants(desc: {
    startLocalDate: string;
    startLocalTime: string;
    duration: string;
}) {
    const hhmm = normalizeHHmm(desc.startLocalTime);
    const startLocal = new Date(`${desc.startLocalDate}T${hhmm}:00`);
    const ms = parseIsoDurationMs(desc.duration);
    const endLocal = new Date(startLocal.getTime() + ms);

    return {
        startUtc: startLocal.toISOString(),
        endUtc: endLocal.toISOString(),
    };
}

function normalizeHHmm(s: string): string {
    if (s.includes(':')) return s;
    if (s.length === 4) return `${s.slice(0, 2)}:${s.slice(2)}`;
    throw new Error('Bad time format');
}

function parseIsoDurationMs(p: string): number {
    const m = /^P(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)$/.exec(p);
    if (!m) throw new Error('Bad ISO duration');
    const h = Number(m[1] ?? 0), min = Number(m[2] ?? 0), s = Number(m[3] ?? 0);
    return ((h * 60 + min) * 60 + s) * 1000;
}

