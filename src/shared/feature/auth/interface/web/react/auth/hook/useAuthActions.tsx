import { authController } from '@/shared/feature/auth/interface/controller/user-auth-controller';
import { Dispatch, useCallback } from 'react';
import { useAuthDispatch } from './useAuthDispatch';
import { Result } from '@/shared/feature/auth/entity/result';
import { User } from '@/shared/feature/auth/entity/user';
import { AuthAction } from '@/shared/feature/auth/interface/web/react/auth/state/auth-action';

export function useAuthActions() {
    const dispatch = useAuthDispatch();

    const login = useCallback((email: string, password: string) => {
        dispatch({ type: 'REQUEST' });
        authController.login(email, password)
            .then((res) => {
                dispatchUserResult(res, dispatch);
            });
    }, [dispatch]);

    const logout = useCallback(() => {
        authController.logout()
            .then(() => dispatch({ type: 'LOGOUT' }));
    }, [dispatch]);

    const register = useCallback((email: string, password: string) => {
        dispatch({ type: 'REQUEST' });
        authController.register(email, password)
            .then((res) => {
                dispatchUserResult(res, dispatch);
            });
    }, [dispatch]);

    return { login, logout, register };
}

function dispatchUserResult(res: Result<Error, User>, dispatch: Dispatch<AuthAction>) {
    if(res.ok) {
        dispatch({ type: 'SUCCESS', user: res.value });
    } else {
        dispatch({ type: 'FAILED', error: res.error.message });
    }
}
