import React, { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from '@/shared/interface/web/react/route/routes';
import { AuthProvider } from './shared/interface/web/react/auth/context/AuthContext';
import { Layout } from '@/shared/interface/web/react/component/Layout';
import { themeController } from '@/feature/theme/interface/controller/theme-controller';

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
