import React from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { dialogController } from '@/shared/feature/dialog/infra/controllers/dialog-controller';
import { getDialogTemplate } from '@/shared/feature/dialog/infra/web/react/DialogTemplate';
import { AnchoredDialogInstance } from '@/shared/feature/dialog/entity/dialog-instance';
import { useShortcutScope } from '@/shared/feature/keyboard/infra/web/react/useShortcutScope';

type XYWH = { x: number; y: number; width: number; height: number };

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function shallowEqRect(a: XYWH | null, b: XYWH | null) {
    if (a === b) return true;
    if (!a || !b) return false;
    return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

function useAnchorRect(getRect: () => DOMRect | null) {
    const [rect, setRect] = React.useState<XYWH | null>(() => {
        const r = getRect();
        return r ? { x: r.left, y: r.top, width: r.width, height: r.height } : null;
    });

    const update = React.useCallback(() => {
        const r = getRect();
        const next: XYWH | null = r ? { x: r.left, y: r.top, width: r.width, height: r.height } : null;
        setRect(prev => (shallowEqRect(prev, next) ? prev : next));
    }, [getRect]);

    React.useLayoutEffect(() => {
        let ticking = false;
        const onScrollOrResize = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                ticking = false;
                update();
            });
        };

        update();

        window.addEventListener('resize', onScrollOrResize, { passive: true });
        window.addEventListener('scroll', onScrollOrResize, true);

        return () => {
            window.removeEventListener('resize', onScrollOrResize as EventListener);
            window.removeEventListener('scroll', onScrollOrResize, true);
        };
    }, [update]);

    return rect;
}

export const AnchoredDialogsHost: React.FC = () => {
    const [state, setState] = React.useState(dialogController.handleGetRegistry().getState());
    React.useEffect(() => dialogController.handleGetRegistry().subscribe(setState), []);

    const anchored: AnchoredDialogInstance[] = React.useMemo(
        () => state.stack.filter(d => d.options.variant === 'anchored') as AnchoredDialogInstance[],
        [state.stack]
    );

    const contentRefs = React.useRef(new Map<string, HTMLElement | null>());
    React.useEffect(() => {
        function onDown(e: MouseEvent) {
            for (const d of anchored) {
                const el = contentRefs.current.get(d.id) ?? null;
                const anchorRect: DOMRect | null = d.options.anchor?.getRect?.() ?? null;

                const insideContent = el ? el.contains(e.target as Node) : false;
                const insideAnchor = anchorRect
                    ? e.clientX >= anchorRect.left &&
                    e.clientX <= anchorRect.right &&
                    e.clientY >= anchorRect.top &&
                    e.clientY <= anchorRect.bottom
                    : false;

                if (!insideContent && !insideAnchor && d.dismissible) {
                    dialogController.handleDismiss(d.id);
                }
            }
        }
        document.addEventListener('mousedown', onDown, true);
        return () => document.removeEventListener('mousedown', onDown, true);
    }, [anchored]);

    const hasDialog = anchored.length > 0;
    return (
        <>
            {hasDialog && (<MountDialogShortcuts />)}
            <AnimatePresence>
                {anchored.map((d, index) => (
                    <AnchoredItem
                        key={d.id}
                        d={d}
                        index={index}
                        setContentRef={el => contentRefs.current.set(d.id, el)}
                    />
                ))}
            </AnimatePresence>
        </>
    );
};

const AnchoredItem: React.FC<{
    d: AnchoredDialogInstance;
    index: number;
    setContentRef: (el: HTMLElement | null) => void;
}> = ({ d, index, setContentRef }) => {
    const zIndex = d.options.zIndex + index;

    const rect = useAnchorRect(d.options.anchor.getRect);
    const [contentH, setContentH] = React.useState(0);
    const contentElRef = React.useRef<HTMLElement | null>(null);

    React.useLayoutEffect(() => {
        const el = contentElRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            setContentH(Math.ceil(entry.contentRect.height));
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [d.id]);

    const hadRectRef = React.useRef<boolean>(rect != null);
    React.useEffect(() => {
        if (rect) hadRectRef.current = true;
    }, [rect]);
    React.useEffect(() => {
        if (!rect && hadRectRef.current && d.dismissible) {
            dialogController.handleDismiss(d.id);
        }
    }, [rect, d.dismissible, d.id]);

    const vw = typeof window !== 'undefined' ? window.innerWidth : 0;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 0;

    const offset = d.options.offset ?? 8;
    const matchWidth = d.options.matchWidth ?? true;
    const width = rect && matchWidth ? rect.width : undefined;

    const preferredSide =
        d.options.side === 'top' || d.options.side === 'bottom' ? d.options.side : 'auto';

    const computedSide: 'top' | 'bottom' = !rect
        ? 'bottom'
        : preferredSide === 'top'
            ? 'top'
            : preferredSide === 'bottom'
                ? 'bottom'
                : rect.y + rect.height + contentH + offset <= vh
                    ? 'bottom'
                    : 'top';

    const align: 'start' | 'center' | 'end' = d.options.align ?? 'start';

    let left = rect ? rect.x : 0;
    if (rect) {
        if (align === 'center') left = rect.x + rect.width / 2 - (width ?? 0) / 2;
        if (align === 'end') left = rect.x + rect.width - (width ?? 0);
        left = clamp(left, 0, Math.max(0, vw - 8 - (width ?? 280)));
    }

    const top = rect
        ? computedSide === 'bottom'
            ? rect.y + rect.height + offset
            : rect.y - contentH - offset
        : 0;

    const safeTop = rect ? clamp(top, 8, Math.max(8, vh - 8 - contentH)) : 0;

    const Template = getDialogTemplate(d.key);

    const controls = useAnimationControls();
    React.useEffect(() => {
        if (!rect || !Template) return;
        controls.set({
            opacity: 0,
            y: computedSide === 'bottom' ? -20 : 20,
        });
        void controls.start({
            opacity: 1,
            y: 0,
            transition: { duration: 0.12, type: 'tween' },
        });
    }, [computedSide, rect, Template, controls]);

    if (!rect || !Template) return null;

    return (
        <motion.div
            initial={false}
            animate={controls}
            exit={{
                opacity: 0,
                y: computedSide === 'bottom' ? -20 : 20,
                transition: { duration: 0.12, type: 'tween' },
            }}
            className='fixed'
            style={{ top: safeTop, left, width, zIndex }}
            aria-hidden={false}
        >
            <menu
                ref={el => {
                    contentElRef.current = el;
                    setContentRef(el);
                }}
                className='pointer-events-auto'
                aria-modal='false'
            >
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                <div onMouseDown={e => e.stopPropagation()}>
                    <Template id={d.id} payload={d.payload} />
                </div>
            </menu>
        </motion.div>
    );
};

export const MountDialogShortcuts: React.FC = () => {
    useShortcutScope('dialog', true);
    return null;
};
