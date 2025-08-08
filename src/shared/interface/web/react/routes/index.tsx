import React from 'react';
import { RouteObject } from 'react-router-dom';
import { ROUTES } from './routePaths';
import { HomePage } from './HomePage';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
// TODO: Add other route components as they are created

export const routes: RouteObject[] = [
    {
        path: ROUTES.HOME,
        element: <HomePage />,
    },
    {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
    },
    {
        path: ROUTES.REGISTER,
        element: <RegisterPage />,
    },
    // TODO: Add more routes as they are implemented
    // {
    //     path: ROUTES.QUIZ,
    //     element: <Quiz />,
    // },
]; 
