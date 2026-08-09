import { useForm } from '@tanstack/react-form'
import { emptyFlag, flagFormSchema } from './schema'

function zodValidator({ value }: { value: unknown }) {
  const result = flagFormSchema.safeParse(value)
  if (result.success) return undefined

  const fields: Record<string, string> = {}
  const formErrors: string[] = []

  for (const issue of result.error.issues) {
    const path = issue.path.reduce<string>((currentPath, segment) => {
      if (typeof segment === 'number') return `${currentPath}[${segment}]`
      return currentPath ? `${currentPath}.${String(segment)}` : String(segment)
    }, '')

    if (path) {
      fields[path] ??= issue.message
    } else {
      formErrors.push(issue.message)
    }
  }

  return {
    form: formErrors[0],
    fields,
  }
}

export function useFeatureFlagForm() {
  return useForm({
    defaultValues: emptyFlag() as any,
    validators: {
      onChange: zodValidator,
      onSubmit: zodValidator,
    },
  })
}

export type FeatureFlagFormApi = ReturnType<typeof useFeatureFlagForm>
