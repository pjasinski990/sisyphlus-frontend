import { AsyncResult } from '@/shared/feature/auth/entity/result';

export interface LogoutUser {
    execute(): AsyncResult<Error, null>;
} 
