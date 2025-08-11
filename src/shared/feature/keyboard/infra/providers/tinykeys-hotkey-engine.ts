import { ShortcutBindings } from '@/shared/feature/keyboard/entity/shortcut-bindings';
import { HotkeyEngine, HotkeyEngineHandle } from '@/shared/feature/keyboard/application/port/out/hotkey-engine';
// @ts-expect-error the lib doesn't have correctly configured types
import { tinykeys } from 'tinykeys';

export class TinykeysHotkeyEngine implements HotkeyEngine {
    register(
        bindings: ShortcutBindings,
        opts: { guard?: (e: KeyboardEvent) => boolean; preventDefault?: boolean; target?: Window | HTMLElement } = {}
    ): HotkeyEngineHandle {
        const target = (opts.target ?? window) as Window | HTMLElement;

        const codeMap: Record<string, (e: KeyboardEvent) => void> = {};
        const charMap: Array<{ char: string; handler: (e: KeyboardEvent) => void }> = [];

        for (const [combo, handler] of Object.entries(bindings)) {
            const m = combo.match(/^char:(.+)$/i);
            if (m) {
                const char = m[1];
                charMap.push({
                    char,
                    handler: (e: KeyboardEvent) => {
                        if (opts.guard && !opts.guard(e)) return;
                        if (opts.preventDefault) e.preventDefault();
                        handler(e);
                    },
                });
            } else {
                codeMap[combo] = (e: KeyboardEvent) => {
                    if (opts.guard && !opts.guard(e)) return;
                    if (opts.preventDefault) e.preventDefault();
                    handler(e);
                };
            }
        }

        const disposers: Array<() => void> = [];

        if (Object.keys(codeMap).length) {
            const un = tinykeys(target as unknown, codeMap);
            disposers.push(un);
        }

        if (charMap.length) {
            const onKeyDown = (e: KeyboardEvent) => {
                for (const { char, handler } of charMap) {
                    if (e.key === char) {
                        if (opts.guard && !opts.guard(e)) return;
                        if (opts.preventDefault) e.preventDefault();
                        handler(e);
                        return;
                    }
                }
            };
            (target as any).addEventListener('keydown', onKeyDown);
            disposers.push(() => (target as any).removeEventListener('keydown', onKeyDown));
        }

        return { dispose: () => disposers.forEach((d) => d()) };
    }
}
