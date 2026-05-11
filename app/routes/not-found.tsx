import type { JSX } from 'react'

import { data, type LoaderFunctionArgs, type MetaFunction } from 'react-router'

import { NotFound } from '@/components/ui/not-found'

import type { DataWithResponseInit } from '@lib/types'

export function loader(_: LoaderFunctionArgs): DataWithResponseInit<null> {
  return data(null, { status: 404 })
}

export const meta: MetaFunction = () => {
  return [{ title: 'Página no encontrada - ConnectusPay' }, { name: 'description', content: 'Lo sentimos, la página que buscas no existe o ha sido movida.' }]
}

export default function GlobalNotFound(): JSX.Element {
  return (
    <NotFound
      title="Página no encontrada"
      description="Lo sentimos, la página que buscas no existe o ha sido movida. Verifica la URL o regresa al inicio."
      isDashboard={false}
    />
  )
}
