export const ROUTES = {
    HOME: '/',
    USER: '/user',
    LOGIN: '/login',
    REGISTER: '/register',
} as const;

export const buildRoute = {
    home: () => ROUTES.HOME,
    user: () => ROUTES.USER,
    login: () => ROUTES.LOGIN,
    register: () => ROUTES.REGISTER,
} as const;

export type RouteKey = keyof typeof ROUTES; 
