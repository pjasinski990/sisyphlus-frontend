import React from 'react';


export const HomePage: React.FC = () => {
    return (
        <div className={'flex flex-1'}>
            <HomeView />
        </div>
    );
};

const HomeView: React.FC = () => {
    return (
        <div className={'flex flex-1 items-center justify-center'}>
            <h1>
                Welcome to your new home.
            </h1>
        </div>
    );
};
