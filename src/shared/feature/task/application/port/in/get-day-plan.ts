import { DayPlan } from '@/feature/day-plan/entity/day-plan';
import { AsyncResult } from '@/shared/feature/auth/entity/result';

export interface GetDayPlan {
    execute(localDate: string): AsyncResult<string, DayPlan>;
}
