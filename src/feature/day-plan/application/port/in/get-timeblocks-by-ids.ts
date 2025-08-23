import { Block } from '@/feature/day-plan/entity/block';
import { AsyncResult } from '@/shared/feature/auth/entity/result';

export interface GetTimeblocksByIds {
    execute(ids: string[]): AsyncResult<string, Block[]>;
}
