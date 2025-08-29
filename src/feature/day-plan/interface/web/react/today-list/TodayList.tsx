import React, { useEffect } from 'react';
import { useDayPlanQuery } from '@/feature/day-plan/interface/web/react/use-day-plan';
import { useTasksByIdsQuery } from '@/shared/feature/task/interface/web/react/use-tasks-by-ids';
import type { Task } from '@/shared/feature/task/entity/task';
import { openInbox } from '@/feature/inbox/interface/web/react/Inbox';
import { todayLocalDate } from '@/shared/util/local-date-helper';
import { RowSkeleton } from '@/shared/util/react/components/RowSkeleton';
import { WavyText } from '@/shared/util/react/components/WavyText';
import { DayPlanTaskCard } from '@/feature/day-plan/interface/web/react/today-list/DayPlanTaskCard';
import { ScheduleBlockDesc } from '@/feature/day-plan/entity/schedule-block-description';
import { openCommandPalette } from '@/app-init/shortcut-handlers/open-command-pallete';
import {
    commandPaletteController
} from '@/shared/feature/command-palette/interface/controller/command-palette-controller';
import { z } from 'zod';
import { Command } from '@/shared/feature/command-palette/entity/command';
import { smartTimeOfDayParser } from '@/shared/feature/command-palette/infra/parsing/smart-time-of-day';
import { useAddBlockToDayPlanMutation } from '@/feature/day-plan/interface/web/react/use-add-timeblock-mutation';

export const TodayList: React.FC = () => {
    const today = todayLocalDate();

    const planQ = useDayPlanQuery(today);

    const ids = planQ.data?.entries.map(e => e.taskId) ?? [];
    const tasksEnabled = planQ.status === 'success' && ids.length > 0;

    const tasksQ = useTasksByIdsQuery(ids, { enabled: tasksEnabled });

    const isInitialPlanLoading = planQ.status === 'pending' && !planQ.data;
    if (isInitialPlanLoading) {
        return (
            <div className='flex flex-1 flex-col bg-surface-2 rounded-xl defined-shadow my-8'>
                <div className='border-b border-surface-1/50 px-4 py-2'>Plan for <span className='font-mono text-secondary-2'>today</span></div>
                <div className='flex flex-col gap-4 p-4'>
                    <RowSkeleton />
                    <RowSkeleton />
                    <RowSkeleton />
                </div>
            </div>
        );
    }

    if (planQ.status === 'error') {
        return <div className='text-danger p-4'>Error: {(planQ.error as Error)?.message}</div>;
    }

    const taskById = (tasksQ.data ?? new Map<string, Task>());

    return (
        <div className='flex flex-1 flex-col bg-surface-2 rounded-xl defined-shadow my-8 min-h-0'>
            <TopFetchingBar active={planQ.isFetching || tasksQ.isFetching} />
            <div className='border-b border-surface-1/50 px-4 py-2'>
                Plan for <span className='font-mono text-secondary-2'>today</span>
            </div>
            <div className='flex flex-col gap-4 p-4 overflow-auto'>
                {planQ.data?.entries.length === 0 && <EmptyPlanPlaceholder />}

                {planQ.data?.entries.map(entry => {
                    const task = taskById.get(entry.taskId);

                    if (task) {
                        return <DayPlanTaskCard
                            key={entry.id} task={task}
                            onBlockPrimary={() => {
                                const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                                const callerArgs = {
                                    taskId: task.id,
                                    startLocalDate: todayLocalDate(),
                                    timezone: zone,
                                };
                                const callContext = {
                                    scope: 'timeblock',
                                    callerArgs,
                                };
                                void openCommandPalette('block ', callContext);
                            }}
                        />;
                    }

                    if (tasksEnabled && tasksQ.status === 'pending') {
                        return <RowSkeleton key={entry.id} />;
                    }

                    if (tasksQ.isFetching) {
                        return <RowSkeleton key={entry.id} />;
                    }

                    return <div key={entry.id} className='text-muted italic'>Task unavailable</div>;
                })}
            </div>
        </div>
    );
};

const TopFetchingBar: React.FC<{ active: boolean }> = ({ active }) => (
    <div
        className={ `h-0.5 w-full overflow-hidden rounded bg-surface-1/60 transition-opacity ${active ? 'opacity-100' : 'opacity-0'}` }
        aria-hidden='true'
    >
        <div className='h-full w-1/3 animate-[topbar_1.2s_ease-in-out_infinite]' />
        <style>{`@keyframes topbar {
                      0% { transform: translateX(-120%); }
                      50% { transform: translateX(60%); }
                      100% { transform: translateX(120%); }
                  }`}
        </style>
    </div>
);

const EmptyPlanPlaceholder: React.FC = () => {
    return (
        <div className='flex flex-col justify-center text-center'>
            <h2 className='text-muted'>No tasks planned yet.</h2>
            <p className='inline-block text-muted text-sm'>
                Select from tasks added to your
                <button
                    className='inline-block px-1 py-0.5 font-mono rounded-sm text-secondary-1 hover:bg-surface-1/50 cursor-pointer'
                    onClick={openInbox}
                >
                    <WavyText byLetter={true} amp={'0.05em'} stagger={'0.1s'} shakeMin={'0.0'} shakeMax={'0.0'} text={'inbox [I]'} />
                </button>
            </p>
        </div>
    );
};

const ScheduleTimeblockParsedSchema = z.object({
    startLocalTime: z.string().min(1),
    duration: z.string().min(1),
});
const ScheduleTimeblockArgsSchema = z.object({
    taskId: z.string().min(1),
    timezone: z.string().min(1),
    startLocalDate: z.string().min(1),
});
const ScheduleTimeblockCommandSchema = z.intersection(
    ScheduleTimeblockParsedSchema,
    ScheduleTimeblockArgsSchema
);

type ScheduleTimeblockParsed = z.infer<typeof ScheduleTimeblockParsedSchema>;
type ScheduleTimeblockAll = z.infer<typeof ScheduleTimeblockCommandSchema>;


export const TimeblockCommandPaletteEntries: React.FC = () => {
    const { mutateAsync: addBlock } = useAddBlockToDayPlanMutation(todayLocalDate());

    useEffect(() => {
        const id = 'timeblock.schedule';
        const scheduleBlockCommand: Command<ScheduleTimeblockParsed, ScheduleTimeblockAll> = {
            id,
            scope: 'timeblock',
            title: 'Schedule Time Block',
            subtitle: 'Add a time block for a task',
            group: 'Timeblocks',
            keywords: ['schedule', 'plan', 'block'],
            aliases: ['block'],
            syntax: {
                positionals: [
                    { name: 'natural', schema: z.string(), rest: true, hint: 'e.g. 12am 90min, 8:30 1h, noon half hour' },
                ],
            },
            input: {
                parser: smartTimeOfDayParser,
                schema: ScheduleTimeblockCommandSchema,
                placeholder: 'e.g. 12am 90min',
            },
            run: async (opts) => {
                const v = ScheduleTimeblockCommandSchema.parse(opts);
                const desc: ScheduleBlockDesc = {
                    taskId: v.taskId,
                    timezone: v.timezone,
                    duration: v.duration,
                    startLocalDate: v.startLocalDate,
                    startLocalTime: v.startLocalTime,
                };
                try {
                    addBlock(desc);
                } catch (err: unknown) {
                    // TODO toast
                    console.error(err);
                }
            },
        };
        commandPaletteController.handleRegisterCommand(scheduleBlockCommand);
    }, [addBlock]);

    return null;
};
