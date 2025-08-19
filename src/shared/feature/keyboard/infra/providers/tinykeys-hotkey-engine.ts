import { HotkeyEngine, HotkeyEngineHandle } from '@/shared/feature/keyboard/application/port/out/hotkey-engine';
import { ShortcutBinding } from '@/shared/feature/keyboard/entity/shortcut-binding';
// @ts-expect-error tinykeys types may be imperfect in some setups
import { tinykeys } from 'tinykeys';

type ComboMap = Record<string, (e: KeyboardEvent) => void>;

export class TinykeysHotkeyEngine implements HotkeyEngine {
    register(
        bindings: ReadonlyArray<ShortcutBinding>,
        opts: {
            guard?: (e: KeyboardEvent) => boolean;
            preventDefault?: boolean;
            target?: Window | HTMLElement;
        } = {},
    ): HotkeyEngineHandle {
        const target: Window | HTMLElement = opts.target ?? window;

        const codeMap: ComboMap = {};
        const charMap: Array<{ char: string; handler: (e: KeyboardEvent) => void }> = [];

        const wrap = (fn: (e: KeyboardEvent) => void) => (e: KeyboardEvent) => {
            if (opts.guard && !opts.guard(e)) return;
            if (opts.preventDefault) e.preventDefault();
            fn(e);
        };

        for (const b of bindings) {
            for (const combo of b.combos) {
                const m = combo.match(/^char:(.+)$/i);
                if (m) {
                    charMap.push({ char: m[1], handler: b.handler });
                } else {
                    codeMap[combo] = wrap(b.handler);
                }
            }
        }

        const disposers: Array<() => void> = [];

        if (Object.keys(codeMap).length) {
            type TinykeysFn = (t: Window | HTMLElement, map: ComboMap) => () => void;
            const tk = tinykeys as unknown as TinykeysFn;
            const unbind = tk(target, codeMap);
            disposers.push(unbind);
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

            // Window and HTMLElement are EventTargets; avoid `any`
            const et: EventTarget = target;
            et.addEventListener('keydown', onKeyDown as EventListener);
            disposers.push(() => et.removeEventListener('keydown', onKeyDown as EventListener));
        }

        return { dispose: () => disposers.forEach((d) => d()) };
    }
}
