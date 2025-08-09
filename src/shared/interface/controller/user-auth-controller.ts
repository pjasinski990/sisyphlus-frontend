import { User } from '@/shared/entity/user';
import { LoginUser } from '@/shared/application/port/in/login-user';
import { LogoutUser } from '@/shared/application/port/in/logout-user';
import { RegisterUser } from '@/shared/application/port/in/register-user';
import { GetAuthenticatedUser } from '@/shared/application/port/in/get-authenticated-user';
import { AsyncResult } from '@/shared/entity/result';
import { HttpCookieAuthProvider } from '@/shared/infra/auth/http-cookie-auth-provider';
import { httpClient } from '@/shared/infra/http/fetch-http-client';
import { LoginUserUseCase } from '@/shared/application/use-case/login-user-use-case';
import { LogoutUserUseCase } from '@/shared/application/use-case/logout-user-use-case';
import { RegisterUserUseCase } from '@/shared/application/use-case/register-user-use-case';
import { GetAuthenticatedUserUseCase } from '@/shared/application/use-case/get-authenticated-user-use-case';

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
