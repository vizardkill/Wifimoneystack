import { type JSX, useMemo } from 'react'

interface PasswordStrengthBarProps {
  strength: number
}

const strengthMap: Record<number, { label: string; width: string; color: string }> = {
  0: { label: 'Muy débil', width: '20%', color: 'bg-red-500' },
  1: { label: 'Débil', width: '35%', color: 'bg-orange-500' },
  2: { label: 'Aceptable', width: '55%', color: 'bg-yellow-500' },
  3: { label: 'Buena', width: '75%', color: 'bg-blue-500' },
  4: { label: 'Fuerte', width: '100%', color: 'bg-green-600' }
}

export function PasswordStrengthBar({ strength }: PasswordStrengthBarProps): JSX.Element {
  const clamped = Math.max(0, Math.min(4, strength))
  const current = strengthMap[clamped]
  const barStyle = useMemo(() => ({ width: current.width }), [current.width])

  return (
    <div className="space-y-1">
      <div className="h-2 w-full rounded bg-muted overflow-hidden">
        <div className={`h-full transition-all duration-300 ${current.color}`} style={barStyle} />
      </div>
      <p className="text-xs text-muted-foreground">Seguridad: {current.label}</p>
    </div>
  )
}
