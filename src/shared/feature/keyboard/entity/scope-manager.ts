import { ShortcutScope } from './scope-state';

export class ScopeManager {
    private scopes = new Map<string, ShortcutScope>();

    define(id: string, priority: number, exclusive = false) {
        if (!this.scopes.has(id)) {
            this.scopes.set(id, { id, enabled: false, priority, exclusive });
        }
    }

    enable(id: string) {
        const s = this.scopes.get(id);
        if (!s) return;
        s.enabled = true;
        this.scopes.set(id, s);
    }

    disable(id: string) {
        const s = this.scopes.get(id);
        if (!s) return;
        s.enabled = false;
        this.scopes.set(id, s);
    }

    isAnyExclusiveActiveAbove(priority: number): boolean {
        for (const s of this.scopes.values()) {
            if (s.enabled && s.exclusive && s.priority > priority) return true;
        }
        return false;
    }

    isScopeActive(id: string): boolean {
        const s = this.scopes.get(id);
        if (!s || !s.enabled) return false;
        return !this.isAnyExclusiveActiveAbove(s.priority);

    }

    getState(id: string): ShortcutScope | null {
        return this.scopes.get(id) ?? null;
    }
}
