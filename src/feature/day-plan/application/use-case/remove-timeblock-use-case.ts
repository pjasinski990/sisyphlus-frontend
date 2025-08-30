import { RemoveTimeblock } from '@/feature/day-plan/application/port/in/remove-timeblock';
import { AsyncResult, nok, ok } from '@/shared/feature/auth/entity/result';
import { Block } from '@/feature/day-plan/entity/block';
import { TimeblockApi } from '@/feature/day-plan/application/port/out/timeblock-api';

export class RemoveTimeblockUseCase implements RemoveTimeblock {
    constructor(
        private readonly api: TimeblockApi,
    ) { }

    async execute(blockId: string): AsyncResult<string, Block> {
        try {
            const res = await this.api.remove(blockId);
            return ok(res);
        } catch (error: unknown) {
            const msg: string = error instanceof Error ? error.message : 'Unknown error adding timeblock';
            return nok(msg);
        }
    }
}
