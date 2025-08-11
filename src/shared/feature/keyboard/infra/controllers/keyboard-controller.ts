import { ScopeManager } from '../../entity/scope-manager';
import { TinykeysHotkeyEngine } from '../providers/tinykeys-hotkey-engine';
import { UnregisterShortcutUseCase } from '@/shared/feature/keyboard/application/use-case/unregister-shortcut-use-case';
import { RegisterShortcutUseCase } from '@/shared/feature/keyboard/application/use-case/register-shortcut-use-case';
import { EnableScopeUseCase } from '@/shared/feature/keyboard/application/use-case/enable-scope-use-case';
import { DisableScopeUseCase } from '@/shared/feature/keyboard/application/use-case/disable-scope-use-case';
import { HotkeyEngine } from '@/shared/feature/keyboard/application/port/out/hotkey-engine';
import { RegisterShortcut } from '@/shared/feature/keyboard/application/port/in/register-shortcut';
import { UnregisterShortcut } from '@/shared/feature/keyboard/application/port/in/unregister-shortcut';
import { EnableScope } from '@/shared/feature/keyboard/application/port/in/enable-scope';
import { DisableScope } from '../../application/port/in/disable-scope';
import { ShortcutRegistration } from '@/shared/feature/keyboard/entity/shortcut-registration';

export class KeyboardController {

    constructor(
        private readonly scopes: ScopeManager,
        private readonly engine: HotkeyEngine,
        private readonly register: RegisterShortcut,
        private readonly unregister: UnregisterShortcut,
        private readonly enableScope: EnableScope,
        private readonly disableScope: DisableScope,

        config?: { predefinedScopes?: Array<{ id: string; priority: number; exclusive?: boolean; enabled?: boolean }>; }
    ) {
        config?.predefinedScopes?.forEach(s => {
            this.scopes.define(s.id, s.priority, !!s.exclusive);
            if (s.enabled) this.scopes.enable(s.id);
        });
    }

    handleDefineScope(id: string, priority: number, exclusive = false) {
        this.scopes.define(id, priority, exclusive);
    }

    handleEnableScope(id: string) {
        this.enableScope.enableScope(id);
    }

    handleDisableScope(id: string) {
        this.disableScope.disableScope(id);
    }

    handleRegisterShortcut(params: Omit<ShortcutRegistration, 'id'>): string {
        return this.register.registerShortcut(params);
    }

    handleUnregisterShortcut(id: string) {
        this.unregister.unregisterShortcut(id);
    }
}

const scopes = new ScopeManager();
const engine = new TinykeysHotkeyEngine();

const register = new RegisterShortcutUseCase(engine, scopes);
const unregister = new UnregisterShortcutUseCase(register);
const enableScope = new EnableScopeUseCase(scopes);
const disableScope = new DisableScopeUseCase(scopes);

const config = {
    predefinedScopes: [
        { id: 'global', priority: 10, exclusive: false, enabled: true },
        { id: 'page', priority: 50, exclusive: false, enabled: false },
        { id: 'modal', priority: 100, exclusive: true, enabled: false },
    ],
};

export const keyboardController = new KeyboardController(
    scopes,
    engine,
    register,
    unregister,
    enableScope,
    disableScope,
    config,
);
