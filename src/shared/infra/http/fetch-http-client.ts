import { HttpClient, HttpResponse, RequestConfig, HttpError } from '@/shared/application/ports/out/http-client';
import { GenericResponse } from '@/shared/entities/generic-repsonse';
import { AutoRefreshDecorator } from '@/shared/infra/http/auto-refresh-decorator';

type FetchRequestConfig = RequestConfig & {
    signal?: AbortSignal;
};

class FetchHttpClient implements HttpClient {
    private readonly baseURL: string;
    private readonly defaultHeaders: HeadersInit = { 'Content-Type': 'application/json' };

    constructor(baseURL: string = '/api') {
        this.baseURL = baseURL;
    }

    async get<T = unknown>(
        url: string,
        config?: FetchRequestConfig
    ): Promise<HttpResponse<T>> {
        return this.doRequest<T>('GET', url, undefined, config);
    }

    async post<T = unknown>(
        url: string,
        data?: unknown,
        config?: FetchRequestConfig
    ): Promise<HttpResponse<T>> {
        return this.doRequest<T>('POST', url, data, config);
    }

    async put<T = unknown>(
        url: string,
        data?: unknown,
        config?: FetchRequestConfig
    ): Promise<HttpResponse<T>> {
        return this.doRequest<T>('PUT', url, data, config);
    }

    async delete<T = unknown>(
        url: string,
        config?: FetchRequestConfig
    ): Promise<HttpResponse<T>> {
        return this.doRequest<T>('DELETE', url, undefined, config);
    }

    private async doRequest<T>(
        method: string,
        url: string,
        body?: unknown,
        config?: FetchRequestConfig
    ): Promise<HttpResponse<T>> {
        const isFormData = body instanceof FormData;
        const headers: HeadersInit = { ...config?.headers };
        let parsedBody: BodyInit | undefined;

        if (body !== undefined) {
            parsedBody = isFormData
                ? (body as FormData)
                : JSON.stringify(body);
        }

        if (!isFormData) {
            headers['Content-Type'] ??= 'application/json';
        }

        try {
            const res = await fetch(this.resolve(url), {
                method,
                body: parsedBody,
                headers: { ...headers, ...config?.headers },
                credentials: 'include',
                signal: config?.signal
            });

            const data = (await (res.headers
                .get('content-type')
                ?.includes('application/json')
                ? res.json()
                : res.text())) as T;

            if (!res.ok) throw new HttpError(res.statusText, res.status, data);

            return {
                data,
                status: res.status,
                headers: Object.fromEntries(res.headers.entries())
            };
        } catch (err: unknown) {
            if (err instanceof HttpError) throw err;
            const message =
                err instanceof Error ? err.message : 'HTTP request failed';
            throw new HttpError(message, 0, err);
        }
    }

    private resolve(url: string): string {
        return url.startsWith('http') ? url : `${this.baseURL}${url}`;
    }
}

async function refresh(httpClient: HttpClient): Promise<HttpResponse<GenericResponse>> {
    return httpClient.get<GenericResponse>('/auth/refresh');
}

export const httpClient = new AutoRefreshDecorator(new FetchHttpClient(), refresh);
