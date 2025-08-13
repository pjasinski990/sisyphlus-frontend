import { dialogController } from '@/shared/feature/dialog/infra/controllers/dialog-controller';
import React from 'react';
import { keyboardController } from '@/shared/feature/keyboard/infra/controllers/keyboard-controller';
import { ListedShortcut } from '@/shared/feature/keyboard/entity/listed-shortcut';

export async function openShortcutsHelp() {
    await dialogController.handleOpen({
        key: 'info',
        payload: {
            title: 'Shortcuts',
            children: <ShortcutsList />,
        },
        options: { modal: true, dismissible: true },
    });
}

const ShortcutsList: React.FC = () => {
    const mapping = keyboardController.handleListShortcutsByScope();

    return (
        <div>
            {Object.entries(mapping).map(([scopeName, shortcuts]) =>
                <ShortcutGallery key={scopeName} scope={scopeName} shortcuts={shortcuts} />
            )}
        </div>
    );
};

const ShortcutGallery: React.FC<{ scope: string, shortcuts: ListedShortcut[] }> = ({ scope, shortcuts }) => {
    return (
        <div className={'bg-surface-2/50 rounded-md px-4 py-4'}>
            <p className={'text-accent font-semibold text-xl mt-0 mb-4'}>{scope}</p>
            <div className={'flex flex-col gap-2'}>
                { shortcuts.map((shortcut) =>
                    <div key={shortcut.registrationId}>
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
            <span className='ml-auto inline-flex items-center h-6 px-2 text-muted lowercase border border-secondary rounded-md'>
                {shortcut.group}
            </span>
        </div>
    );
};

const KeyTile: React.FC<{ text: string }> = ({ text }) => {
    return (
        <div className='inline-flex content-center px-3 py-1 rounded-md border-r-5 border-b-5 border-surface-1 bg-secondary-1'>
            {text.replace(/^char:/, '')}
        </div>
    );
};
