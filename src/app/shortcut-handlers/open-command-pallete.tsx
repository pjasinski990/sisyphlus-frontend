import { dialogController } from '@/shared/feature/dialog/infra/controllers/dialog-controller';
import React from 'react';

export async function openCommandPalette() {
    const res = await dialogController.handleOpen({
        key: 'custom',
        payload: {
            children: <CommandPalette />,
        },
        options: { modal: true, dismissible: true },
    });
    console.log(res);
}

const CommandPalette: React.FC = () => {
    return (
        <div className={'flex flex-1 flex-col width-full border border-surface-1/50 px-4 py-2 rounded-lg'}>
            <input className={''} type='text' placeholder='Command...'/>
        </div>
    );
};
