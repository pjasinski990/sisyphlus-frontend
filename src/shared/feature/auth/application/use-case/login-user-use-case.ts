import { User } from '@/shared/feature/auth/entity/user';
import { LoginUser } from '@/shared/feature/auth/application/port/in/login-user';
import { AuthProvider } from '@/shared/feature/auth/application/port/out/auth-provider';
import { AsyncResult } from '@/shared/feature/auth/entity/result';

export class LoginUserUseCase implements LoginUser {
    constructor(private readonly authProvider: AuthProvider) {}

    execute(email: string, password: string): AsyncResult<Error, User> {
        return this.authProvider.login(email, password);
    }
} 
