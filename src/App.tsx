import React from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from '@/shared/interface/web/react/routes';
import { AuthProvider } from './shared/interface/web/react/auth/context/AuthContext';
import { Layout } from './shared/interface/web/react/components/Layout';

function App() {
    const routing = useRoutes(routes);

    return (
        <AuthProvider>
            <Layout>
                {routing}
            </Layout>
        </AuthProvider>
    );
}

export { App };
