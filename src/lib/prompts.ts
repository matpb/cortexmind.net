// Agent-facing setup prompt, one per locale. Download links are discovered
// at run time from /downloads.json so the prompt never carries a version.
import en from './prompts/install.en.md?raw';
import fr from './prompts/install.fr.md?raw';

export const installPrompts: Record<'en' | 'fr', string> = { en, fr };

export function installPromptFor(locale: 'en' | 'fr'): string {
  return installPrompts[locale] ?? installPrompts.en;
}
