import { GetTimeblocksByIds } from '@/feature/day-plan/application/port/in/get-timeblocks-by-ids';
import { AsyncResult, nok, ok } from '@/shared/feature/auth/entity/result';
import { TimeblockApi } from '@/feature/day-plan/application/port/out/timeblock-api';
import { Block } from '@/feature/day-plan/entity/block';

export class GetTimeblocksByIdsUseCase implements GetTimeblocksByIds {
    constructor(
        private readonly timeblockApi: TimeblockApi,
    ) {
    }

    async execute(ids: string[]): AsyncResult<string, Block[]> {
        try {
            const res = await this.timeblockApi.getByIds(ids);
            return ok(res);
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unexpected error retrieving blocks by ids.';
            return nok(msg);
        }
    }
}
