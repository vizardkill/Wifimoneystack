export function overrideStaticMethod<T extends object, K extends keyof T>(target: T, key: K, replacement: T[K]): () => void {
  const original = target[key]

  Object.defineProperty(target, key, {
    value: replacement,
    configurable: true,
    writable: true
  })

  return () => {
    Object.defineProperty(target, key, {
      value: original,
      configurable: true,
      writable: true
    })
  }
}

export async function withOverrides(restores: Array<() => void>, run: () => Promise<void>): Promise<void> {
  try {
    await run()
  } finally {
    for (const restore of [...restores].reverse()) {
      restore()
    }
  }
}
