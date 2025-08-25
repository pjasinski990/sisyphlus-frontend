import { UpdateTimeblock } from '@/feature/day-plan/application/port/in/update-timeblock';
import { Block } from '../../entity/block';
import { AsyncResult, nok, ok } from '@/shared/feature/auth/entity/result';
import { TimeblockApi } from '@/feature/day-plan/application/port/out/timeblock-api';

export class UpdateTimeblockUseCase implements UpdateTimeblock {
    constructor(
        private readonly api: TimeblockApi,
    ) { }

    async execute(patch: Partial<Block> & { id: string }): AsyncResult<string, Block> {
        try {
            const res = await this.api.update(patch);
            return ok(res);
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unexpected error updating timeblock';
            return nok(msg);
        }
    }
}
