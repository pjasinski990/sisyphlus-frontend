import { GetDayPlan } from '../port/in/get-day-plan';
import { AsyncResult, nok, ok } from '@/shared/feature/auth/entity/result';
import { DayPlan } from '@/feature/day-plan/entity/day-plan';
import { DayPlanApi } from '@/feature/day-plan/application/port/out/day-plan-api';

export class GetDayPlanUseCase implements GetDayPlan {
    constructor(
        private readonly api: DayPlanApi
    ) { }

    async execute(localDate: string): AsyncResult<string, DayPlan> {
        try {
            const res = await this.api.getPlan(localDate);
            return ok(res);
        } catch (error: unknown) {
            return nok(error instanceof Error ? error.message : 'Unknown error retrieving day plan.');
        }
    }
}
