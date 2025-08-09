import { AsyncResult } from '@/shared/entities/result';
import { User } from '@/shared/entities/user';

export interface GetAuthenticatedUser {
    execute(): AsyncResult<Error, User | null>;
} 
