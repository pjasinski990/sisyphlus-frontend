export type DialogInstance = {
    id: string;
    key: string;
    payload: unknown;
    modal: boolean;
    dismissible: boolean;
    zIndex?: number;
};
