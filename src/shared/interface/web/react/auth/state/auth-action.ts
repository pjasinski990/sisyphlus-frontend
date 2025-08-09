import { User } from '@/shared/entities/user';

export type AuthAction =
    | { type: 'REQUEST' }
    | { type: 'SUCCESS'; user: User }
    | { type: 'FAILED'; error: string }
    | { type: 'LOGOUT' };
