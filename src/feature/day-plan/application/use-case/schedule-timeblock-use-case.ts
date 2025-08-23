import { AsyncResult, nok, ok } from '@/shared/feature/auth/entity/result';
import { ScheduleTimeblock } from '../port/in/schedule-timeblock';
import { Block } from '@/feature/day-plan/entity/block';
import { TimeblockApi } from '@/feature/day-plan/application/port/out/timeblock-api';
import { ScheduleBlockDesc } from '@/feature/day-plan/entity/schedule-block-description';

export class ScheduleTimeblockUseCase implements ScheduleTimeblock {
    constructor(
        private readonly api: TimeblockApi,
    ) { }

    async execute(desc: ScheduleBlockDesc): AsyncResult<string, Block> {
        try {
            const res = await this.api.create(desc);
            return ok(res);
        } catch (error: unknown) {
            const msg: string = error instanceof Error ? error.message : 'Unknown error adding timeblock';
            return nok(msg);
        }
    }
}
