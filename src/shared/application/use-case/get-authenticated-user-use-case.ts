import { User } from '@/shared/entity/user';
import { GetAuthenticatedUser } from '@/shared/application/port/in/get-authenticated-user';
import { AuthProvider } from '@/shared/application/port/out/auth-provider';
import { AsyncResult } from '@/shared/entity/result';

export class GetAuthenticatedUserUseCase implements GetAuthenticatedUser {
    constructor(private readonly authProvider: AuthProvider) {}

    execute(): AsyncResult<Error, User | null> {
        return this.authProvider.getAuthenticatedUser();
    }
} 
