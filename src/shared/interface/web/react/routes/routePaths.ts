export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
} as const;

export const buildRoute = {
    home: () => ROUTES.HOME,
    login: () => ROUTES.LOGIN,
    register: () => ROUTES.REGISTER,
} as const;

export type RouteKey = keyof typeof ROUTES; 
