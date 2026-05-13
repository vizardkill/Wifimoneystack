import type { JSX } from 'react'

import type { UseFormRegisterReturn } from 'react-hook-form'

interface LanguageOption {
  code: string
  label: string
  is_active: boolean
}

interface LanguageMultiSelectProps {
  languageCodesRegister: UseFormRegisterReturn<'language_codes'>
  options: LanguageOption[]
  selectedCodes: string[]
  errorMessage?: string
}

export function LanguageMultiSelect({ languageCodesRegister, options, selectedCodes, errorMessage }: LanguageMultiSelectProps): JSX.Element {
  const selectedSet = new Set(selectedCodes)

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-700">Idiomas soportados</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((language) => (
          <label key={language.code} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              {...languageCodesRegister}
              value={language.code}
              defaultChecked={selectedSet.has(language.code)}
              disabled={!language.is_active}
              className="h-4 w-4"
            />
            <span>{language.label}</span>
            {!language.is_active && <span className="text-xs text-slate-400">(inactivo)</span>}
          </label>
        ))}
      </div>
      {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
    </div>
  )
}
