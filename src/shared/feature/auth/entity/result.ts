export type ResultOk<T> = { ok: true; value: T };
export type ResultError<E> = { ok: false; error: E };

export type Result<E, T> = ResultError<E> | ResultOk<T>;

export function ok<T>(value: T): Result<never, T> {
    return { ok: true, value: value };
}

export function nok<E>(error: E): Result<E, never> {
    return { ok: false, error: error };
}

export type AsyncResult<E, T> = Promise<Result<E, T>>;
