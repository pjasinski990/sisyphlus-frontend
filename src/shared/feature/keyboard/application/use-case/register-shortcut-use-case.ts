import { HotkeyEngine, HotkeyEngineHandle } from '@/shared/feature/keyboard/application/port/out/hotkey-engine';
import { ShortcutRegistration } from '@/shared/feature/keyboard/entity/shortcut-registration';
import { RegisterShortcut } from '@/shared/feature/keyboard/application/port/in/register-shortcut';
import { v4 as uuid } from 'uuid';
import { ScopeManager } from '@/shared/feature/keyboard/entity/scope-manager';
import { ShortcutRegistry } from '../port/out/shortcut-registry';

type Stored = { handle: HotkeyEngineHandle; reg: ShortcutRegistration; };

export class RegisterShortcutUseCase implements RegisterShortcut {
    private store = new Map<string, Stored>();

    constructor(
        private readonly engine: HotkeyEngine,
        private readonly scopes: ScopeManager,
        private readonly registry: ShortcutRegistry,   // NEW
    ) {}

    registerShortcut(regInput: Omit<ShortcutRegistration, 'id'>): string {
        const id = uuid();
        const reg: ShortcutRegistration = { preventDefault: true, ignoreTyping: true, ...regInput, id };

        const guard = (e: KeyboardEvent) => {
            if (reg.ignoreTyping && isTyping(e)) return false;
            return this.scopes.isScopeActive(reg.scopeId);
        };

        const handle = this.engine.register(reg.bindings, { guard, preventDefault: reg.preventDefault });

        this.registry.addMany(
            reg.bindings.map(b => ({
                registrationId: id,
                scopeId: reg.scopeId,
                combo: b.combo,
                description: b.description,
                group: b.group,
            }))
        );

        this.store.set(id, { handle, reg });
        return id;
    }

    unregister(id: string) {
        const item = this.store.get(id);
        if (!item) return;
        item.handle.dispose();
        this.store.delete(id);
        this.registry.removeByRegistration(id);   // NEW
    }
}

function isTyping(e: KeyboardEvent) {
    const el = e.target as HTMLElement | null;
    if (!el) return false;
    return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).isContentEditable;
}
