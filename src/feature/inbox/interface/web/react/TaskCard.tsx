import React, { ReactNode } from 'react';
import { EnergyLevel, Task } from '@/shared/feature/task/entity/task';
import { FlameIcon, TimerIcon } from 'lucide-react';
import { Tooltip } from '@/shared/util/react/components/Tooltip';

export const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    return (
        <div className={'bg-secondary-1/90 border-b-4 border-secondary-2/20 stone-texture py-2 px-4 rounded-sm defined-shadow'}>
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
            <p className={'font-bold'}>{task.title}</p>
            <div className={'flex flex-wrap gap-3 mt-8'}>
                { task.context &&
                    <Tooltip tooltip={'context'}>
                        <InfoTile className={'bg-accent/30'}>
                            <span className={'text-sm leading-none'}>@</span>
                            <span className={'text-sm leading-none'}>{task.context}</span>
                        </InfoTile>
                    </Tooltip>
                }
                { task.tags.map(t => {
                    return (
                        <Tooltip tooltip={'tag'} key={t}>
                            <InfoTile className={'bg-secondary-3 text-accent-contrast'}>
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

const InfoTile: React.FC<{ className?: string, children: ReactNode }> = ({ className, children }) => {
    return (
        <div className={`flex items-center rounded-md ${className}`}>
            <div className={'flex p-1'}>
                {children}
            </div>
        </div>
    );
};

function getEnergyIconClass(level: EnergyLevel) {
    const colors = {
        'low': 'stroke-low-energy',
        'medium': 'stroke-medium-energy',
        'high': 'stroke-high-energy',
    };
    return colors[level];
}

