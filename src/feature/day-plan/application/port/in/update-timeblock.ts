import { AsyncResult } from '@/shared/feature/auth/entity/result';
import { Block } from '@/feature/day-plan/entity/block';

export interface UpdateTimeblock {
    execute(patch: Partial<Block> & { id: string }): AsyncResult<string, Block>;
}
