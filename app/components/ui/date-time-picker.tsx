/**
 * DateTimePicker — shadcn Calendar + segmented HH:MM keyboard inputs.
 * Mobile: full-screen Dialog with Material Design primary header.
 * Desktop: Popover (unchanged layout).
 *
 * @example
 *   const [start, setStart] = useState<Date | undefined>()
 *   <DateTimePicker value={start} onChange={setStart} label="Inicio" />
 */
import { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { format, isValid, set } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface DateTimePickerProps {
  value?: Date | string | null
  onChange: (value: Date) => void
  id?: string
  label?: string
  disabled?: boolean
  error?: boolean
  placeholder?: string
  className?: string
  /** Límite inferior para deshabilitar días anteriores */
  fromDate?: Date
  /** Cuando se provee, zona de hora muestra lista de duraciones relativa a esta fecha (estilo Google Calendar) */
  suggestFrom?: Date
  /** Modo solo fecha: oculta el selector de hora y muestra solo la fecha */
  dateOnly?: boolean
}

// ─── Duration suggestions (Google Calendar style) ───────────────────────────

const SUGGESTION_DURATIONS_MIN = [15, 30, 45, 60, 75, 90, 105, 120, 150, 180, 240, 300, 360, 420, 480] as const

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const h = minutes / 60
  if (Number.isInteger(h)) {
    return `${h} h`
  }
  if (minutes % 60 === 30) {
    return `${Math.floor(h)},5 h`
  }
  return `${Math.floor(h)} h ${minutes % 60} min`
}

interface DurationItemProps {
  end: Date
  min: number
  isSelected: boolean
  onSelect: (value: Date) => void
}

function DurationItem({ end, min, isSelected, onSelect }: DurationItemProps): JSX.Element {
  const handleClick = useCallback(() => onSelect(end), [onSelect, end])
  return (
    <button
      type="button"
      data-selected={isSelected}
      onClick={handleClick}
      className={cn(
        'w-full text-left px-4 py-1.5 text-sm flex items-center justify-between hover:bg-accent transition-colors',
        isSelected && 'bg-primary/10 text-primary font-semibold'
      )}
    >
      <span className="tabular-nums">{format(end, 'HH:mm')}</span>
      <span className={cn('text-xs ml-4', isSelected ? 'text-primary' : 'text-muted-foreground')}>{formatDuration(min)}</span>
    </button>
  )
}

interface DurationListProps {
  from: Date
  selected: Date | undefined
  onSelect: (value: Date) => void
}

function DurationList({ from, selected, onSelect }: DurationListProps): JSX.Element {
  const listRef = useRef<HTMLDivElement>(null)

  const suggestions = useMemo(
    () =>
      SUGGESTION_DURATIONS_MIN.map((min) => ({
        min,
        end: new Date(from.getTime() + min * 60_000)
      })),
    [from]
  )

  // Scroll the selected item into view when list mounts
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-selected="true"]') as HTMLElement | null
    el?.scrollIntoView({ block: 'nearest' })
  }, [])

  // Radix Dialog/Popover intercepta wheel events — los capturamos en la fase de
  // captura y scrolleamos manualmente para que el mouse wheel funcione sobre la lista
  useEffect(() => {
    const node = listRef.current
    if (node == null) {
      return
    }
    const handler = (e: WheelEvent) => {
      e.stopPropagation()
      node.scrollTop += e.deltaY
    }
    node.addEventListener('wheel', handler, { capture: true, passive: true })
    return () => node.removeEventListener('wheel', handler, { capture: true })
  }, [])

  return (
    <div className="border-t">
      <div ref={listRef} className="overflow-y-auto overscroll-contain max-h-48 py-1">
        {suggestions.map(({ min, end }) => {
          const isSelected = selected?.getHours() === end.getHours() && selected.getMinutes() === end.getMinutes()
          return <DurationItem key={min} end={end} min={min} isSelected={isSelected} onSelect={onSelect} />
        })}
      </div>
    </div>
  )
}

// ─── Segmented Time Picker ─────────────────────────────────────────────────────
// Keyboard-driven HH : MM inputs. Inspired by openstatusHQ/time-picker (time.openstatus.dev).
// No external dependencies — built on top of shadcn Input + Tailwind.

interface TimeSegmentInputProps {
  unit: 'hours' | 'minutes'
  date: Date | undefined
  onChange: (d: Date) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  nextRef?: React.RefObject<HTMLInputElement | null>
  prevRef?: React.RefObject<HTMLInputElement | null>
  /** Override default min (default: 0) */
  min?: number
  /** Override default max (default: 23 for hours, 59 for minutes) */
  max?: number
  /** 'lg' (default, mobile) | 'sm' (desktop) */
  size?: 'lg' | 'sm'
}

function TimeSegmentInput({ unit, date, onChange, inputRef, nextRef, prevRef, min, max, size = 'lg' }: TimeSegmentInputProps): JSX.Element {
  const [firstDigit, setFirstDigit] = useState<string | null>(null)
  const numericValue = date != null ? (unit === 'hours' ? date.getHours() : date.getMinutes()) : null
  const minVal = min ?? 0
  const maxVal = max ?? (unit === 'hours' ? 23 : 59)
  const maxFirstDigit = Math.floor(maxVal / 10)

  const update = useCallback(
    (n: number) => {
      const clamped = Math.min(maxVal, Math.max(minVal, n))
      const base = date ?? new Date()
      if (unit === 'hours') {
        onChange(set(base, { hours: clamped, seconds: 0, milliseconds: 0 }))
      } else {
        onChange(set(base, { minutes: clamped, seconds: 0, milliseconds: 0 }))
      }
    },
    [date, unit, onChange, minVal, maxVal]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault()
        nextRef?.current?.focus()
        return
      }
      if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault()
        prevRef?.current?.focus()
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        update(numericValue == null ? minVal : numericValue >= maxVal ? minVal : numericValue + 1)
        setFirstDigit(null)
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        update(numericValue == null ? maxVal : numericValue <= minVal ? maxVal : numericValue - 1)
        setFirstDigit(null)
        return
      }
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault()
        const digit = Number(e.key)
        if (firstDigit !== null) {
          const combined = Number(firstDigit + e.key)
          update(combined > maxVal ? digit : combined)
          setFirstDigit(null)
          nextRef?.current?.focus()
        } else {
          update(digit)
          if (digit > maxFirstDigit) {
            setFirstDigit(null)
            nextRef?.current?.focus()
          } else {
            setFirstDigit(e.key)
          }
        }
        return
      }
      if (e.key === 'Backspace') {
        e.preventDefault()
        update(minVal)
        setFirstDigit(null)
      }
    },
    [numericValue, minVal, maxVal, maxFirstDigit, update, nextRef, prevRef, firstDigit]
  )

  const handleBlur = useCallback(() => setFirstDigit(null), [])

  const displayValue = numericValue !== null ? String(numericValue).padStart(2, '0') : '--'

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={displayValue}
      readOnly
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={cn(
        'cursor-default select-none rounded-xl border-2 border-input bg-background text-center font-semibold tabular-nums caret-transparent',
        'transition-colors focus:border-primary focus:outline-hidden focus:ring-0',
        size === 'lg' ? 'h-14 w-16 text-3xl' : 'h-9 w-11 text-lg',
        numericValue === null && 'text-muted-foreground/50'
      )}
      aria-label={unit === 'hours' ? 'Horas' : 'Minutos'}
    />
  )
}

interface SegmentedTimePickerProps {
  date: Date | undefined
  onChange: (d: Date) => void
  /** 'lg' (default, mobile) | 'sm' (desktop) */
  size?: 'lg' | 'sm'
}

function SegmentedTimePicker({ date, onChange, size = 'lg' }: SegmentedTimePickerProps): JSX.Element {
  const hoursRef = useRef<HTMLInputElement>(null)
  const minutesRef = useRef<HTMLInputElement>(null)

  const hours24 = date?.getHours() ?? null
  const isPM = hours24 != null && hours24 >= 12
  // Convierte a escala 1-12 para mostrar
  const hours12 = hours24 != null ? (hours24 % 12 === 0 ? 12 : hours24 % 12) : null

  // Date sintético con el valor en escala 1-12 para el input de horas
  const hoursDisplayDate = useMemo(() => (date != null && hours12 != null ? set(date, { hours: hours12 }) : date), [date, hours12])

  // Convierte la hora 1-12 de vuelta a 24hr antes de notificar
  const handleHoursChange = useCallback(
    (d: Date) => {
      const h12 = d.getHours() // 1–12
      const h24 = isPM ? (h12 === 12 ? 12 : h12 + 12) : h12 === 12 ? 0 : h12
      onChange(set(d, { hours: h24, seconds: 0, milliseconds: 0 }))
    },
    [isPM, onChange]
  )

  const toggleAmPm = useCallback(() => {
    if (date == null) {
      return
    }
    const h = date.getHours()
    onChange(set(date, { hours: h >= 12 ? h - 12 : h + 12, seconds: 0, milliseconds: 0 }))
  }, [date, onChange])

  return (
    <div className="flex items-center justify-center gap-2">
      <TimeSegmentInput
        unit="hours"
        date={hoursDisplayDate}
        onChange={handleHoursChange}
        inputRef={hoursRef}
        nextRef={minutesRef}
        min={1}
        max={12}
        size={size}
      />
      <span className={cn('select-none pb-1 font-bold text-muted-foreground', size === 'lg' ? 'text-4xl' : 'text-2xl')}>:</span>
      <TimeSegmentInput unit="minutes" date={date} onChange={onChange} inputRef={minutesRef} prevRef={hoursRef} size={size} />
      {/* Toggle AM / PM */}
      <button
        type="button"
        onClick={toggleAmPm}
        disabled={date == null}
        className={cn(
          'ml-1 flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-input transition-colors',
          size === 'lg' ? 'h-14 w-14' : 'h-9 w-11',
          'hover:border-primary hover:bg-primary/5 focus:border-primary focus:outline-hidden focus:ring-0',
          'disabled:pointer-events-none disabled:opacity-40'
        )}
        aria-label={isPM ? 'Cambiar a AM' : 'Cambiar a PM'}
      >
        <span className={cn('font-bold leading-tight', size === 'lg' ? 'text-sm' : 'text-xs', !isPM ? 'text-primary' : 'text-muted-foreground/40')}>AM</span>
        <span className={cn('font-bold leading-tight', size === 'lg' ? 'text-sm' : 'text-xs', isPM ? 'text-primary' : 'text-muted-foreground/40')}>PM</span>
      </button>
    </div>
  )
}

// ─── Analog Clock Time Picker (Material Design style) ─────────────────────────
// Reloj analógico SVG. Abre como diálogo secundario al tocar la hora en mobile.

const CLOCK_SIZE = 256
const CLOCK_CENTER = CLOCK_SIZE / 2
const NUMBERS_R = 96
const SEL_DOT_R = 20

// Constantes de módulo — evitan objetos inline como props (react-perf)
const CALENDAR_CLASS_NAMES = { root: 'w-full' } as const

const HOUR_POSITIONS = Array.from({ length: 12 }, (_, i) => {
  const h = i === 0 ? 12 : i
  const rad = ((i / 12) * 360 - 90) * (Math.PI / 180)
  return { value: h, x: CLOCK_CENTER + NUMBERS_R * Math.cos(rad), y: CLOCK_CENTER + NUMBERS_R * Math.sin(rad) }
})

const MINUTE_POSITIONS = Array.from({ length: 12 }, (_, i) => {
  const m = i * 5
  const rad = ((i / 12) * 360 - 90) * (Math.PI / 180)
  return { value: m, x: CLOCK_CENTER + NUMBERS_R * Math.cos(rad), y: CLOCK_CENTER + NUMBERS_R * Math.sin(rad) }
})

function getHandCoords(value: number, step: 'hours' | 'minutes'): { x: number; y: number } {
  const ratio = step === 'hours' ? (value % 12) / 12 : value / 60
  const rad = (ratio * 360 - 90) * (Math.PI / 180)
  return { x: CLOCK_CENTER + NUMBERS_R * Math.cos(rad), y: CLOCK_CENTER + NUMBERS_R * Math.sin(rad) }
}

function getValueFromPointer(clientX: number, clientY: number, rect: DOMRect, step: 'hours' | 'minutes'): number {
  const x = clientX - rect.left - CLOCK_CENTER
  const y = clientY - rect.top - CLOCK_CENTER
  const angleDeg = Math.atan2(y, x) * (180 / Math.PI)
  const normalized = (((angleDeg + 90) % 360) + 360) % 360
  const idx = Math.round(normalized / 30) % 12
  return step === 'hours' ? (idx === 0 ? 12 : idx) : idx * 5
}

interface ClockTimePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date | undefined
  onChange: (d: Date) => void
}

function ClockTimePicker({ open, onOpenChange, date, onChange }: ClockTimePickerProps): JSX.Element {
  const [step, setStep] = useState<'hours' | 'minutes'>('hours')
  const isDragging = useRef(false)

  useEffect(() => {
    if (open) {
      setStep('hours')
    }
  }, [open])

  const hours24 = date?.getHours() ?? 9
  const minutes = date?.getMinutes() ?? 0
  const isPM = hours24 >= 12
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12

  const currentValue = step === 'hours' ? hours12 : minutes
  const handCoords = getHandCoords(currentValue, step)
  const positions = step === 'hours' ? HOUR_POSITIONS : MINUTE_POSITIONS

  const applyPointer = useCallback(
    (clientX: number, clientY: number, svgEl: SVGSVGElement) => {
      const rect = svgEl.getBoundingClientRect()
      const val = getValueFromPointer(clientX, clientY, rect, step)
      const base = date ?? new Date()
      if (step === 'hours') {
        const h24 = isPM ? (val === 12 ? 12 : val + 12) : val === 12 ? 0 : val
        onChange(set(base, { hours: h24, seconds: 0, milliseconds: 0 }))
      } else {
        onChange(set(base, { minutes: val, seconds: 0, milliseconds: 0 }))
      }
    },
    [step, isPM, date, onChange]
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      isDragging.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
      applyPointer(e.clientX, e.clientY, e.currentTarget)
    },
    [applyPointer]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!isDragging.current) {
        return
      }
      applyPointer(e.clientX, e.clientY, e.currentTarget)
    },
    [applyPointer]
  )

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
    if (step === 'hours') {
      setStep('minutes')
    }
  }, [step])

  const goToHours = useCallback(() => setStep('hours'), [])
  const goToMinutes = useCallback(() => setStep('minutes'), [])

  const toggleAmPm = useCallback(() => {
    if (date == null) {
      return
    }
    const h = date.getHours()
    onChange(set(date, { hours: h >= 12 ? h - 12 : h + 12, seconds: 0, milliseconds: 0 }))
  }, [date, onChange])

  const selectAM = useCallback(() => {
    if (isPM) {
      toggleAmPm()
    }
  }, [isPM, toggleAmPm])

  const selectPM = useCallback(() => {
    if (!isPM) {
      toggleAmPm()
    }
  }, [isPM, toggleAmPm])

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="flex w-[calc(100vw-2rem)] max-w-xs flex-col gap-0 overflow-hidden rounded-2xl p-0">
        <DialogTitle className="sr-only">Seleccionar hora</DialogTitle>

        {/* ── Cabecera Material Design ── */}
        <div className="bg-primary px-6 pb-4 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/70">Seleccionar hora</p>
          <div className="mt-2 flex items-center gap-1">
            <button
              type="button"
              onClick={goToHours}
              className={cn(
                'rounded-lg px-2 py-1 text-5xl font-bold tabular-nums leading-none transition-colors',
                step === 'hours' ? 'bg-white/20 text-primary-foreground' : 'text-primary-foreground/50 hover:bg-white/10'
              )}
            >
              {String(hours12).padStart(2, '0')}
            </button>
            <span className="text-4xl font-bold text-primary-foreground/60">:</span>
            <button
              type="button"
              onClick={goToMinutes}
              className={cn(
                'rounded-lg px-2 py-1 text-5xl font-bold tabular-nums leading-none transition-colors',
                step === 'minutes' ? 'bg-white/20 text-primary-foreground' : 'text-primary-foreground/50 hover:bg-white/10'
              )}
            >
              {String(minutes).padStart(2, '0')}
            </button>
            <div className="ml-2 flex flex-col gap-0.5">
              <button
                type="button"
                onClick={selectAM}
                className={cn(
                  'rounded px-2 py-0.5 text-sm font-bold leading-tight transition-colors',
                  !isPM ? 'bg-white/20 text-primary-foreground' : 'text-primary-foreground/40 hover:bg-white/10'
                )}
              >
                AM
              </button>
              <button
                type="button"
                onClick={selectPM}
                className={cn(
                  'rounded px-2 py-0.5 text-sm font-bold leading-tight transition-colors',
                  isPM ? 'bg-white/20 text-primary-foreground' : 'text-primary-foreground/40 hover:bg-white/10'
                )}
              >
                PM
              </button>
            </div>
          </div>
        </div>

        {/* ── Reloj analógico SVG ── */}
        <div className="flex justify-center bg-background p-5">
          <svg
            width={CLOCK_SIZE}
            height={CLOCK_SIZE}
            viewBox={`0 0 ${CLOCK_SIZE} ${CLOCK_SIZE}`}
            className="cursor-pointer select-none touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <circle cx={CLOCK_CENTER} cy={CLOCK_CENTER} r={CLOCK_CENTER - 6} className="fill-muted" />
            <line x1={CLOCK_CENTER} y1={CLOCK_CENTER} x2={handCoords.x} y2={handCoords.y} className="stroke-primary" strokeWidth={2} />
            <circle cx={CLOCK_CENTER} cy={CLOCK_CENTER} r={4} className="fill-primary" />
            <circle cx={handCoords.x} cy={handCoords.y} r={SEL_DOT_R} className="fill-primary" />
            {positions.map((pos) => {
              const isActive = pos.value === currentValue
              return (
                <text
                  key={pos.value}
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={14}
                  fontWeight={isActive ? '700' : '400'}
                  fill={isActive ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))'}
                >
                  {step === 'hours' ? String(pos.value) : String(pos.value).padStart(2, '0')}
                </text>
              )
            })}
          </svg>
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-end gap-2 border-t px-4 py-3">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleClose}>
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function DateTimePicker({
  value,
  onChange,
  id,
  label,
  disabled,
  error,
  placeholder = 'Seleccionar fecha y hora',
  className,
  fromDate,
  suggestFrom,
  dateOnly = false
}: DateTimePickerProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const [clockOpen, setClockOpen] = useState(false)
  const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640)

  // Normalizar value a Date | undefined
  const selected = useMemo(() => {
    if (value == null) {
      return undefined
    }
    const d = value instanceof Date ? value : new Date(value)
    return isValid(d) ? d : undefined
  }, [value])

  const handleDaySelect = useCallback(
    (day: Date | undefined) => {
      if (day == null) {
        return
      }
      const h = selected?.getHours() ?? 9
      const m = selected?.getMinutes() ?? 0
      const next = set(day, { hours: h, minutes: m, seconds: 0, milliseconds: 0 })
      onChange(next)
      if (isMobile && dateOnly) {
        setOpen(false)
      }
    },
    [selected, onChange, isMobile, dateOnly]
  )

  const handleDurationSelect = useCallback(
    (d: Date) => {
      onChange(d)
      setOpen(false)
    },
    [onChange]
  )

  const handleOpenDialog = useCallback(() => setOpen(true), [])
  const handleCloseDialog = useCallback(() => setOpen(false), [])
  const openClockPicker = useCallback(() => setClockOpen(true), [])

  const formatters = useMemo(
    () => ({
      formatMonthDropdown: (date: Date) => format(date, 'MMMM', { locale: es }),
      formatCaption: (date: Date) => format(date, 'MMMM yyyy', { locale: es })
    }),
    []
  )

  const disabledDays = useMemo(() => (fromDate != null ? { before: fromDate } : undefined), [fromDate])

  const displayText =
    selected != null
      ? dateOnly
        ? format(selected, 'EEE d MMM yyyy', { locale: es })
        : format(selected, 'EEE d MMM yyyy, h:mm a', { locale: es })
      : placeholder

  const triggerClass = cn(
    'w-full justify-start text-left font-normal h-9',
    selected == null && 'text-muted-foreground',
    error && 'border-destructive ring-destructive/30'
  )

  const calendarNode = (
    <Calendar
      mode="single"
      selected={selected}
      onSelect={handleDaySelect}
      captionLayout="dropdown"
      fromYear={2020}
      toYear={new Date().getFullYear() + 2}
      disabled={disabledDays}
      formatters={formatters}
      classNames={CALENDAR_CLASS_NAMES}
      locale={es}
    />
  )

  // Móvil: botón con hora actual que abre el reloj analógico
  const mobileTimeNode = !dateOnly && (
    <div className="border-t px-4 py-5">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">Hora</span>
      </div>
      <div className={cn('flex justify-center', selected == null && 'pointer-events-none opacity-40')}>
        <button
          type="button"
          onClick={openClockPicker}
          className="rounded-xl border-2 border-input bg-background px-6 py-3 text-2xl font-semibold tabular-nums transition-colors hover:border-primary focus:border-primary focus:outline-hidden"
          aria-label="Seleccionar hora"
        >
          {selected != null ? format(selected, 'h:mm a') : '--:-- --'}
        </button>
      </div>
      <ClockTimePicker open={clockOpen} onOpenChange={setClockOpen} date={selected} onChange={onChange} />
    </div>
  )

  // Desktop: inputs segmentados con teclado
  const desktopTimeNode = !dateOnly && (
    <div className="border-t px-4 py-5">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">Hora</span>
      </div>
      <div className={cn('flex justify-center', selected == null && 'pointer-events-none opacity-40')}>
        <SegmentedTimePicker date={selected} onChange={onChange} size="sm" />
      </div>
    </div>
  )

  // ─── PATH 1: suggestFrom — siempre Popover con lista de duraciones ────────

  if (suggestFrom != null) {
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label != null && <Label htmlFor={id}>{label}</Label>}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button id={id} type="button" variant="outline" disabled={disabled} className={triggerClass}>
              <CalendarIcon className="mr-2 size-4 shrink-0" />
              <span>{displayText}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
            <DurationList from={suggestFrom} selected={selected} onSelect={handleDurationSelect} />
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  // ─── PATH 2: Móvil — Dialog con cabecera Material Design ─────────────────

  if (isMobile) {
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label != null && <Label htmlFor={id}>{label}</Label>}
        <Button id={id} type="button" variant="outline" disabled={disabled} onClick={handleOpenDialog} className={triggerClass}>
          <CalendarIcon className="mr-2 size-4 shrink-0" />
          <span>{displayText}</span>
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent aria-describedby={undefined} className="flex h-dvh w-full max-w-full flex-col gap-0 overflow-hidden rounded-none p-0">
            {/* ── Cabecera estilo Material Design ── */}
            <div className="shrink-0 bg-primary px-6 pb-5 pt-6">
              <DialogTitle className="sr-only">{label ?? (dateOnly ? 'Seleccionar fecha' : 'Seleccionar fecha y hora')}</DialogTitle>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/70">
                {dateOnly ? 'Seleccionar fecha' : 'Seleccionar fecha y hora'}
              </p>
              <p className="mt-1 text-3xl font-bold capitalize tracking-tight text-primary-foreground">
                {selected != null ? format(selected, "EEE, d 'de' MMM", { locale: es }) : '—'}
              </p>
              {!dateOnly && (
                <p className="mt-1 font-medium tabular-nums text-primary-foreground/80">{selected != null ? format(selected, 'h:mm a') : '--:--'}</p>
              )}
            </div>

            {/* ── Cuerpo scrolleable ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {calendarNode}
              {mobileTimeNode}
            </div>

            {/* ── Footer con botón Confirmar ── */}
            <div className="shrink-0 border-t px-4 py-3">
              <Button type="button" className="w-full" onClick={handleCloseDialog}>
                Confirmar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ─── PATH 3: Desktop — Popover con segmented time ─────────────────────────

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label != null && <Label htmlFor={id}>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button id={id} type="button" variant="outline" disabled={disabled} className={triggerClass}>
            <CalendarIcon className="mr-2 size-4 shrink-0" />
            <span>{displayText}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
          {calendarNode}
          {desktopTimeNode}
        </PopoverContent>
      </Popover>
    </div>
  )
}
