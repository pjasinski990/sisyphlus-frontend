import React, { ReactNode } from 'react';
import { EnergyLevel, Task } from '@/shared/feature/task/entity/task';
import { CalendarArrowUpIcon, FlameIcon, TimerIcon } from 'lucide-react';
import { Tooltip } from '@/shared/util/react/components/Tooltip';

export const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    return (
        <div
            className='stone-texture py-3 px-4 rounded-sm defined-shadow shrink-0'
            style={{ background:
                    `radial-gradient(circle at 30px 20px, transparent 0%, color-mix(in oklch, var(--color-${task.energy}-energy) 20%, transparent) 100%),
                    color-mix(in oklch, var(--color-surface-2) 70%, var(--color-${task.energy}-energy) 40%)`
            }}
        >
            <div className={'flex justify-between'}>
                <div className={'flex gap-2'}>
                    <Tooltip tooltip={`${task.energy} energy`}>
                        <InfoTile>
                            <FlameIcon className={`${getEnergyIconClass(task.energy)} w-5 h-5`} />
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
                <div className={'flex gap-2'}>
                    <div className={'flex items-center gap-2'}>
                        <CalendarArrowUpIcon className={'inline w-4 h-4 stroke-secondary-2'} />
                        <span className={'inline text-sm text-secondary-2 font-mono'}>today</span>
                    </div>
                </div>
            </div>
            <p className={'font-bold'}>{task.title}</p>
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
        'low': 'stroke-low-energy',
        'medium': 'stroke-medium-energy',
        'high': 'stroke-high-energy',
    };
    return colors[level];
}

