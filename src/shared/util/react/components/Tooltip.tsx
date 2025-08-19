import React from 'react';
import { createPortal } from 'react-dom';

type TooltipProps = {
    children: React.ReactNode;
    tooltip?: string;
    delayMs?: number;
    offset?: number;
    exitMs?: number;
};

type DOMHandlers = Pick<
    React.HTMLAttributes<HTMLElement>,
    'onMouseEnter' | 'onMouseLeave' | 'onFocus' | 'onBlur' | 'onTouchStart' | 'onTouchEnd' | 'onMouseDown' | 'onMouseUp'
>;

function getOrigHandler<K extends keyof DOMHandlers>(
    el: React.ReactElement,
    key: K
): DOMHandlers[K] | undefined {
    const props = el.props as unknown;
    if (typeof props !== 'object' || props === null) return undefined;
    const rec = props as Record<string, unknown>;
    const maybe = rec[key];
    return typeof maybe === 'function' ? (maybe as DOMHandlers[K]) : undefined;
}

export const Tooltip: React.FC<TooltipProps> = ({
    children,
    tooltip,
    delayMs = 500,
    offset = 8,
    exitMs = 150,
}) => {
    const [open, setOpen] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    const [visible, setVisible] = React.useState(false);
    const [pos, setPos] = React.useState<{ top: number; left: number; placement: 'top' | 'bottom' }>({
        top: 0,
        left: 0,
        placement: 'bottom',
    });

    const anchorRef = React.useRef<HTMLElement | null>(null);
    const showTimer = React.useRef<number | null>(null);
    const hideTimer = React.useRef<number | null>(null);
    const unmountTimer = React.useRef<number | null>(null);
    const isClicking = React.useRef(false);

    const clearTimers = React.useCallback(() => {
        if (showTimer.current) window.clearTimeout(showTimer.current);
        if (hideTimer.current) window.clearTimeout(hideTimer.current);
        if (unmountTimer.current) window.clearTimeout(unmountTimer.current);
        showTimer.current = hideTimer.current = unmountTimer.current = null;
    }, []);

    const computeAndSetPos = React.useCallback(
        (el: HTMLElement) => {
            const rect = el.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const placeBottom = spaceBelow > 48;
            setPos({
                top: placeBottom ? rect.bottom + offset : rect.top - offset,
                left: rect.left + rect.width / 2,
                placement: placeBottom ? 'bottom' : 'top',
            });
        },
        [offset]
    );

    const scheduleShow = React.useCallback(
        (el: HTMLElement) => {
            if (isClicking.current) return;
            clearTimers();
            showTimer.current = window.setTimeout(() => {
                anchorRef.current = el;
                computeAndSetPos(el);
                setMounted(true);
                requestAnimationFrame(() => {
                    setOpen(true);
                    requestAnimationFrame(() => setVisible(true));
                });
            }, delayMs);
        },
        [clearTimers, computeAndSetPos, delayMs]
    );

    const scheduleHide = React.useCallback(() => {
        clearTimers();
        setVisible(false);
        hideTimer.current = window.setTimeout(() => {
            setOpen(false);
            unmountTimer.current = window.setTimeout(() => setMounted(false), exitMs);
        }, 0);
    }, [clearTimers, exitMs]);

    React.useEffect(() => () => clearTimers(), [clearTimers]);

    React.useEffect(() => {
        if (!open) return;
        const onScroll = () => {
            const el = anchorRef.current;
            if (el) computeAndSetPos(el);
        };
        const onResize = onScroll;
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
        };
    }, [open, computeAndSetPos]);

    React.useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') scheduleHide();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, scheduleHide]);

    if (!tooltip) return <>{children}</>;

    let child: React.ReactNode;
    if (React.isValidElement(children)) {
        const el = children as React.ReactElement;
        const origEnter = getOrigHandler(el, 'onMouseEnter');
        const origLeave = getOrigHandler(el, 'onMouseLeave');
        const origFocus = getOrigHandler(el, 'onFocus');
        const origBlur = getOrigHandler(el, 'onBlur');
        const origTouchStart = getOrigHandler(el, 'onTouchStart');
        const origTouchEnd = getOrigHandler(el, 'onTouchEnd');
        const origMouseDown = getOrigHandler(el, 'onMouseDown');
        const origMouseUp = getOrigHandler(el, 'onMouseUp');

        child = React.cloneElement(el, {
            onMouseDown: (e: React.MouseEvent<HTMLElement>) => {
                isClicking.current = true;
                clearTimers();
                setVisible(false);
                setMounted(false);
                origMouseDown?.(e);
            },
            onMouseUp: (e: React.MouseEvent<HTMLElement>) => {
                queueMicrotask(() => {
                    isClicking.current = false;
                });
                origMouseUp?.(e);
            },
            onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
                origEnter?.(e);
                scheduleShow(e.currentTarget as HTMLElement);
            },
            onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
                origLeave?.(e);
                scheduleHide();
            },
            onFocus: (e: React.FocusEvent<HTMLElement>) => {
                origFocus?.(e);
                scheduleShow(e.currentTarget as HTMLElement);
            },
            onBlur: (e: React.FocusEvent<HTMLElement>) => {
                origBlur?.(e);
                scheduleHide();
            },
            onTouchStart: (e: React.TouchEvent<HTMLElement>) => {
                isClicking.current = true;
                clearTimers();
                origTouchStart?.(e);
            },
            onTouchEnd: (e: React.TouchEvent<HTMLElement>) => {
                isClicking.current = false;
                origTouchEnd?.(e);
                scheduleHide();
            },
        } as Partial<DOMHandlers>);
    } else {
        child = (
            <span
                className='inline-block align-baseline'
                onMouseDown={() => {
                    isClicking.current = true;
                    clearTimers();
                }}
                onMouseUp={() => {
                    queueMicrotask(() => {
                        isClicking.current = false;
                    });
                }}
                onMouseEnter={(e) => scheduleShow(e.currentTarget as HTMLElement)}
                onMouseLeave={scheduleHide}
                onFocus={(e) => scheduleShow(e.currentTarget as HTMLElement)}
                onBlur={scheduleHide}
                onTouchStart={() => {
                    isClicking.current = true;
                    clearTimers();
                }}
                onTouchEnd={() => {
                    isClicking.current = false;
                    scheduleHide();
                }}
            >
                {children}
            </span>
        );
    }

    const bubble =
        mounted && typeof window !== 'undefined'
            ? createPortal(
                <div
                    role='tooltip'
                    className={[
                        'fixed z-[100] pointer-events-none select-none',
                        'whitespace-nowrap rounded-md px-2 py-2',
                        'bg-surface-3 text-s-10 text-xs defined-shadow',
                        'transform transition duration-150',
                        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
                        pos.placement === 'bottom' ? 'origin-top' : 'origin-bottom',
                    ].join(' ')}
                    style={{
                        top: pos.top,
                        left: pos.left,
                        transform: 'translateX(-50%) ' + (visible ? 'scale(1)' : 'scale(0.95)'),
                    }}
                >
                    <div
                        className={[
                            'absolute w-2 h-2 rotate-45 bg-surface-3',
                            pos.placement === 'bottom'
                                ? '-top-1 left-1/2 -translate-x-1/2'
                                : '-bottom-1 left-1/2 -translate-x-1/2',
                        ].join(' ')}
                    />
                    {tooltip}
                </div>,
                document.body
            )
            : null;

    return (
        <>
            {child}
            {bubble}
        </>
    );
};
