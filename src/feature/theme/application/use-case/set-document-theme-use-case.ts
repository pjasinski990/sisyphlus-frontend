import { SetDocumentTheme } from '@/feature/theme/application/port/in/set-document-theme';
import { Theme } from '@/feature/theme/entity/theme';

export class SetDocumentThemeUseCase implements SetDocumentTheme {
    execute(next: Theme): void {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const effective = next === 'system' ? (prefersDark ? 'dark' : 'light') : next;

        const root = document.documentElement;
        root.classList.add('theme-switching');
        root.classList.toggle('dark', effective === 'dark');
        root.setAttribute('data-theme', effective);
        window.setTimeout(() => root.classList.remove('theme-switching'), 0);

        localStorage.setItem('theme', next);
    }
}
