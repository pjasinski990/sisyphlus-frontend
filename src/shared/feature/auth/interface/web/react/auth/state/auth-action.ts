import { User } from '@/shared/feature/auth/entity/user';

export type AuthAction =
    | { type: 'REQUEST' }
    | { type: 'SUCCESS'; user: User }
    | { type: 'FAILED'; error: string }
    | { type: 'LOGOUT' };
