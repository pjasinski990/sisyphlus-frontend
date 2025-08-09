import { AsyncResult } from '@/shared/entity/result';

export interface LogoutUser {
    execute(): AsyncResult<Error, null>;
} 
