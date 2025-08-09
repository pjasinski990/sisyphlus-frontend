import { User } from '@/shared/entity/user';

export type AuthAction =
    | { type: 'REQUEST' }
    | { type: 'SUCCESS'; user: User }
    | { type: 'FAILED'; error: string }
    | { type: 'LOGOUT' };
