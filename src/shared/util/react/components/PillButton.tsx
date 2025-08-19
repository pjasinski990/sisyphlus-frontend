import React from 'react';
import { Tooltip } from '@/shared/util/react/components/Tooltip';

type PillButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    dense?: boolean;
    tooltip?: string;
};

export const PillButton: React.FC<PillButtonProps> = ({ className = '', dense = false, tooltip, ...props }) => {
    const pad = dense ? 'px-2 py-1.5' : 'px-4 py-3';
    const base = 'bg-surface-3 hover:bg-surface-hover transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed rounded-full';

    const btn = (
        <button
            {...props}
            className={`${base} ${pad} ${className}`}
            type={props.type ?? 'button'}
        />
    );

    return tooltip ? <Tooltip tooltip={tooltip}>{btn}</Tooltip> : btn;
};

type PillSegment = {
    content: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
    title?: string;
    type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
    className?: string;
    ariaLabel?: string;
};

interface TwoPartPillButtonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
    left: PillSegment;
    right: PillSegment;
    className?: string;
    dense?: boolean;
}

export const TwoPartPillButton: React.FC<TwoPartPillButtonProps> = ({
    left,
    right,
    className = '',
    dense = false,
    ...divProps
}) => {
    const pad = dense ? 'px-2 py-1.5' : 'px-4 py-3';
    const base = 'bg-surface-3 hover:bg-surface-hover transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed';
    return (
        <div
            role='group'
            className={`inline-flex items-stretch rounded-full ${className}`}
            {...divProps}
        >
            <Tooltip tooltip={left.title}>
                <button
                    type={left.type ?? 'button'}
                    onClick={left.onClick}
                    disabled={left.disabled}
                    aria-label={left.ariaLabel}
                    className={`rounded-l-full ${base} ${pad} ${left.className ?? ''}`}
                >
                    {left.content}
                </button>
            </Tooltip>

            <div aria-hidden='true' className='w-px bg-surface-4/60 self-stretch' />

            <Tooltip tooltip={right.title}>
                <button
                    type={right.type ?? 'button'}
                    onClick={right.onClick}
                    disabled={right.disabled}
                    aria-label={right.ariaLabel}
                    className={`rounded-r-full ${base} ${pad} ${right.className ?? ''}`}
                >
                    {right.content}
                </button>
            </Tooltip>
        </div>
    );
};
