export interface Province {
  id: number
  name: string
  country_id: string
}

export interface City {
  id: number
  name: string
  province_id: number
}

export interface GeographicData {
  provinces: Province[]
  cities: City[]
  loading: boolean
  error: string | null
}

export interface UseGeographicDataReturn extends GeographicData {
  loadProvinces: (countryId: string) => Promise<void>
  loadCities: (provinceId: number) => Promise<void>
  clearData: () => void
}
