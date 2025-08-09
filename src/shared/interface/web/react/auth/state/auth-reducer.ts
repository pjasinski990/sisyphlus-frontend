import { AuthState } from './auth-state';
import { AuthAction } from '@/shared/interface/web/react/auth/state/auth-action';

export function authStateReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'REQUEST':
            return { status: 'loading' };
        case 'SUCCESS':
            return { status: 'authenticated', user: action.user };
        case 'FAILED':
            return { status: 'error', error: action.error };
        case 'LOGOUT':
            return { status: 'unauthenticated' };
    }
}
