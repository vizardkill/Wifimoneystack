import React from 'react'

import { Check, ChevronsUpDown } from 'lucide-react'
import PhoneInput, { type Country, type FlagProps, getCountryCallingCode } from 'react-phone-number-input'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { Button } from './button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

interface CountrySelectProps {
  value?: Country
  onChange: (value?: Country) => void
  options: { value?: Country; label?: string }[]
  iconComponent: React.FC<{ country: Country; label: string; 'aria-hidden'?: boolean; aspectRatio?: number }>
}

const CountrySelect = ({ value, onChange, options, iconComponent: Flag }: CountrySelectProps) => {
  const [open, setOpen] = React.useState(false)

  const handleSelect = React.useCallback(
    (country?: Country) => {
      onChange(country)
      setOpen(false)
    },
    [onChange]
  )

  const handleCommandSelect = React.useCallback(
    (selectedValue: string) => {
      const match = selectedValue.match(/\(\+(\d+)\)$/)
      if (match) {
        const matchedOption = options.find((opt) => opt.value && `${opt.label} (+${getCountryCallingCode(opt.value)})` === selectedValue)
        handleSelect(matchedOption?.value)
      }
    },
    [options, handleSelect]
  )

  const selectedOption = options.find((option) => option.value === value)
  const selectedOptionLabel = selectedOption?.label ?? value ?? ''

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" aria-expanded={open} className="h-9 w-21.25 justify-between rounded-r-none border-r-0 px-3">
          {value && selectedOptionLabel && <Flag country={value} label={selectedOptionLabel} />}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-75 p-0">
        <Command>
          <CommandInput placeholder="Buscar país..." />
          <CommandList>
            <CommandEmpty>No se encontró el país.</CommandEmpty>
            <CommandGroup>
              {options
                .filter((opt) => opt.value && opt.label)
                .map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} (+${getCountryCallingCode(option.value!)})`}
                    onSelect={handleCommandSelect}
                    className="flex cursor-pointer items-center gap-3"
                  >
                    <Flag country={option.value!} label={option.label!} />
                    <span className="flex-1">{option.label}</span>
                    <span className="text-muted-foreground">+{getCountryCallingCode(option.value!)}</span>
                    <Check className={cn('ml-auto h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')} />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const PhoneInputComponent = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & Record<string, unknown>>((props, ref) => {
  const { className, ...allProps } = props
  const nonStandardProps = ['iconComponent', 'countryName', 'label', 'international', 'withCountryCallingCode', 'countryCallingCodeEditable']
  const safeProps = Object.fromEntries(
    Object.entries(allProps).filter(([key]) => !nonStandardProps.includes(key))
  ) as React.InputHTMLAttributes<HTMLInputElement>

  return <Input className={cn('h-9 rounded-l-none', className as string)} ref={ref} {...safeProps} />
})
PhoneInputComponent.displayName = 'PhoneInputComponent'

type PhoneNumberInputProps = {
  onChange: (value?: string) => void
  onCountryChange?: (country?: Country) => void
  international?: boolean
  defaultCountry?: Country
  value?: string
  disabled?: boolean
  readOnly?: boolean
  autoComplete?: string
  countryCallingCodeEditable?: boolean
  placeholder?: string
  name?: string
}

const CustomFlagComponent = ({ country, countryName }: FlagProps & { label?: string }) => (
  <img
    alt={countryName}
    title={countryName}
    role={countryName ? undefined : 'presentation'}
    src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${country}.svg`}
    className="PhoneInputCountryIconImg"
  />
)

const TypedPhoneInput = PhoneInput as unknown as React.ForwardRefExoticComponent<
  PhoneNumberInputProps & {
    inputComponent: typeof PhoneInputComponent
    countrySelectComponent: typeof CountrySelect
    className: string
    iconComponent: React.FC<{ country: Country; label: string }>
  } & React.RefAttributes<HTMLInputElement>
>

const PhoneNumberInput = React.forwardRef<HTMLInputElement, PhoneNumberInputProps>((props, ref) => {
  const { onChange, ...rest } = props

  const CustomCountryIcon = React.useCallback(
    ({ country, label }: { country: Country; label: string }) => <CustomFlagComponent country={country} countryName={label} />,
    []
  )

  return (
    <TypedPhoneInput
      ref={ref}
      inputComponent={PhoneInputComponent}
      countrySelectComponent={CountrySelect}
      className="flex items-center"
      onChange={onChange}
      iconComponent={CustomCountryIcon}
      international={rest.international}
      defaultCountry={rest.defaultCountry}
      value={rest.value}
      disabled={rest.disabled}
      readOnly={rest.readOnly}
      autoComplete={rest.autoComplete}
      countryCallingCodeEditable={rest.countryCallingCodeEditable}
      onCountryChange={rest.onCountryChange}
      placeholder={rest.placeholder}
      name={rest.name}
    />
  )
})
PhoneNumberInput.displayName = 'PhoneNumberInput'

export { PhoneNumberInput }
