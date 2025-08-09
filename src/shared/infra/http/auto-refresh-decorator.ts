import { GenericResponse } from '@/shared/entity/generic-repsonse';
import { HttpClient, HttpError, HttpResponse, RequestConfig } from '@/shared/application/port/out/http-client';

export class AutoRefreshDecorator implements HttpClient {
    private static inFlightRefresh: Promise<void> | null = null;

    constructor(
        private readonly http: HttpClient,
        private readonly refresh: (client: HttpClient) => Promise<HttpResponse<GenericResponse>>
    ) {}

    async get<T = unknown>(url: string, config?: RequestConfig): Promise<HttpResponse<T>> {
        return this.tryRequest(() => this.http.get<T>(url, config));
    }

    async post<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<HttpResponse<T>> {
        return this.tryRequest(() => this.http.post<T>(url, data, config));
    }

    async put<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<HttpResponse<T>> {
        return this.tryRequest(() => this.http.put<T>(url, data, config));
    }

    async delete<T = unknown>(url: string, config?: RequestConfig): Promise<HttpResponse<T>> {
        return this.tryRequest(() => this.http.delete<T>(url, config));
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
            const res = await this.refresh(this.http);
            if (res.status >= 400) {
                throw new HttpError('Token refresh failed', res.status, res);
            }
        })().finally(() => {
            AutoRefreshDecorator.inFlightRefresh = null;
        });

        return AutoRefreshDecorator.inFlightRefresh;
    }
}
