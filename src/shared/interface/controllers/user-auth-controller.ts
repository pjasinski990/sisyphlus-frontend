import { User } from '@/shared/entities/user';
import { LoginUser } from '@/shared/application/ports/in/login-user';
import { LogoutUser } from '@/shared/application/ports/in/logout-user';
import { RegisterUser } from '@/shared/application/ports/in/register-user';
import { GetAuthenticatedUser } from '@/shared/application/ports/in/get-authenticated-user';
import { AsyncResult } from '@/shared/entities/result';
import { HttpCookieAuthProvider } from '@/shared/infra/auth/http-cookie-auth-provider';
import { httpClient } from '@/shared/infra/http/fetch-http-client';
import { LoginUserUseCase } from '@/shared/application/use-cases/login-user';
import { LogoutUserUseCase } from '@/shared/application/use-cases/logout-user';
import { RegisterUserUseCase } from '@/shared/application/use-cases/register-user';
import { GetAuthenticatedUserUseCase } from '@/shared/application/use-cases/get-authenticated-user';

export class UserAuthController {
    constructor(
        private readonly loginUser: LoginUser,
        private readonly logoutUser: LogoutUser,
        private readonly registerUser: RegisterUser,
        private readonly getAuthenticatedUser: GetAuthenticatedUser
    ) {}

    async login(email: string, password: string): AsyncResult<Error, User> {
        return this.loginUser.execute(email, password);
    }

    async logout(): AsyncResult<Error, null> {
        return this.logoutUser.execute();
    }

    async register(email: string, password: string): AsyncResult<Error, User> {
        return this.registerUser.execute(email, password);
    }

    async getCurrentUser(): AsyncResult<Error, User | null> {
        return this.getAuthenticatedUser.execute();
    }
}

const authProvider = new HttpCookieAuthProvider(httpClient);
const loginUserUseCase = new LoginUserUseCase(authProvider);
const logoutUserUseCase = new LogoutUserUseCase(authProvider);
const registerUserUseCase = new RegisterUserUseCase(authProvider);
const getAuthenticatedUserUseCase = new GetAuthenticatedUserUseCase(authProvider);

export const authController = new UserAuthController(
    loginUserUseCase,
    logoutUserUseCase,
    registerUserUseCase,
    getAuthenticatedUserUseCase
);
