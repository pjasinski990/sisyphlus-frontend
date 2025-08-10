import { AsyncResult } from '@/shared/feature/auth/entity/result';
import { User } from '@/shared/feature/auth/entity/user';

export interface GetAuthenticatedUser {
    execute(): AsyncResult<Error, User | null>;
} 
