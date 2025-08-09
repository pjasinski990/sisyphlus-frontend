import { RegisterUser } from '../ports/in/register-user';
import { AuthProvider } from '../ports/out/auth-provider';
import { AsyncResult } from '@/shared/entities/result';
import { User } from '@/shared/entities/user';

export class RegisterUserUseCase implements RegisterUser {
    constructor(private readonly authProvider: AuthProvider) {}

    execute(email: string, password: string): AsyncResult<Error, User> {
        return this.authProvider.register(email, password);
    }
} 
