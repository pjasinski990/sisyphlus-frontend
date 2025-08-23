import { GetDayTimeblocks } from '@/feature/day-plan/application/port/in/get-day-timeblocks';
import { AsyncResult, nok, ok } from '@/shared/feature/auth/entity/result';
import { TimeblockApi } from '../port/out/timeblock-api';
import { Block } from '@/feature/day-plan/entity/block';

export class GetDayTimeblocksUseCase implements GetDayTimeblocks {
    constructor(
        private readonly timeblockApi: TimeblockApi,
    ) { }

    async execute(localDate: string): AsyncResult<string, Block[]> {
        try {
            const res = await this.timeblockApi.getByLocalDate(localDate);
            return ok(res);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : `Unknown error retrieving day timeblocks: ${error}`;
            return nok(msg);
        }
    }
}
