import { User } from '@/shared/feature/auth/entity/user';
import { GetAuthenticatedUser } from '@/shared/feature/auth/application/port/in/get-authenticated-user';
import { AuthProvider } from '@/shared/feature/auth/application/port/out/auth-provider';
import { AsyncResult } from '@/shared/feature/auth/entity/result';

export class GetAuthenticatedUserUseCase implements GetAuthenticatedUser {
    constructor(private readonly authProvider: AuthProvider) {}

    execute(): AsyncResult<Error, User | null> {
        return this.authProvider.getAuthenticatedUser();
    }
} 
