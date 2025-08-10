import React, { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from '@/shared/feature/utils/react/route/routes';
import { AuthProvider } from '@/shared/feature/auth/interface/web/react/auth/context/AuthContext';
import { Layout } from '@/shared/feature/utils/components/Layout';
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
