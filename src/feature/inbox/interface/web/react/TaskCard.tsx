import React, { ReactNode } from 'react';
import { EnergyLevel, Task } from '@/shared/feature/task/entity/task';
import { CalendarArrowUpIcon, CalendarClockIcon, CalendarFoldIcon, FlameIcon, TimerIcon } from 'lucide-react';
import { Tooltip } from '@/shared/util/react/components/Tooltip';
import { Wavy } from '@/shared/util/react/components/Wavy';
import { Random } from '@/shared/util/random';
import { AnimatePresence, motion } from 'framer-motion';

export const TaskCard: React.FC<{
    task: Task,
    selected?: boolean,
    onSchedulePrimary?: () => void,
    onScheduleSecondary?: () => void
    onScheduleCustom?: () => void }
> = ({ task, selected, onSchedulePrimary, onScheduleSecondary, onScheduleCustom }) => {
    const [hover, setHover] = React.useState(false);
    const showScheduling = selected || hover;

    return (
        <div
            className='stone-texture py-3 px-4 rounded-sm defined-shadow shrink-0'
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{ background:
                    `radial-gradient(circle at 30px 20px, transparent 0%, color-mix(in oklch, var(--color-${task.energy}-energy) 20%, transparent) 100%),
                    color-mix(in oklch, var(--color-surface-2) 70%, var(--color-${task.energy}-energy) 40%)`
            }}
        >
            <div className={'flex justify-between'}>
                <div>
                    <TopInfoRow task={task} />
                    <p className={'font-bold'}>{task.title}</p>
                    <BottomInfoRow task={task} />
                </div>
                <AnimatePresence initial={false}>
                    {showScheduling && (
                        <motion.div
                            key='sched'
                            initial={{ opacity: 0, x: 4 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 4 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className='transform-gpu will-change-[opacity,transform]'
                        >
                            <SchedulingOptions
                                onSchedulePrimary={onSchedulePrimary}
                                onScheduleSecondary={onScheduleSecondary}
                                onScheduleCustom={onScheduleCustom}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const TopInfoRow: React.FC<{ task: Task}> = ({ task }) => {
    const randomPeriod = Random.int(1.1, 1.6);
    const flameIconWavePeriod = `${randomPeriod}s`;

    return (
        <div className={'flex gap-2'}>
            <Tooltip tooltip={`${task.energy} energy`}>
                <InfoTile>
                    <div className={'bg-surface-1/50 px-1 py-0.5 rounded-full'}>
                        {task.energy === 'low' && <LowEnergyIcon wavePeriod={flameIconWavePeriod} />}
                        {task.energy === 'medium' && <MediumEnergyIcon wavePeriod={flameIconWavePeriod} />}
                        {task.energy === 'high' && <HighEnergyIcon wavePeriod={flameIconWavePeriod} />}
                    </div>
                </InfoTile>
            </Tooltip>
            { task.estimatedMin &&
                <Tooltip tooltip={`estimated for ${task.estimatedMin}min`}>
                    <InfoTile>
                        <TimerIcon className={'w-5 h-5'}/>
                        <span className={'text-lg leading-none self-center'}>{task.estimatedMin}</span>
                    </InfoTile>
                </Tooltip>
            }
        </div>
    );
};

const BottomInfoRow: React.FC<{ task: Task}> = ({ task }) => {
    return (
        <div className={'flex flex-wrap gap-3 mt-8'}>
            { task.context &&
                <Tooltip tooltip={'context'}>
                    <InfoTile className={'bg-secondary-1 px-1 py-0.5 text-text-reversed'}>
                        <span className={'text-sm leading-none'}>@</span>
                        <span className={'text-sm leading-none'}>{task.context}</span>
                    </InfoTile>
                </Tooltip>
            }
            { task.tags.map(t => {
                return (
                    <Tooltip tooltip={'tag'} key={t}>
                        <InfoTile className={'bg-secondary-1 px-1 py-0.5 text-text-reversed'}>
                            <span className={'text-sm leading-none'}>#</span>
                            <span className={'text-sm leading-none'}>{t}</span>
                        </InfoTile>
                    </Tooltip>
                );
            })}
        </div>
    );
};

const SchedulingOptions: React.FC<{
    onSchedulePrimary?: () => void,
    onScheduleSecondary?: () => void
    onScheduleCustom?: () => void
}> = ({ onSchedulePrimary, onScheduleSecondary, onScheduleCustom }) => {
    return (
        <div className={'flex flex-col gap-2'}>
            { onSchedulePrimary &&
                <button
                    className={'flex items-center gap-2 px-1 py-0.5 hover:bg-surface-1/50 cursor-pointer'}
                    onClick={onSchedulePrimary}
                >
                    <CalendarArrowUpIcon className={'inline w-4 h-4 stroke-secondary-2'} />
                    <span className={'inline text-sm text-secondary-2 font-mono leading-none'}>[t]oday</span>
                </button>
            }
            { onScheduleSecondary &&
                <button
                    className={'flex items-center gap-2 px-1 py-0.5 hover:bg-surface-1/50 cursor-pointer'}
                    onClick={onScheduleSecondary}
                >
                    <CalendarFoldIcon className={'inline w-4 h-4 stroke-secondary-2'} />
                    <span className={'inline text-sm text-secondary-2 font-mono leading-none'}>[T]mrrw</span>
                </button>
            }
            { onScheduleCustom &&
                <button
                    className={'flex items-center gap-2 px-1 py-0.5 hover:bg-surface-1/50 cursor-pointer'}
                    onClick={onScheduleCustom}
                >
                    <CalendarClockIcon className={'inline w-4 h-4 stroke-secondary-2'} />
                    <span className={'inline text-sm text-secondary-2 font-mono leading-none'}>[o]ther</span>
                </button>
            }
        </div>
    );
};

export const InfoTile = React.forwardRef<HTMLDivElement, { className?: string, children: ReactNode }>(
    ({ className, children, ...rest }, ref) => {
        return (
            <div ref={ref} className={`flex items-center rounded-md ${className ?? ''}`} {...rest}>
                <div className='flex'>{children}</div>
            </div>
        );
    }
);
InfoTile.displayName = 'InfoTile';

function getEnergyIconClass(level: EnergyLevel) {
    const colors = {
        'low': 'stroke-low-energy fill-low-energy',
        'medium': 'stroke-medium-energy fill-medium-energy',
        'high': 'stroke-high-energy fill-high-energy',
    };
    return colors[level];
}

export const LowEnergyIcon: React.FC<{ wavePeriod: string}> = ({ wavePeriod }) => (
    <Wavy amp={'0.05rem'} shakeMin={'0.05rem'} period={wavePeriod } shakeMax={'0.15rem'}>
        <FlameIcon className={`${getEnergyIconClass('low')} w-5 h-5 pt-[2px] flame-flicker`} />
    </Wavy>
);

export const MediumEnergyIcon: React.FC<{ wavePeriod: string}> = ({ wavePeriod }) => (
    <Wavy amp={'0.05rem'} shakeMin={'0.15rem'} period={wavePeriod} shakeMax={'0.25rem'}>
        <FlameIcon className={`${getEnergyIconClass('medium')} w-5 h-5 pt-[2px] flame-flicker`} />
    </Wavy>
);

export const HighEnergyIcon: React.FC<{ wavePeriod: string}> = ({ wavePeriod }) => (
    <Wavy amp={'0.05rem'} shakeMin={'0.25rem'} period={wavePeriod} shakeMax={'0.35rem'}>
        <FlameIcon className={`${getEnergyIconClass('high')} w-5 h-5 pt-[2px] flame-flicker`} />
    </Wavy>
);
