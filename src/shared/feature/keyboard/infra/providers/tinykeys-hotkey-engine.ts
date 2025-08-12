import { ShortcutBinding } from '@/shared/feature/keyboard/entity/shortcut-binding';
import { HotkeyEngine, HotkeyEngineHandle } from '@/shared/feature/keyboard/application/port/out/hotkey-engine';
// @ts-expect-error tiny keys doesn’t ship perfect types in some setups
import { tinykeys } from 'tinykeys';

export class TinykeysHotkeyEngine implements HotkeyEngine {
    register(
        bindings: ShortcutBinding[],
        opts: { guard?: (e: KeyboardEvent) => boolean; preventDefault?: boolean; target?: Window | HTMLElement } = {}
    ): HotkeyEngineHandle {
        const target = (opts.target ?? window) as Window | HTMLElement;

        const codeMap: Record<string, (e: KeyboardEvent) => void> = {};
        const charMap: Array<{ char: string; handler: (e: KeyboardEvent) => void }> = [];

        for (const b of bindings) {
            const wrap = (fn: (e: KeyboardEvent) => void) => (e: KeyboardEvent) => {
                if (opts.guard && !opts.guard(e)) return;
                if (opts.preventDefault) e.preventDefault();
                fn(e);
            };
            const m = b.combo.match(/^char:(.+)$/i);
            if (m) {
                charMap.push({ char: m[1], handler: wrap(b.handler) });
            } else {
                codeMap[b.combo] = wrap(b.handler);
            }
        }

        const disposers: Array<() => void> = [];

        if (Object.keys(codeMap).length) {
            const un = tinykeys(target as any, codeMap);
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

        return { dispose: () => disposers.forEach(d => d()) };
    }
}
