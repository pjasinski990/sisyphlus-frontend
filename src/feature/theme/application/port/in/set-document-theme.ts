import { Theme } from '@/feature/theme/entity/theme';

export interface SetDocumentTheme {
    execute(theme: Theme): void;
}
