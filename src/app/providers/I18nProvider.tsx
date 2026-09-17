import i18n from 'i18next'
import { initReactI18next, I18nextProvider } from 'react-i18next'
import { useEffect } from 'react'
import enCommon from '@/locales/en/common.json'
import esCommon from '@/locales/es/common.json'
import { useAppStore } from '@/app/store/app-store'

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      en: { common: enCommon },
      es: { common: esCommon },
    },
    lng: 'es',
    fallbackLng: 'es',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    returnNull: false,
  })
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useAppStore((state) => state.locale)

  useEffect(() => {
    void i18n.changeLanguage(locale)
  }, [locale])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
