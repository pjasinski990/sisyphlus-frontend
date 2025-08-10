import { RegisterUser } from '@/shared/feature/auth/application/port/in/register-user';
import { AuthProvider } from '@/shared/feature/auth/application/port/out/auth-provider';
import { AsyncResult } from '@/shared/feature/auth/entity/result';
import { User } from '@/shared/feature/auth/entity/user';

export class RegisterUserUseCase implements RegisterUser {
    constructor(private readonly authProvider: AuthProvider) {}

    execute(email: string, password: string): AsyncResult<Error, User> {
        return this.authProvider.register(email, password);
    }
} 
