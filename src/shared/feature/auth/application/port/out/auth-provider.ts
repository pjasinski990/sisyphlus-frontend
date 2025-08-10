import { AsyncResult } from '@/shared/feature/auth/entity/result';
import { User } from '@/shared/feature/auth/entity/user';

export interface AuthProvider {
    getAuthenticatedUser(): AsyncResult<Error, User | null>;
    login(email: string, password: string): AsyncResult<Error, User>;
    register(email: string, password: string): AsyncResult<Error, User>;
    logout(): AsyncResult<Error, null>;
}
