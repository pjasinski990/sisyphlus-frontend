import { Dispatch, useContext } from 'react';
import { AuthDispatchCtx } from '@/shared/interface/web/react/auth/context/AuthContext';
import { AuthAction } from '@/shared/interface/web/react/auth/state/auth-action';

export function useAuthDispatch(): Dispatch<AuthAction> {
    const dispatch = useContext(AuthDispatchCtx);
    if (!dispatch) {
        throw new Error('useAuthDispatch must be used inside <AuthProvider>');
    }
    return dispatch;
}
