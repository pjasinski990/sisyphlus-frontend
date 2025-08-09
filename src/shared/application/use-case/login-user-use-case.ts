import { User } from '@/shared/entity/user';
import { LoginUser } from '@/shared/application/port/in/login-user';
import { AuthProvider } from '@/shared/application/port/out/auth-provider';
import { AsyncResult } from '@/shared/entity/result';

export class LoginUserUseCase implements LoginUser {
    constructor(private readonly authProvider: AuthProvider) {}

    execute(email: string, password: string): AsyncResult<Error, User> {
        return this.authProvider.login(email, password);
    }
} 
