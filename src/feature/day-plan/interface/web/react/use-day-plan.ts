import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Task } from '@/shared/feature/task/entity/task';
import type { DayPlan } from '@/shared/feature/task/entity/day-plan';
import { dayPlanController } from '@/shared/feature/task/interface/controller/day-plan-controller';
import { keepPreviousData } from '@tanstack/query-core';
import { dayPlanKey } from '@/feature/day-plan/interface/web/react/day-plan-cache-adapter';
import { applyChangeset } from '@/shared/feature/local-state/entity/cache-adapter';
import { inboxKey } from '@/feature/inbox/interface/web/react/use-inbox-task-ids';
import { taskKey } from '@/shared/feature/task/interface/web/react/use-tasks';

export function useDayPlanQuery(localDate: string) {
    return useQuery({
        queryKey: dayPlanKey(localDate),
        queryFn: async () => {
            const res = await dayPlanController.handleGetPlan(localDate);
            if (!res.ok) throw new Error(res.error);
            return res.value as DayPlan;
        },
        placeholderData: keepPreviousData,
        staleTime: 15_000,
        refetchOnWindowFocus: false,
    });
}

export function useScheduleTaskFor(localDate: string) {
    const qc = useQueryClient();
    const planKey = dayPlanKey(localDate);

    return useMutation({
        mutationFn: async (input: Task | { taskId: string }) => {
            const taskId = 'id' in input ? input.id : input.taskId;
            return dayPlanController.handleScheduleTask(localDate, taskId);
        },

        onMutate: async (input) => {
            const taskId = 'id' in input ? input.id : input.taskId;

            await Promise.all([
                qc.cancelQueries({ queryKey: planKey }),
                qc.cancelQueries({ queryKey: inboxKey }),
                qc.cancelQueries({ queryKey: taskKey(taskId) }),
            ]);

            const prevPlan = qc.getQueryData<DayPlan>(planKey);
            const prevInboxIds = qc.getQueryData<string[]>(inboxKey) ?? [];
            const prevTask = qc.getQueryData<Task>(taskKey(taskId));

            const nextInboxIds = prevInboxIds.filter(id => id !== taskId);
            qc.setQueryData<string[]>(inboxKey, nextInboxIds);

            const nextOrder = ((prevPlan?.entries?.[prevPlan.entries.length - 1]?.order) ?? 0) + 10;
            applyChangeset(qc, [
                { kind: 'event', type: 'PlanEntryAdded', payload: { planDate: localDate, taskId, order: nextOrder } },
            ]);

            if (prevTask) {
                qc.setQueryData<Task>(taskKey(taskId), { ...prevTask });
            }

            return { prevPlan, prevInboxIds, prevTask, taskId };
        },

        onError: (_err, _input, ctx) => {
            if (!ctx) return;
            if (ctx.prevPlan) qc.setQueryData<DayPlan>(planKey, ctx.prevPlan);
            qc.setQueryData<string[]>(inboxKey, ctx.prevInboxIds);
            if (ctx.prevTask) qc.setQueryData<Task>(taskKey(ctx.taskId), ctx.prevTask);
        },

        onSuccess: (changeset, _input, ctx) => {
            if (!changeset?.ok) throw new Error('Unexpected error in day-plan changeset');
            applyChangeset(qc, changeset.value);

            if (ctx) {
                void qc.invalidateQueries({ queryKey: taskKey(ctx.taskId) });
            }
        },

        onSettled: () => {
            void qc.invalidateQueries({ queryKey: planKey });
            void qc.invalidateQueries({ queryKey: inboxKey });
        },
    });
}
