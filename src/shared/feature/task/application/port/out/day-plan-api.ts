import { DayPlan } from '@/shared/feature/task/entity/day-plan';

export interface DayPlanApi {
    getPlan(localDate: string): Promise<DayPlan>;
    scheduleTask(localDate: string, taskId: string): Promise<DayPlan>;
}
