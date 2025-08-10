import React from 'react';
import { useLocation } from 'react-router-dom';
import { Tooltip } from './Tooltip';
import { BoltIcon, LogOutIcon } from 'lucide-react';
import { useAuth } from '@/shared/feature/auth/interface/web/react/auth/hook/useAuth';
import { useAuthActions } from '@/shared/feature/auth/interface/web/react/auth/hook/useAuthActions';
import { useAppNavigation } from '@/shared/feature/util/react/hook/useNavigation';
import { ThemeButton } from '@/feature/theme/interface/react/component/ThemeButton';

export const Header: React.FC<{ className: string }> = ({ className }) => {
    const location = useLocation();
    const { goToHome, goToLogin, goToRegister } = useAppNavigation();
    const authState = useAuth();
    const { logout } = useAuthActions();


    const isActivePath = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className={className}>
            <header className='w-full min-w-0 bg-surface-2 paper-texture'>
                <div className={'flex justify-between items-center shadow-md min-h-20'}>
                    <div className='flex items-center'>
                        <nav className='flex items-center'>
                            <HomeButton
                                onClick={goToHome}
                                isActive={isActivePath('/')}
                            />
                        </nav>
                    </div>

                    <div className={'flex gap-12 mr-8 items-center'}>
                        {authState.status === 'authenticated' && authState.user ? (
                            <>
                                <span className='text-sm'>
                                    {authState.user.email}
                                </span>
                                <Tooltip tooltip={'Logout'}>
                                    <button onClick={logout}>
                                        <LogOutIcon className={'w-6 h-6 hover:stroke-accent transition-colors cursor-pointer'} />
                                    </button>
                                </Tooltip>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={goToLogin}
                                    className='hover:text-accent transition-colors cursor-pointer text-sm uppercase font-bold p-2'
                                >
                                    Login
                                </button>
                                <button
                                    onClick={goToRegister}
                                    className='hover:text-accent transition-colors cursor-pointer text-sm uppercase font-bold p-2'
                                >
                                    Register
                                </button>
                            </>
                        )}
                        <ThemeButton />
                        <Tooltip tooltip={'Settings'}>
                            <button>
                                <BoltIcon className={'w-6 h-6 hover:stroke-accent transition-all cursor-pointer hover:rotate-45'} />
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </header>
        </div>
    );
};

interface NavigationButtonProps {
    onClick: () => void;
    isActive: boolean;
}

const HomeButton: React.FC<NavigationButtonProps> = ({
    onClick,
    isActive,
}) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center mx-4 transition-colors duration-200 focus:outline-none hover:bg-surface-hover cursor-pointer ${ isActive ? 'text-accent': '' }`}
        >
            <div className='mx-4'>
                <img src='/favicon.svg' alt='Favicon' width={40} height={40} />
            </div>
            <h3 className={'py-2 pr-8 tracking-wider text-nowrap uppercase brand-gradient'}>dash.</h3>
        </button>
    );
};
