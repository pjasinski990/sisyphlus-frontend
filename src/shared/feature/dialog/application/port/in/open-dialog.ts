export type OpenDialogCommand = {
    key: string;
    payload?: unknown;
    options?: {
        modal?: boolean;
        dismissible?: boolean;
        zIndex?: number;
    };
};

export interface OpenDialog {
    execute<T = unknown>(cmd: OpenDialogCommand): Promise<T | undefined>;
}
