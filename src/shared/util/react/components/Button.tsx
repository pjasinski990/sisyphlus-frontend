import * as React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
};

type VarStyle = React.CSSProperties & {
    ['--btn-bg']?: string;
    ['--btn-fg']?: string;
};

const base =
    'btn btn-solid';

export const ButtonPrimary: React.FC<ButtonProps> = ({ className = '', style, ...props }) => {
    const vars: VarStyle = {
        '--btn-bg': 'var(--color-accent)',
        '--btn-fg': 'var(--color-accent-contrast)',
        ...(style as VarStyle),
    };
    return <button {...props} className={`${base} ${className}`} style={vars} />;
};

export const ButtonSecondary: React.FC<ButtonProps> = ({ className = '', style, ...props }) => {
    const vars: VarStyle = {
        '--btn-bg': 'var(--color-secondary-3)',
        '--btn-fg': 'var(--on-secondary-3)',
        ...(style as VarStyle),
    };
    return <button {...props} className={`${base} ${className}`} style={vars} />;
};

export const ButtonDanger: React.FC<ButtonProps> = ({ className = '', style, ...props }) => {
    const vars: VarStyle = {
        '--btn-bg': 'var(--color-danger)',
        '--btn-fg': 'var(--color-ink-10)',
        ...(style as VarStyle),
    };
    return <button {...props} className={`${base} ${className}`} style={vars} />;
};

export const ButtonSuccess: React.FC<ButtonProps> = ({ className = '', style, ...props }) => {
    const vars: VarStyle = {
        '--btn-bg': 'var(--color-success)',
        '--btn-fg': 'var(--color-ink-10)',
        ...(style as VarStyle),
    };
    return <button {...props} className={`${base} ${className}`} style={vars} />;
};
