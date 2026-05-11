/**
 * Selector de fecha genérico — shadcn Calendar + Popover.
 * Componente controlado puro: recibe `value` (YYYY-MM-DD) y llama `onChange`.
 * Sin dependencia de react-hook-form — se puede usar en cualquier formulario.
 *
 * @example con react-hook-form
 *   <Controller
 *     control={control}
 *     name="birth_date"
 *     render={({ field }) => (
 *       <DatePicker value={field.value} onChange={field.onChange} />
 *     )}
 *   />
 *
 * @example standalone
 *   <DatePicker value={date} onChange={setDate} disableFutureDates />
 */
import { type JSX, useCallback, useMemo, useState } from 'react'

import { format, isValid, parse } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface DatePickerProps {
  /** Valor actual en formato YYYY-MM-DD */
  value?: string
  /** Callback con el nuevo valor en formato YYYY-MM-DD */
  onChange: (value: string) => void
  id?: string
  disabled?: boolean
  /** Muestra borde rojo */
  error?: boolean
  placeholder?: string
  /** Si es true, deshabilita días posteriores a hoy */
  disableFutureDates?: boolean
  fromYear?: number
  toYear?: number
  className?: string
}

export function DatePicker({
  value,
  onChange,
  id,
  disabled,
  error,
  placeholder = 'Seleccionar fecha',
  disableFutureDates = false,
  fromYear = 1900,
  toYear = new Date().getFullYear(),
  className
}: DatePickerProps): JSX.Element {
  const [open, setOpen] = useState(false)

  const parsed = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined
  const selected = parsed && isValid(parsed) ? parsed : undefined

  const handleDayClick = useCallback(
    (day: Date) => {
      onChange(format(day, 'yyyy-MM-dd'))
      setOpen(false)
    },
    [onChange]
  )

  const formatters = useMemo(
    () => ({
      formatMonthDropdown: (date: Date) => format(date, 'MMMM', { locale: es }),
      formatCaption: (date: Date) => format(date, 'MMMM yyyy', { locale: es })
    }),
    []
  )

  const disabledDays = useMemo(() => (disableFutureDates ? { after: new Date() } : undefined), [disableFutureDates])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-between text-left font-normal',
            !selected && 'text-muted-foreground',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
        >
          {selected ? format(selected, "d 'de' MMMM 'de' yyyy", { locale: es }) : placeholder}
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={es}
          captionLayout="dropdown"
          fromYear={fromYear}
          toYear={toYear}
          disabled={disabledDays}
          formatters={formatters}
          selected={selected}
          defaultMonth={selected}
          onDayClick={handleDayClick}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
