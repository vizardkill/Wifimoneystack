import React, { useEffect, useState } from 'react'

import { Check, ChevronsUpDown, Globe } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { type Country, useCountries } from '@/hooks/use-countries'
import { cn } from '@/lib/utils'

interface CountrySelectorProps {
  id?: string
  name?: string
  ref?: React.Ref<HTMLButtonElement>
  autoComplete?: 'off' | 'on'
  value?: string
  onChange: (countryCode?: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const FLAG_SIZE_24 = { width: 24, height: 18 }
const FLAG_IMG_FILL = { width: '100%', height: '100%' }
const FLAG_SIZE_20 = { width: 20, height: 15 }

const CountryFlag = ({ country, size = 24 }: { country: Country; size?: number }) => {
  const sizeStyle = size === 20 ? FLAG_SIZE_20 : FLAG_SIZE_24
  return (
    <div className={'relative overflow-hidden rounded-sm'} style={sizeStyle}>
      <img src={country.flag} alt={country.name} className="object-cover" style={FLAG_IMG_FILL} />
    </div>
  )
}

const CountrySelector = React.forwardRef<HTMLButtonElement, CountrySelectorProps>(
  ({ value, onChange, placeholder = 'Seleccionar país...', disabled = false, className, autoComplete, id, name }, ref) => {
    const [open, setOpen] = React.useState(false)
    const [mounted, setMounted] = useState(false)
    const { countries, getCountryByCode } = useCountries()

    useEffect(() => {
      setMounted(true)
    }, [])

    const selectedCountry = value ? getCountryByCode(value) : null

    const handleSelect = React.useCallback(
      (countryCode: string) => {
        if (value === countryCode) {
          onChange('')
        } else {
          onChange(countryCode)
        }
        setOpen(false)
      },
      [value, onChange]
    )

    const handleCommandSelect = React.useCallback(
      (selectedValue: string) => {
        const code = selectedValue.split(' ').pop() ?? ''
        handleSelect(code)
      },
      [handleSelect]
    )

    if (!mounted) {
      return (
        <div className="relative">
          <input type="hidden" name={name} value={value || ''} autoComplete={autoComplete} />
          <Button variant="outline" disabled={true} className={cn('h-12 w-full justify-between font-normal text-muted-foreground', className)}>
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4" />
              <span>{placeholder}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </div>
      )
    }

    return (
      <div className="relative">
        {/* Input hidden para enviar el valor al formulario */}
        <input type="hidden" name={name} id={id} value={value || ''} autoComplete={autoComplete} />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              type="button" // Importante: evitar que submit el formulario
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className={cn('h-12 w-full justify-between font-normal', !selectedCountry && 'text-muted-foreground', className)}
            >
              <div className="flex items-center gap-3">
                {selectedCountry ? (
                  <>
                    <CountryFlag country={selectedCountry} size={24} />
                    <span>{selectedCountry.name}</span>
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    <span>{placeholder}</span>
                  </>
                )}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar país..." />
              <CommandList>
                <CommandEmpty>No se encontró el país.</CommandEmpty>
                <CommandGroup>
                  {countries.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={`${country.name} ${country.code}`}
                      onSelect={handleCommandSelect}
                      className="flex cursor-pointer items-center gap-3 py-2"
                    >
                      <CountryFlag country={country} size={20} />
                      <span className="flex-1">{country.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{country.code}</span>
                      <Check className={cn('ml-auto h-4 w-4', value === country.code ? 'opacity-100' : 'opacity-0')} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)

CountrySelector.displayName = 'CountrySelector'

export { CountrySelector, type CountrySelectorProps }
