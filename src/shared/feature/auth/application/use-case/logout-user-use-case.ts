import { AsyncResult } from '@/shared/feature/auth/entity/result';
import { LogoutUser } from '@/shared/feature/auth/application/port/in/logout-user';
import { AuthProvider } from '@/shared/feature/auth/application/port/out/auth-provider';

export class LogoutUserUseCase implements LogoutUser {
    constructor(private readonly authProvider: AuthProvider) {}

    execute(): AsyncResult<Error, null> {
        return this.authProvider.logout();
    }
} 
