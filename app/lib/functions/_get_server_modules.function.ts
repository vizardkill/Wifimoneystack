import type * as fs from 'node:fs'
import type * as path from 'node:path'

// Función auxiliar que solo importará los módulos de Node.js si estamos en el servidor.
// Esto evita que Vite intente empaquetarlos para el cliente.
interface ServerOnlyModules {
  fs: typeof fs
  path: typeof path
  process: NodeJS.Process
}

export const getServerOnlyModules = async (): Promise<ServerOnlyModules> => {
  if (typeof window === 'undefined') {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const process = await import('node:process')
    return { fs, path, process }
  } else {
    throw new Error('Server-only modules cannot be loaded on the client.')
  }
}
