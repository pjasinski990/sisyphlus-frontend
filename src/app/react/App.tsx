import React from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from '@/shared/util/react/route/routes';
import { AuthProvider } from '@/shared/feature/auth/interface/web/react/auth/context/AuthContext';
import { Layout } from '@/shared/util/react/components/Layout';
import { KeyboardProvider } from '@/shared/feature/keyboard/infra/web/react/KeyboardProvider';
import { registerDefaultDialogs } from '@/shared/feature/dialog/infra/web/react/bootstrap-dialogs';
import { DialogHost } from '@/shared/feature/dialog/infra/web/react/DialogHost';
import { DialogShortcuts, GlobalShortcuts } from '@/app/react/global-shortcuts';
import { CommandPaletteEntries } from '@/app/react/global-command-palette-entries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const qc = new QueryClient();
registerDefaultDialogs();

export function App() {
    const routing = useRoutes(routes);
    return (
        <QueryClientProvider client={qc}>
            <AuthProvider>
                <KeyboardProvider>
                    <CommandPaletteEntries />
                    <GlobalShortcuts />
                    <DialogShortcuts />
                    <DialogHost />
                    <Layout>
                        {routing}
                    </Layout>
                </KeyboardProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
