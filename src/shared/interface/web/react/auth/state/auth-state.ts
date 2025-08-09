import { User } from '@/shared/entity/user';

export type AuthState =
    | { status: 'loading' }
    | { status: 'authenticated'; user: User }
    | { status: 'unauthenticated' }
    | { status: 'error'; error: string };
