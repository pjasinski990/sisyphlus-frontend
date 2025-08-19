import { ShortcutRegistry } from '@/shared/feature/keyboard/application/port/out/shortcut-registry';
import { GroupedShortcuts, ListedShortcut } from '@/shared/feature/keyboard/entity/listed-shortcut';

function compareStringArrays(a: readonly string[], b: readonly string[]): number {
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
        const c = a[i].localeCompare(b[i]);
        if (c !== 0) return c;
    }
    return a.length - b.length;
}

export class InMemoryShortcutRegistry implements ShortcutRegistry {
    private byReg = new Map<string, ListedShortcut[]>();

    addMany(items: ListedShortcut[]): void {
        for (const it of items) {
            const arr = this.byReg.get(it.registrationId) ?? [];
            arr.push(it);
            this.byReg.set(it.registrationId, arr);
        }
    }

    removeByRegistration(registrationId: string): void {
        this.byReg.delete(registrationId);
    }

    snapshotGroupedByScope(): GroupedShortcuts {
        const grouped: GroupedShortcuts = {};
        for (const items of this.byReg.values()) {
            for (const it of items) {
                (grouped[it.scopeId] ||= []).push({ ...it });
            }
        }

        for (const scopeId of Object.keys(grouped)) {
            grouped[scopeId].sort((a, b) =>
                (a.group ?? '').localeCompare(b.group ?? '') ||
                a.description.localeCompare(b.description) ||
                compareStringArrays(a.combos, b.combos)
            );
        }

        return grouped;
    }
}
