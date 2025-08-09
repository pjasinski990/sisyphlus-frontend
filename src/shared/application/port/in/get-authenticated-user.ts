import { AsyncResult } from '@/shared/entity/result';
import { User } from '@/shared/entity/user';

export interface GetAuthenticatedUser {
    execute(): AsyncResult<Error, User | null>;
} 
