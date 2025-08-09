import React, { ButtonHTMLAttributes } from 'react';

export const PrimaryButton: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', ...rest }) => {
    const baseClasses = 'px-4 py-2 button font-semibold shadow-md transition-all cursor-pointer';
    const hoverClasses = 'hover:shadow-lg hover:-translate-y-[2px]';

    return (
        <button
            className={`${baseClasses} ${hoverClasses} ${className}`}
            {...rest}
        >
            {rest.children}
        </button>
    );
};
