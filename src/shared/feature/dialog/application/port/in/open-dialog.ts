import { DialogOptions } from '@/shared/feature/dialog/entity/dialog-instance';

export type OpenDialogCommand = {
    key: string;
    payload?: unknown;
    options?: DialogOptions;
};

export interface OpenDialog {
    execute<T = unknown>(cmd: OpenDialogCommand): Promise<T | undefined>;
}
