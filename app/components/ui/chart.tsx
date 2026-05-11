/**
 * Thin wrapper de recharts para mantener consistencia visual en la app.
 * Paleta monocromática dark-green alineada al estilo OLED del marketplace WMC.
 */
export { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
export type { TooltipProps } from 'recharts'

/** Paleta monocromática de barras: de zinc-400 a zinc-600 */
export const CHART_COLORS = ['hsl(var(--foreground))', 'hsl(240 5.9% 60%)', 'hsl(240 5.9% 50%)', 'hsl(240 5.9% 40%)', 'hsl(240 5.9% 30%)'] as const

export const CHART_PRIMARY_COLOR = 'hsl(var(--foreground))'
export const CHART_MUTED_COLOR = 'hsl(var(--muted-foreground))'
