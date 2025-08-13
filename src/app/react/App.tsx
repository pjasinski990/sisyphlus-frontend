import React from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from '@/shared/util/react/route/routes';
import { AuthProvider } from '@/shared/feature/auth/interface/web/react/auth/context/AuthContext';
import { Layout } from '@/shared/util/react/components/Layout';
import { KeyboardProvider } from '@/shared/feature/keyboard/infra/web/react/KeyboardProvider';
import { registerDefaultDialogs } from '@/shared/feature/dialog/infra/web/react/bootstrap-dialogs';
import { DialogHost } from '@/shared/feature/dialog/infra/web/react/DialogHost';
import { GlobalShortcuts } from '@/app/react/global-shortcuts';

registerDefaultDialogs();

export function App() {
    const routing = useRoutes(routes);
    return (
        <AuthProvider>
            <KeyboardProvider>
                <GlobalShortcuts />
                <DialogHost />
                <Layout>
                    {routing}
                </Layout>
            </KeyboardProvider>
        </AuthProvider>
    );
}
