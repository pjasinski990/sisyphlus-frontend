import { DayPlan } from '@/feature/day-plan/entity/day-plan';
import { Changeset } from '@/shared/feature/local-state/entity/changeset';

export interface DayPlanApi {
    getPlan(localDate: string): Promise<DayPlan>;
    scheduleTask(localDate: string, taskId: string): Promise<Changeset>;
}
