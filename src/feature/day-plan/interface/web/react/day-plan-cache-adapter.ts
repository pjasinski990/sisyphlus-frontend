import type { QueryClient } from '@tanstack/react-query';
import { CacheAdapter } from '@/shared/feature/local-state/entity/cache-adapter';

type DayPlanEntry = { id: string; taskId: string; status: 'planned'|'completed'|'skipped'; order: number };
type DayPlan = { userId: string; localDate: string; entries: DayPlanEntry[] };

export const dayPlanKey = (date: string) => ['day-plan', date];

type PlanEntryAdded = { planDate: string; taskId: string; order: number };
type PlanEntryRemoved = { planDate: string; taskId: string };

export function createDayPlanCacheAdapter(): CacheAdapter {
    return {
        collections: ['dayPlan'],
        events: ['PlanEntryAdded', 'PlanEntryRemoved'],
        apply: (qc: QueryClient, item) => {
            if (item.kind === 'collection' && item.collection === 'dayPlan') {
                if (item.upsert) {
                    for (const raw of item.upsert) {
                        const p = raw as DayPlan;
                        qc.setQueryData(dayPlanKey(p.localDate), (prev: DayPlan | undefined) => {
                            return prev ? { ...prev, ...p } : p;
                        });
                    }
                }
                if (item.remove) {
                    for (const date of item.remove) {
                        qc.removeQueries({ queryKey: dayPlanKey(date) });
                    }
                }
                return;
            }

            if (item.kind === 'event') {
                if (item.type === 'PlanEntryAdded') {
                    const e = item.payload as PlanEntryAdded;
                    qc.setQueryData(dayPlanKey(e.planDate), (prev: DayPlan | undefined) => {
                        if (!prev) return prev;
                        if (prev.entries.some(x => x.taskId === e.taskId)) return prev;
                        return {
                            ...prev,
                            entries: [
                                ...prev.entries,
                                { id: crypto.randomUUID(), taskId: e.taskId, status: 'planned', order: e.order },
                            ],
                        };
                    });
                }
                if (item.type === 'PlanEntryRemoved') {
                    const e = item.payload as PlanEntryRemoved;
                    qc.setQueryData(dayPlanKey(e.planDate), (prev: DayPlan | undefined) => {
                        if (!prev) return prev;
                        return { ...prev, entries: prev.entries.filter(x => x.taskId !== e.taskId) };
                    });
                }
            }
        },
    };
}
