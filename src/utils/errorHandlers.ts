export const tryCatch = async <T>(
  fn: (...args: any[]) => Promise<T>,
  ...args: any[]
): Promise<T | null> => {
  try {
    return await fn(...args)
  } catch (error) {
    console.error('[Handled Error]:', new Date().toISOString(), error)
    return null
  }
}

export const errorLog = (message: string) => {
  console.error('[Error]:', new Date().toISOString(), message)
}

export const warnLog = (message: string) => {
  console.warn('[Warning]:', new Date().toISOString(), message)
}
