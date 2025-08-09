import { AsyncResult } from '@/shared/entity/result';
import { LogoutUser } from '@/shared/application/port/in/logout-user';
import { AuthProvider } from '@/shared/application/port/out/auth-provider';

export class LogoutUserUseCase implements LogoutUser {
    constructor(private readonly authProvider: AuthProvider) {}

    execute(): AsyncResult<Error, null> {
        return this.authProvider.logout();
    }
} 
