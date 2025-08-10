import { GenericResponse } from '@/shared/feature/http/entity/generic-repsonse';
import { HttpClient, HttpError, HttpResponse, RequestConfig } from '@/shared/feature/http/application/port/out/http-client';
import { AsyncResult } from '@/shared/feature/auth/entity/result';

export class AutoRefreshDecorator implements HttpClient {
    private static inFlightRefresh: Promise<void> | null = null;

    constructor(
        private readonly httpClient: HttpClient,
        private readonly refresh: (client: HttpClient) => AsyncResult<HttpError, GenericResponse>
    ) {}

    async get<T = unknown>(url: string, config?: RequestConfig): Promise<HttpResponse<T>> {
        return this.tryRequest(() => this.httpClient.get<T>(url, config));
    }

    async post<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<HttpResponse<T>> {
        return this.tryRequest(() => this.httpClient.post<T>(url, data, config));
    }

    async put<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<HttpResponse<T>> {
        return this.tryRequest(() => this.httpClient.put<T>(url, data, config));
    }

    async delete<T = unknown>(url: string, config?: RequestConfig): Promise<HttpResponse<T>> {
        return this.tryRequest(() => this.httpClient.delete<T>(url, config));
    }

    private async tryRequest<T>(
        fn: () => Promise<HttpResponse<T>>
    ): Promise<HttpResponse<T>> {
        try {
            return await fn();
        } catch (e: unknown) {
            if (e instanceof HttpError && this.needsRefresh(e.status)) {
                await this.performRefresh();
                return fn();
            }
            throw e;
        }
    }

    private needsRefresh(status: number): boolean {
        return [401, 403, 419, 440].includes(status);
    }

    private async performRefresh(): Promise<void> {
        if (AutoRefreshDecorator.inFlightRefresh) {
            return AutoRefreshDecorator.inFlightRefresh;
        }

        AutoRefreshDecorator.inFlightRefresh = (async () => {
            const res = await this.refresh(this.httpClient);
            if (!res.ok) {
                throw new HttpError('Token refresh failed', res.error.status, res.error.response);
            }
        })().finally(() => {
            AutoRefreshDecorator.inFlightRefresh = null;
        });

        return AutoRefreshDecorator.inFlightRefresh;
    }
}
