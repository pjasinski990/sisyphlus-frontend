import { WatchSystemTheme } from '@/feature/theme/application/port/in/watch-system-theme';
import { Theme } from '@/feature/theme/entity/theme';

export class WatchSystemThemeUseCase implements WatchSystemTheme {
    execute(
        onChange: (theme: Exclude<Theme, 'system'>) => void,
    ): () => void {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const emit = () => onChange(mql.matches ? 'dark' : 'light');

        const shouldReact = () => {
            try {
                return localStorage.getItem('theme') === 'system';
            } catch {
                return true;
            }
        };

        const handler = () => {
            if (shouldReact()) emit();
        };
        if (shouldReact()) emit();

        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }
}
