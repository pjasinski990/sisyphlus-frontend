import { AsyncResult } from '@/shared/feature/auth/entity/result';
import { Block } from '@/feature/day-plan/entity/block';

export interface RemoveTimeblock {
    execute(blockId: string): AsyncResult<string, Block>;
}
