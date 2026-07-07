import { getTranslations as getAstroTranslations } from 'astro-intl';
import type { Messages } from './types';

type TranslationHelper<T extends Record<string, unknown> = Record<string, unknown>> = ReturnType<typeof getAstroTranslations<T>>;

export function getTranslations<N extends keyof Messages>(namespace: N): TranslationHelper<Messages[N]>;
export function getTranslations<T extends Record<string, unknown> = Record<string, unknown>>(namespace: string): TranslationHelper<T>;
export function getTranslations<T extends Record<string, unknown> = Record<string, unknown>>(namespace: string) {
  return getAstroTranslations<T>(namespace);
}
