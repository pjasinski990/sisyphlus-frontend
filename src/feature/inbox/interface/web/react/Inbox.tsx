import React from 'react';
import { InboxTaskCard } from '@/feature/inbox/interface/web/react/InboxTaskCard';
import { useInboxTaskIdsQuery } from '@/feature/inbox/interface/web/react/use-inbox-task-ids';
import { dialogController } from '@/shared/feature/dialog/infra/controllers/dialog-controller';
import { todayLocalDate, tomorrowLocalDate } from '@/shared/util/local-date-helper';
import { useScheduleTaskFor } from '@/feature/day-plan/interface/web/react/use-day-plan';
import { Task } from '@/shared/feature/task/entity/task';
import { openCommandPalette } from '@/app-init/shortcut-handlers/open-command-pallete';
import { useTasksByIdsQuery } from '@/shared/feature/task/interface/web/react/use-tasks-by-ids';
import { AnimatePresence, motion } from 'framer-motion';

export async function openInbox() {
    await dialogController.handleOpen({
        key: 'custom',
        payload: { children: <Inbox /> },
    });
}

export const Inbox: React.FC = () => {
    const idsQ = useInboxTaskIdsQuery();
    const ids = idsQ.data ?? [];

    const tasksQ = useTasksByIdsQuery(ids, {
        enabled: idsQ.status === 'success' && ids.length > 0,
    });

    if (idsQ.status === 'pending') return <div>Loading...</div>;
    if (idsQ.status === 'error') return <div>Error: {(idsQ.error as Error)?.message}</div>;

    const hasTasks = ids.length > 0;

    const tasksInOrder: Task[] =
        hasTasks && tasksQ.status === 'success'
            ? ids.map(id => tasksQ.data?.get(id)).filter((t): t is Task => !!t)
            : [];

    if (hasTasks && tasksQ.status === 'pending') return <div>Loading...</div>;
    if (hasTasks && tasksQ.status === 'error') return <div>Error: {(tasksQ.error as Error)?.message}</div>;

    return (
        <div className='flex flex-1 flex-col px-4'>
            <div className='flex justify-between items-center'>
                <p className='font-bold font-mono text-secondary-1'>inbox</p>
            </div>

            <AnimatePresence mode='wait' initial={false}>
                {hasTasks ? (
                    <motion.div
                        key='list'
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.16 }}
                    >
                        <InboxTaskList tasks={tasksInOrder} />
                    </motion.div>
                ) : (
                    <motion.div
                        key='empty'
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.16 }}
                    >
                        <EmptyInboxPlaceholder />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const EmptyInboxPlaceholder = () => {
    return (
        <div className='text-muted px-8 pt-4 pb-8'>
            <h2>Nothing here yet.</h2>
            <p>
                * Dump your tasks quickly using the{' '}
                <button
                    className='inline-block px-1 py-0.5 font-mono rounded-sm text-secondary-3 hover:bg-surface-1/50 cursor-pointer'
                    onClick={() => openCommandPalette()}
                >
                    command palette [C-k]
                </button>
                .
            </p>
            <p className='inline'>
                * Press{' '}
                <button
                    className='inline-block px-1 py-0.5 font-mono rounded-sm text-secondary-3 hover:bg-surface-1/50 cursor-pointer'
                    onClick={() => openCommandPalette('add ')}
                >
                    [A]
                </button>{' '}
                to immediately open it with &quot;add&quot; command.
            </p>
            <p>* These keyboard shortcuts work when no dialogs are open.</p>
        </div>
    );
};

export const InboxTaskList: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    const [hoveredId, setHoveredId] = React.useState<string | null>(null);
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const rafRef = React.useRef<number | null>(null);

    const today = todayLocalDate();
    const tomorrow = tomorrowLocalDate();

    const { mutate: scheduleToday } = useScheduleTaskFor(today);
    const { mutate: scheduleTomorrow } = useScheduleTaskFor(tomorrow);

    const updateHoverFromPoint = (clientX: number, clientY: number) => {
        const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
        const cardEl = el?.closest('[data-card-id]') as HTMLElement | null;
        const id = cardEl?.getAttribute('data-card-id') ?? null;
        setHoveredId(prev => (prev === id ? prev : id));
    };

    const scheduleUpdate = (e: React.PointerEvent) => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        const { clientX, clientY } = e;
        rafRef.current = requestAnimationFrame(() => updateHoverFromPoint(clientX, clientY));
    };

    React.useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

    React.useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const onMut = () => {
            const m = root.matches(':hover');
            if (!m) return;
            const rect = root.getBoundingClientRect();
            updateHoverFromPoint(rect.left + rect.width / 2, rect.top + 1);
        };
        const obs = new MutationObserver(onMut);
        obs.observe(root, { childList: true, subtree: true, attributes: true });
        return () => obs.disconnect();
    }, [tasks.length]);

    return (
        <motion.div
            className='flex flex-col gap-4 p-4 min-h-[25vh] max-h-[80vh] overflow-y-auto'
            transition={{ duration: 0.18 }}
            onPointerMove={scheduleUpdate}
            onPointerDown={scheduleUpdate}
            onPointerLeave={() => setHoveredId(null)}
        >
            <AnimatePresence mode='popLayout' initial={false}>
                {tasks.map(item => (
                    <motion.div
                        key={item.id}
                        layout='position'
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.6 }}
                    >
                        <InboxTaskCard
                            task={item}
                            selected={hoveredId === item.id}
                            onSchedulePrimary={() => scheduleToday(item)}
                            onScheduleSecondary={() => scheduleTomorrow(item)}
                            onScheduleCustom={() => console.log('custom')}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
};
