import { Dispatch, useContext } from 'react';
import { AuthDispatchCtx } from '@/shared/feature/auth/interface/web/react/auth/context/AuthContext';
import { AuthAction } from '@/shared/feature/auth/interface/web/react/auth/state/auth-action';

export function useAuthDispatch(): Dispatch<AuthAction> {
    const dispatch = useContext(AuthDispatchCtx);
    if (!dispatch) {
        throw new Error('useAuthDispatch must be used inside <AuthProvider>');
    }
    return dispatch;
}
