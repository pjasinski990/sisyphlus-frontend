import { AsyncResult } from '@/shared/entities/result';
import { User } from '@/shared/entities/user';

export interface RegisterUser {
    execute(email: string, password: string): AsyncResult<Error, User>;
}
