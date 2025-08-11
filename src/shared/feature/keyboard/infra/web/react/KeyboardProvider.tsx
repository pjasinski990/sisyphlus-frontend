import React, { createContext, useContext, useMemo } from 'react';
import { keyboardController, KeyboardController } from '@/shared/feature/keyboard/infra/controllers/keyboard-controller';

type CtxType = { controller: KeyboardController };

const KeyboardCtx = createContext<CtxType | null>(null);

export const KeyboardProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const controller = useMemo(() => keyboardController, []);
    return <KeyboardCtx.Provider value={{ controller }}>{children}</KeyboardCtx.Provider>;
};

export function useKeyboardController(): KeyboardController {
    const ctx = useContext(KeyboardCtx);
    if (!ctx) throw new Error('useKeyboardController must be used within <KeyboardProvider>');
    return ctx.controller;
}
