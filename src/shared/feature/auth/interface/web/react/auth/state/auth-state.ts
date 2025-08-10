import { User } from '@/shared/feature/auth/entity/user';

export type AuthState =
    | { status: 'loading' }
    | { status: 'authenticated'; user: User }
    | { status: 'unauthenticated' }
    | { status: 'error'; error: string };
