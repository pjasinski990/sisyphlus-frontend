import { User } from '@/shared/entity/user';
import { AuthProvider } from '@/shared/application/port/out/auth-provider';
import { HttpClient, HttpError } from '@/shared/application/port/out/http-client';
import { AsyncResult, nok, ok } from '@/shared/entity/result';
import { GenericResponse } from '@/shared/entity/generic-repsonse';

export class HttpCookieAuthProvider implements AuthProvider {
    constructor(private readonly httpClient: HttpClient) {}

    async getAuthenticatedUser(): AsyncResult<Error, User | null> {
        try {
            const response = await this.httpClient.get<{ user: User }>('/auth/me');
            return ok(response.data.user);
        } catch (err: unknown) {
            if (isUnauthorizedError(err)) {
                return ok(null);
            } else if (err instanceof HttpError) {
                return nok(getErrorWithHttpCause(err));
            } else if (err instanceof Error) {
                return nok(err);
            } else {
                return nok(new Error('Unknown error during authentication'));
            }
        }
    }

    async login(email: string, password: string): AsyncResult<Error, User> {
        try {
            const body = { email, password };
            await this.httpClient.post<GenericResponse>('/auth/login', body);
            const userResponse = await this.httpClient.get<{ user: User }>('/auth/me');
            return ok(userResponse.data.user);
        } catch (err: unknown) {
            if (err instanceof HttpError) {
                return nok(getErrorWithHttpCause(err));
            } else if (err instanceof Error) {
                return nok(err);
            } else {
                return nok(new Error('Unknown error during authentication'));
            }
        }
    }

    async register(email: string, password: string): AsyncResult<Error, User> {
        try {
            await this.httpClient.post<GenericResponse>('/auth/register', { email, password });
            const userResponse = await this.httpClient.get<{ user: User }>('/auth/me');
            return ok(userResponse.data.user);
        } catch (err: unknown) {
            if (err instanceof HttpError) {
                return nok(getErrorWithHttpCause(err));
            } else if (err instanceof Error) {
                return nok(err);
            } else {
                return nok(new Error('Unknown error during authentication'));
            }
        }
    }

    async logout(): AsyncResult<Error, null> {
        try {
            await this.httpClient.post('/auth/logout');
            return ok(null);
        } catch (err: unknown) {
            if (err instanceof Error) {
                return nok(err);
            } else {
                return nok(new Error('Unknown error during logout'));
            }
        }
    }
}

function isUnauthorizedError(error: unknown): error is HttpError {
    return error instanceof HttpError && error.status === 401;
}

function getErrorWithHttpCause(error: HttpError): Error {
    return new Error(
        error.response.error
    );
}
