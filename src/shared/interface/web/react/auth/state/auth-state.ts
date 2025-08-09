import { User } from '@/shared/entities/user';

export type AuthState =
    | { status: 'loading' }
    | { status: 'authenticated'; user: User }
    | { status: 'unauthenticated' }
    | { status: 'error'; error: string };
