export type DialogVariant = 'centered' | 'anchored';

export interface BaseDialogOptions {
    variant: DialogVariant;
    modal: boolean;
    dismissible: boolean;
    zIndex: number;
}

export interface AnchoredDialogOptions extends BaseDialogOptions {
    variant: 'anchored';
    anchor: { getRect: () => DOMRect | null };
    side: 'top' | 'bottom' | 'auto';
    align: 'start' | 'center' | 'end';
    offset: number;
    matchWidth: boolean;
}

export interface CenteredDialogOptions extends BaseDialogOptions {
    variant: 'centered';
}

export type DialogOptions = AnchoredDialogOptions | CenteredDialogOptions;

export interface AnchoredDialogInstance {
    id: string;
    key: string;
    payload: unknown;
    dismissible: boolean;
    options: AnchoredDialogOptions;
}

export interface CenteredDialogInstance {
    id: string;
    key: string;
    payload: unknown;
    dismissible: boolean;
    options: CenteredDialogOptions;
}

export type DialogInstance = AnchoredDialogInstance | CenteredDialogInstance;
