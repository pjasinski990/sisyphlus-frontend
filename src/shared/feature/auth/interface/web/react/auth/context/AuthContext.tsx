import { createContext, Dispatch, ReactNode, useEffect, useReducer } from 'react';
import { AuthState } from '../state/auth-state';
import { AuthAction } from '../state/auth-action';
import { authStateReducer } from '../state/auth-reducer';
import { authController } from '@/shared/feature/auth/interface/controller/user-auth-controller';

export const AuthStateCtx = createContext<AuthState | null>(null);
export const AuthDispatchCtx = createContext<Dispatch<AuthAction> | null>(null);

export function AuthProvider({ children }: { readonly children: ReactNode }) {
    const [state, dispatch] = useReducer(authStateReducer, {
        status: 'unauthenticated',
    });

    useEffect(() => {
        const fetchActiveUser = async () => {
            dispatch({ type: 'REQUEST' });
            const user = await authController.getCurrentUser();
            if (user.ok && user.value) {
                dispatch({ type: 'SUCCESS', user: user.value });
            } else {
                dispatch({ type: 'FAILED', error: '' });
            }
        };
        void fetchActiveUser();
    }, [dispatch]);

    return (
        <AuthDispatchCtx.Provider value={dispatch}>
            <AuthStateCtx.Provider value={state}>
                {children}
            </AuthStateCtx.Provider>
        </AuthDispatchCtx.Provider>
    );
} 
