import { RegisterUser } from '@/shared/application/port/in/register-user';
import { AuthProvider } from '@/shared/application/port/out/auth-provider';
import { AsyncResult } from '@/shared/entity/result';
import { User } from '@/shared/entity/user';

export class RegisterUserUseCase implements RegisterUser {
    constructor(private readonly authProvider: AuthProvider) {}

    execute(email: string, password: string): AsyncResult<Error, User> {
        return this.authProvider.register(email, password);
    }
} 
