import type { JSX } from 'react'
import { useCallback, useMemo, useState } from 'react'

import { Check, ChevronsUpDown, UserRound } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const NONE_VALUE = '__none__'

export type TraineeComboboxItem = {
  id: string
  first_name: string
  last_name: string
  email?: string | null
  avatar_url?: string | null
  status?: string | null
}

type Props = {
  trainees: TraineeComboboxItem[]
  value: string | null | undefined
  onChange: (value: string | null) => void
  placeholder?: string
  searchPlaceholder?: string
  noResultsText?: string
  buttonAriaLabel?: string
  allowNoneOption?: boolean
  noneOptionLabel?: string
  showEmail?: boolean
  showStatusBadge?: boolean
  disabled?: boolean
  className?: string
}

export function TraineeCombobox({
  trainees,
  value,
  onChange,
  placeholder = 'Selecciona un alumno',
  searchPlaceholder = 'Buscar por nombre o email...',
  noResultsText = 'Sin resultados.',
  buttonAriaLabel = 'Seleccionar alumno',
  allowNoneOption = false,
  noneOptionLabel = 'Sin alumno',
  showEmail = true,
  showStatusBadge = false,
  disabled = false,
  className
}: Props): JSX.Element {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = useMemo(() => trainees.find((t) => t.id === value) ?? null, [trainees, value])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) {
      return trainees
    }

    return trainees.filter((t) => {
      const fullName = `${t.first_name} ${t.last_name}`.toLowerCase()
      const email = t.email?.toLowerCase() ?? ''
      return fullName.includes(q) || email.includes(q)
    })
  }, [search, trainees])

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSearch('')
    }
  }, [])

  const handleSelect = useCallback(
    (selectedValue: string) => {
      if (allowNoneOption && selectedValue === NONE_VALUE) {
        onChange(null)
      } else {
        onChange(selectedValue)
      }
      setOpen(false)
      setSearch('')
    },
    [allowNoneOption, onChange]
  )

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={buttonAriaLabel}
          disabled={disabled}
          className={cn('h-9 w-full justify-between px-3 font-normal', className)}
        >
          {selected !== null ? (
            <span className="flex min-w-0 items-center gap-2">
              <Avatar className="size-5 shrink-0">
                {selected.avatar_url != null && <AvatarImage src={selected.avatar_url} alt="" />}
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <UserRound className="size-3" />
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-sm">
                {selected.first_name} {selected.last_name}
              </span>
            </span>
          ) : (
            <span className="truncate text-sm text-muted-foreground">{allowNoneOption ? noneOptionLabel : placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder={searchPlaceholder} value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>{noResultsText}</CommandEmpty>
            <CommandGroup>
              {allowNoneOption ? (
                <CommandItem value={NONE_VALUE} onSelect={handleSelect} className="gap-2">
                  <UserRound className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-sm">{noneOptionLabel}</span>
                  {value == null && <Check className="ml-1 size-4 shrink-0" />}
                </CommandItem>
              ) : null}

              {filtered.map((trainee) => (
                <CommandItem key={trainee.id} value={trainee.id} onSelect={handleSelect} className="gap-2">
                  <Avatar className="mr-1 size-7 shrink-0">
                    {trainee.avatar_url != null && <AvatarImage src={trainee.avatar_url} alt="" />}
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <UserRound className="size-3.5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {trainee.first_name} {trainee.last_name}
                    </p>
                    {showEmail && trainee.email != null ? <p className="truncate text-xs text-muted-foreground">{trainee.email}</p> : null}
                  </div>

                  {showStatusBadge && trainee.status === 'INACTIVE' ? <span className="text-xs text-amber-500">Inactivo</span> : null}
                  {value === trainee.id ? <Check className="ml-1 size-4 shrink-0" /> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
