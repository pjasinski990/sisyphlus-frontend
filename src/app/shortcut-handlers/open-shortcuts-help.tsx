import { dialogController } from '@/shared/feature/dialog/infra/controllers/dialog-controller';
import React from 'react';
import { keyboardController } from '@/shared/feature/keyboard/infra/controllers/keyboard-controller';
import { ListedShortcut } from '@/shared/feature/keyboard/entity/listed-shortcut';

export async function openShortcutsHelp() {
    await dialogController.handleOpen({
        key: 'info',
        payload: {
            title: 'Keyboard shortcuts',
            children: <ShortcutsList />,
        },
        options: { modal: true, dismissible: true },
    });
}

const ShortcutsList: React.FC = () => {
    const mapping = keyboardController.handleListShortcutsByScope();

    return (
        <div className={'flex flex-col gap-6 my-8'}>
            {Object.entries(mapping).map(([scopeName, shortcuts]) =>
                <ShortcutGallery key={scopeName} scope={scopeName} shortcuts={shortcuts} />
            )}
        </div>
    );
};

const ShortcutGallery: React.FC<{ scope: string, shortcuts: ListedShortcut[] }> = ({ scope, shortcuts }) => {
    return (
        <div className={'bg-surface-2/50 rounded-md px-4 py-4'}>
            <p className={'font-semibold mt-0 mb-4 pb-4 border-b border-surface-1/50'}>{scope}</p>
            <div className={'flex flex-col gap-2'}>
                { shortcuts.map((shortcut, index) =>
                    <div key={index}>
                        <ShortcutCard shortcut={shortcut} />
                    </div>
                ) }
            </div>
        </div>
    );
};

const ShortcutCard: React.FC<{ shortcut: ListedShortcut }> = ({ shortcut }) => {
    return (
        <div className='flex items-center'>
            <KeyTile text={shortcut.combo} />
            <span className='ml-4'>{shortcut.description}</span>
            <span className='ml-auto inline-flex items-center h-6 px-2 text-muted lowercase border border-secondary rounded-md text-sm'>
                {shortcut.group}
            </span>
        </div>
    );
};

const KeyTile: React.FC<{ text: string }> = ({ text }) => {
    return (
        <div className='inline-flex content-center px-3 py-1 rounded-md border-r-5 border-b-5 border-surface-1 bg-secondary-1 text-sm'>
            {text.replace(/^char:/, '')}
        </div>
    );
};
