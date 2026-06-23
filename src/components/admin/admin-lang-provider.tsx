'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import {
  adminDictionaries,
  type AdminDictionary,
  type AdminLocale,
} from '@/lib/i18n/admin-dictionaries'

interface AdminLangContextValue {
  t: AdminDictionary
  lang: AdminLocale
  setLang: (lang: AdminLocale) => void
}

const AdminLangContext = createContext<AdminLangContextValue | null>(null)

export function AdminLangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AdminLocale>('en')

  useEffect(() => {
    const saved = localStorage.getItem('admin_lang') as AdminLocale | null
    if (saved && saved in adminDictionaries) {
      setLangState(saved)
    }
  }, [])

  const setLang = (newLang: AdminLocale) => {
    setLangState(newLang)
    localStorage.setItem('admin_lang', newLang)
  }

  return (
    <AdminLangContext.Provider
      value={{ t: adminDictionaries[lang], lang, setLang }}
    >
      {children}
    </AdminLangContext.Provider>
  )
}

export function useAdminLang() {
  const ctx = useContext(AdminLangContext)
  if (!ctx) throw new Error('useAdminLang must be used within AdminLangProvider')
  return ctx
}
