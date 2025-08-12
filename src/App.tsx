import React from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from '@/shared/util/react/route/routes';
import { AuthProvider } from '@/shared/feature/auth/interface/web/react/auth/context/AuthContext';
import { Layout } from '@/shared/util/react/components/Layout';
import { KeyboardProvider } from '@/shared/feature/keyboard/infra/web/react/KeyboardProvider';
import { useShortcut } from './shared/feature/keyboard/infra/web/react/useShortcut';
import { useShortcutScope } from '@/shared/feature/keyboard/infra/web/react/useShortcutScope';

function App() {
    const routing = useRoutes(routes);

    return (
        <AuthProvider>
            <KeyboardProvider>
                <GlobalShortcuts />
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

function openCommandPalette() {
    console.log('open command palette');
}

function openHelp() {
    console.log('open help');
}

export { App };
