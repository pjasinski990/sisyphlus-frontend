import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { dialogController } from '@/shared/feature/dialog/infra/controllers/dialog-controller';
import { getDialogTemplate } from '@/shared/feature/dialog/infra/web/react/DialogTemplate';
import { AnchoredDialogInstance } from '@/shared/feature/dialog/entity/dialog-instance';

type XYWH = { x: number; y: number; width: number; height: number };

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function useAnchorRect(getRect: () => DOMRect | null) {
    const [rect, setRect] = React.useState<XYWH | null>(() => {
        const r = getRect();
        return r ? { x: r.left, y: r.top, width: r.width, height: r.height } : null;
    });

    React.useLayoutEffect(() => {
        let raf = 0;
        const update = () => {
            const r = getRect();
            if (r) setRect({ x: r.left, y: r.top, width: r.width, height: r.height });
            else setRect(null);
            raf = requestAnimationFrame(update);
        };
        update();

        const onWin = () => { cancelAnimationFrame(raf); update(); };
        window.addEventListener('resize', onWin, { passive: true });
        window.addEventListener('scroll', onWin, true);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onWin);
            window.removeEventListener('scroll', onWin, true);
        };
    }, [getRect]);

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
                    ? e.clientX >= anchorRect.left && e.clientX <= anchorRect.right &&
                    e.clientY >= anchorRect.top && e.clientY <= anchorRect.bottom
                    : false;

                if (!insideContent && !insideAnchor && d.dismissible) {
                    dialogController.handleDismiss(d.id);
                }
            }
        }
        document.addEventListener('mousedown', onDown, true);
        return () => document.removeEventListener('mousedown', onDown, true);
    }, [anchored]);

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && anchored.length) {
                const top = anchored[anchored.length - 1];
                if (top?.dismissible) dialogController.handleDismiss(top.id);
            }
        };
        document.addEventListener('keydown', onKey, true);
        return () => document.removeEventListener('keydown', onKey, true);
    }, [anchored]);

    return (
        <AnimatePresence>
            {anchored.map((d, index) => (
                <AnchoredItem
                    key={d.id}
                    d={d}
                    index={index}
                    setContentRef={(el) => contentRefs.current.set(d.id, el)}
                />
            ))}
        </AnimatePresence>
    );
};

const AnchoredItem: React.FC<{
    d: AnchoredDialogInstance;
    index: number;
    setContentRef: (el: HTMLElement | null) => void;
}> = ({ d, index, setContentRef }) => {
    const zIndex = d.options.zIndex + index;
    const getRect = d.options.anchor.getRect;
    const rect = useAnchorRect(getRect);

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

    if (!rect) return null;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const offset = d.options.offset ?? 8;
    const matchWidth = d.options.matchWidth ?? true;
    const width = matchWidth ? rect.width : undefined;

    const preferredSide = d.options.side === 'top' || d.options.side === 'bottom' ? d.options.side : 'auto';
    const side: 'top' | 'bottom' =
        preferredSide === 'top'
            ? 'top'
            : preferredSide === 'bottom'
                ? 'bottom'
                : rect.y + rect.height + contentH + offset <= vh
                    ? 'bottom'
                    : 'top';

    const align: 'start' | 'center' | 'end' = d.options.align ?? 'start';

    let left = rect.x;
    if (align === 'center') left = rect.x + rect.width / 2 - (width ?? 0) / 2;
    if (align === 'end') left = rect.x + rect.width - (width ?? 0);
    left = clamp(left, 0, vw - 8 - (width ?? 280));

    const top = side === 'bottom'
        ? rect.y + rect.height + offset
        : rect.y - contentH - offset;

    const safeTop = clamp(top, 8, vh - 8 - contentH);

    const Template = getDialogTemplate(d.key);
    if (!Template) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: side === 'bottom' ? -4 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: side === 'bottom' ? -4 : 4 }}
            transition={{ duration: 0.12, type: 'tween' }}
            className='fixed'
            style={{ top: safeTop, left, width, zIndex }}
            role='presentation'
            aria-hidden={false}
        >
            <menu
                ref={(el) => {
                    contentElRef.current = el;
                    setContentRef(el);
                }}
                className='pointer-events-auto bg-surface-3 rounded-xl shadow-xl overflow-hidden'
                aria-modal='false'
            >
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                <div onMouseDown={(e) => e.stopPropagation()}>
                    <Template id={d.id} payload={d.payload} />
                </div>
            </menu>
        </motion.div>
    );
};
