import { Theme } from '@/feature/theme/entity/theme';

export interface WatchSystemTheme {
    execute(onChange: (theme: Exclude<Theme, 'system'>) => void): () => void;
}
