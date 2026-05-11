import { type JSX } from 'react'

import { Loader2 } from 'lucide-react'
import { Form, useNavigation } from 'react-router'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface LogoutModalProps {
  children: React.ReactNode
}

export function LogoutModal({ children }: LogoutModalProps): JSX.Element {
  const nav = useNavigation()
  const isLoading = nav.state === 'submitting'

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro de que quieres salir?</AlertDialogTitle>
          <AlertDialogDescription>Tu sesión actual se cerrará y necesitarás volver a iniciar sesión para acceder al dashboard.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <Form method="post" action="/api/v1/auth/sessions">
            <Button type="submit" variant="destructive" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saliendo...
                </>
              ) : (
                'Confirmar y Salir'
              )}
            </Button>
          </Form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
