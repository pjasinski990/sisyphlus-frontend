import { AsyncResult } from '@/shared/feature/auth/entity/result';

export interface ExecuteLine {
    execute(rawLine: string): AsyncResult<string, null>;
}
