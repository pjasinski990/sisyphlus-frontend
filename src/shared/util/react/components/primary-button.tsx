import React, { ButtonHTMLAttributes } from 'react';

export const PrimaryButton: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', ...rest }) => {
    const baseClasses = 'px-4 py-2 bg-accent text-accent-contrast font-semibold transition-all shadow-md cursor-pointer';
    const hoverClasses = 'hover:shadow-lg hover:-translate-y-[3px]';

    return (
        <button
            className={`${baseClasses} ${hoverClasses} ${className}`}
            {...rest}
        >
            {rest.children}
        </button>
    );
};
