import { useMemo } from 'react'

export type Country = {
  code: string
  name: string
  flag: string
  is_enabled: boolean
}

const LATIN_AMERICA_COUNTRIES: Country[] = [
  { code: 'MX', name: 'México', flag: 'https://flagcdn.com/w40/mx.png', is_enabled: true },
  { code: 'AR', name: 'Argentina', flag: 'https://flagcdn.com/w40/ar.png', is_enabled: true },
  { code: 'BO', name: 'Bolivia', flag: 'https://flagcdn.com/w40/bo.png', is_enabled: true },
  { code: 'BR', name: 'Brasil', flag: 'https://flagcdn.com/w40/br.png', is_enabled: true },
  { code: 'CL', name: 'Chile', flag: 'https://flagcdn.com/w40/cl.png', is_enabled: true },
  { code: 'CO', name: 'Colombia', flag: 'https://flagcdn.com/w40/co.png', is_enabled: true },
  { code: 'CR', name: 'Costa Rica', flag: 'https://flagcdn.com/w40/cr.png', is_enabled: true },
  { code: 'CU', name: 'Cuba', flag: 'https://flagcdn.com/w40/cu.png', is_enabled: true },
  { code: 'EC', name: 'Ecuador', flag: 'https://flagcdn.com/w40/ec.png', is_enabled: true },
  { code: 'SV', name: 'El Salvador', flag: 'https://flagcdn.com/w40/sv.png', is_enabled: true },
  { code: 'GT', name: 'Guatemala', flag: 'https://flagcdn.com/w40/gt.png', is_enabled: true },
  { code: 'HN', name: 'Honduras', flag: 'https://flagcdn.com/w40/hn.png', is_enabled: true },
  { code: 'NI', name: 'Nicaragua', flag: 'https://flagcdn.com/w40/ni.png', is_enabled: true },
  { code: 'PA', name: 'Panamá', flag: 'https://flagcdn.com/w40/pa.png', is_enabled: true },
  { code: 'PY', name: 'Paraguay', flag: 'https://flagcdn.com/w40/py.png', is_enabled: true },
  { code: 'PE', name: 'Perú', flag: 'https://flagcdn.com/w40/pe.png', is_enabled: true },
  { code: 'DO', name: 'República Dominicana', flag: 'https://flagcdn.com/w40/do.png', is_enabled: true },
  { code: 'UY', name: 'Uruguay', flag: 'https://flagcdn.com/w40/uy.png', is_enabled: true },
  { code: 'VE', name: 'Venezuela', flag: 'https://flagcdn.com/w40/ve.png', is_enabled: true }
]

type ResponseHook = {
  countries: Country[]
  getCountryByCode: (code: string) => Country | undefined
  getCountryByName: (name: string) => Country | undefined
}

export const useCountries = (): ResponseHook => {
  const countries = useMemo(() => {
    return LATIN_AMERICA_COUNTRIES.filter((country) => country.is_enabled).sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  const getCountryByCode = (code: string): Country | undefined => {
    return countries.find((country) => country.code === code)
  }

  const getCountryByName = (name: string): Country | undefined => {
    return countries.find((country) => country.name.toLowerCase().includes(name.toLowerCase()))
  }

  return {
    countries,
    getCountryByCode,
    getCountryByName
  }
}
