import { createContext, Dispatch, ReactNode, useReducer } from 'react';
import { AuthState } from '../state/auth-state';
import { AuthAction } from '../state/auth-action';
import { authStateReducer } from '../state/auth-reducer';

export const AuthStateCtx = createContext<AuthState | null>(null);
export const AuthDispatchCtx = createContext<Dispatch<AuthAction> | null>(null);

export function AuthProvider({ children }: { readonly children: ReactNode }) {
    const [state, dispatch] = useReducer(authStateReducer, {
        status: 'unauthenticated',
    });

    return (
        <AuthDispatchCtx.Provider value={dispatch}>
            <AuthStateCtx.Provider value={state}>
                {children}
            </AuthStateCtx.Provider>
        </AuthDispatchCtx.Provider>
    );
} 
