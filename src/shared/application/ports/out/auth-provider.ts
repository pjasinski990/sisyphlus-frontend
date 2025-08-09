import { AsyncResult } from '@/shared/entities/result';
import { User } from '@/shared/entities/user';

export interface AuthProvider {
    getAuthenticatedUser(): AsyncResult<Error, User | null>;
    login(email: string, password: string): AsyncResult<Error, User>;
    register(email: string, password: string): AsyncResult<Error, User>;
    logout(): AsyncResult<Error, null>;
}
