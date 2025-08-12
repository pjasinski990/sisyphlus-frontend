import React from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from '@/shared/util/react/route/routes';
import { AuthProvider } from '@/shared/feature/auth/interface/web/react/auth/context/AuthContext';
import { Layout } from '@/shared/util/react/components/Layout';
import { KeyboardProvider } from '@/shared/feature/keyboard/infra/web/react/KeyboardProvider';
import { useShortcut } from './shared/feature/keyboard/infra/web/react/useShortcut';
import { useShortcutScope } from '@/shared/feature/keyboard/infra/web/react/useShortcutScope';
import { registerDefaultDialogs } from './shared/feature/dialog/infra/web/react/bootstrap-dialogs';
import { dialogController } from '@/shared/feature/dialog/infra/controllers/dialog-controller';
import { DialogHost } from '@/shared/feature/dialog/infra/web/react/DialogHost';

function App() {
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

function GlobalShortcuts() {
    useShortcutScope('global', true);
    useShortcut('global', [
        { combo: 'Control+k', handler: openCommandPalette, description: 'Open Command Palette', group: 'Navigation' },
        { combo: 'char:?', handler: openHelp, description: 'Open Help', group: 'Help' },
    ]);
    return null;
}

registerDefaultDialogs();

async function openCommandPalette() {
    console.log('Opening Command Palette...');
    const res = await dialogController.handleOpen<{ confirmed: true } | undefined>({
        key: 'confirm',
        payload: {
            title: 'Delete task?',
            message: 'This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Keep',
            danger: true,
        },
        options: { modal: true, dismissible: true },
    });
    console.log(res);
}

function openHelp() {
    console.log('open help');
}

export { App };
