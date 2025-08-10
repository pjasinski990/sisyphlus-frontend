import { AsyncResult } from '@/shared/feature/auth/entity/result';
import { User } from '@/shared/feature/auth/entity/user';

export interface RegisterUser {
    execute(email: string, password: string): AsyncResult<Error, User>;
}
