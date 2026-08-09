import type { AnyFieldApi } from '@tanstack/react-form'

function errorMessage(error: unknown): string | null {
  if (typeof error === 'string') return error
  if (Array.isArray(error)) {
    for (const item of error) {
      const message = errorMessage(item)
      if (message) return message
    }
    return null
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    return typeof message === 'string' ? message : null
  }
  return null
}

export function FieldError({ field }: { field: AnyFieldApi }) {
  if (!field.state.meta.isTouched) return null

  const message = errorMessage(field.state.meta.errors)
  if (!message) return null

  return <p className="text-destructive mt-1 text-xs">{message}</p>
}
