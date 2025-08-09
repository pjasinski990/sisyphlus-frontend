import React from 'react';

export const AuthFormContainer = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className='w-full min-h-screen flex items-center justify-center'>
        <div className='max-w-lg w-full space-y-8 py-8 px-12 bg-surface-2 rounded-md shadow-xl'>
            <h2 className='mt-6 text-center text-3xl font-bold'>{title}</h2>
            {children}
        </div>
    </div>
);

interface InputProps {
    id: string;
    label: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
}

const inputFieldClasses = 'block w-full px-3 py-2 border border-ink-50 rounded-sm shadow-sm placeholder-muted focus:outline-none focus:border-stone-60 focus:shadow-lg';

export const AuthFormInputField: React.FC<InputProps> = ({ id, label, type, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={id} className='block text-sm font-medium mb-2'>
            {label}
        </label>
        <input
            id={id}
            name={id}
            type={type}
            required
            value={value}
            onChange={onChange}
            className={inputFieldClasses}
            placeholder={placeholder}
        />
    </div>
);
