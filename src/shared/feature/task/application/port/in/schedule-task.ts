import { DayPlan } from '@/shared/feature/task/entity/day-plan';
import { AsyncResult } from '@/shared/feature/auth/entity/result';

export interface ScheduleTask {
    execute(localDate: string, taskId: string): AsyncResult<string, DayPlan>;
}
