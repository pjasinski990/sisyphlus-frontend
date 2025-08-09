import { AsyncResult } from '@/shared/entity/result';
import { User } from '@/shared/entity/user';

export interface RegisterUser {
    execute(email: string, password: string): AsyncResult<Error, User>;
}
