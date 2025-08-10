import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthActions } from '@/shared/feature/auth/interface/web/react/auth/hook/useAuthActions';
import { useAuth } from '@/shared/feature/auth/interface/web/react/auth/hook/useAuth';
import { PrimaryButton } from '@/shared/feature/utils/components/primary-button';
import { buildRoute } from './routePaths';
import { AuthFormContainer, AuthFormInputField } from '@/shared/feature/auth/interface/web/react/component/AuthForm';

export const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validationError, setValidationError] = useState('');
    const { register } = useAuthActions();
    const authState = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');

        if (password !== confirmPassword) {
            setValidationError('Passwords do not match');
            return;
        }

        register(email, password);
    };

    const submitLabel = authState.status === 'loading' ? 'Creating account...' : 'Create account';
    return (
        <AuthFormContainer title='Create your account'>
            <form className='space-y-8' onSubmit={handleSubmit}>
                <div className='space-y-6'>
                    <AuthFormInputField
                        id='email'
                        label='Email address'
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='Enter your email'
                    />
                    <AuthFormInputField
                        id='password'
                        label='Password'
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Enter your password'
                    />
                    <AuthFormInputField
                        id='confirmPassword'
                        label='Confirm Password'
                        type='password'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder='Confirm your password'
                    />
                </div>
                {(validationError || authState.status === 'error') && (
                    <div className='text-danger text-sm text-center'>{validationError || (authState.status === 'error' ? authState.error : '') }</div>
                )}
                <div className='pt-2'>
                    <PrimaryButton
                        type='submit'
                        disabled={authState.status === 'loading'}
                        className='w-full flex justify-center'
                    >
                        {submitLabel}
                    </PrimaryButton>
                    <div className='mt-2 text-center mb-8'>
                        <span className='text-sm'>
                            Already have an account?{' '}
                            <Link to={buildRoute.login()} className='text-accent font-semibold hover:underline'>
                                Sign in
                            </Link>
                        </span>
                    </div>
                </div>
            </form>
        </AuthFormContainer>
    );
};
