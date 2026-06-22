export const locales = ['en', 'tr', 'ru', 'zh'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  tr: 'Türkçe',
  ru: 'Русский',
  zh: '中文',
}

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  tr: '🇹🇷',
  ru: '🇷🇺',
  zh: '🇨🇳',
}

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}
