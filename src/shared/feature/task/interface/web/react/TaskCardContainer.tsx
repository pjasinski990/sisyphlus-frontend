import React, { ReactNode } from 'react';
import { EnergyLevel, Task } from '@/shared/feature/task/entity/task';
import { FlameIcon, TimerIcon } from 'lucide-react';
import { Tooltip } from '@/shared/util/react/components/Tooltip';
import { Wavy } from '@/shared/util/react/components/Wavy';
import { Random } from '@/shared/util/random';
import { AnimatePresence, motion } from 'framer-motion';
import { MarkdownRenderer } from '@/shared/util/react/components/MarkdownRenderer';

export const TaskCardContainer: React.FC<{
    task: Task,
    isSelected: boolean,
    isMuted?: boolean,
    onSelectedMenu?: ReactNode,
    topBarExtra?: ReactNode,
    bottomBarExtra?: ReactNode,
} & React.HTMLAttributes<HTMLDivElement>> = ({ task, isSelected, isMuted, topBarExtra, onSelectedMenu, bottomBarExtra, ...rest }) => {
    const mutedBackgroundStyle = `color-mix(in oklch, var(--color-surface-2) 70%, var(--color-${task.energy}-energy) 3%)`;
    const activeBackgroundStyle = `radial-gradient(circle at 20px 20px, transparent 0%, color-mix(in oklch, var(--color-${task.energy}-energy) 20%, transparent) 100%),
                    color-mix(in oklch, var(--color-surface-2) 70%, var(--color-${task.energy}-energy) 15%)`;
    return (
        <div
            className='stone-texture py-3 px-4 rounded-sm defined-shadow shrink-0'
            style={{ background: isMuted ? mutedBackgroundStyle : activeBackgroundStyle }}
            {...rest}
        >
            <div className={'flex justify-between'}>
                <div>
                    <TopInfoRow task={task} extra={topBarExtra} isMuted={isMuted} />
                    <p className={'font-bold'}>
                        {task.title}
                    </p>
                    <MarkdownRenderer content={task.description} />
                    <BottomInfoRow task={task} extra={bottomBarExtra} />
                </div>
                <OnSelectedColumn selected={isSelected} content={onSelectedMenu} />
            </div>
        </div>
    );
};

const TopInfoRow: React.FC<{ task: Task, extra: React.ReactNode, isMuted?: boolean }> = ({ task, extra, isMuted }) => {
    const extraFlat = React.Children.toArray(extra);

    const randomPeriod = Random.int(1.1, 2.2);
    const flameIconWavePeriod = `${randomPeriod}s`;

    return (
        <div className={'flex gap-2'}>
            <Tooltip tooltip={`${task.energy} energy`}>
                <InfoTile>
                    <div className={'bg-surface-1/50 px-1 py-0.5 rounded-full'}>
                        {isMuted ? <MutedEnergyIcon lvl={task.energy} /> :
                            <>
                                {task.energy === 'low' && <LowEnergyIcon wavePeriod={flameIconWavePeriod} />}
                                {task.energy === 'medium' && <MediumEnergyIcon wavePeriod={flameIconWavePeriod} />}
                                {task.energy === 'high' && <HighEnergyIcon wavePeriod={flameIconWavePeriod} />}
                            </>
                        }

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
            {...extraFlat}
        </div>
    );
};

const BottomInfoRow: React.FC<{ task: Task, extra: ReactNode }> = ({ task, extra }) => {
    const extraFlat = React.Children.toArray(extra);

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
            {...extraFlat}
        </div>
    );
};

const OnSelectedColumn: React.FC<{ selected: boolean, content: ReactNode }> = ({ selected, content }) => {
    return (
        <AnimatePresence initial={false}>
            {selected && (
                <motion.div
                    key='sched'
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 4 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className='transform-gpu will-change-[opacity,transform]'
                >
                    {content}
                </motion.div>
            )}
        </AnimatePresence>
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

export const MutedEnergyIcon: React.FC<{ lvl: EnergyLevel }> = ({ lvl }) => {
    const cls = getEnergyIconClass(lvl);
    return (
        <FlameIcon className={`${cls} opacity-50 w-5 h-5 pt-[2px] mb-1`} />
    );
};

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
