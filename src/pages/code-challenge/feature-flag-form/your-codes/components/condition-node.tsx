import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import type { AnyFieldApi } from '@tanstack/react-form'
import { Braces, Plus, Trash2 } from 'lucide-react'
import { FieldError } from './field-error'
import { newGroup, newRule, OPERATORS, TARGET_FIELDS } from '../lib/schema'
import type { Condition, OperatorKey } from '../lib/schema'
import type { FeatureFlagFormApi } from '../lib/use-feature-flag-form'

const selectClassName =
  'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3'

type ConditionNodeProps = {
  form: FeatureFlagFormApi
  node: Condition
  path: string
  canRemove?: boolean
  onRemove?: () => void
}

export function ConditionNode({
  form,
  node,
  path,
  canRemove = true,
  onRemove,
}: ConditionNodeProps) {
  if (node.kind === 'rule') {
    return (
      <div className="bg-background grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_130px_1.3fr_auto]">
        <form.Field name={`${path}.field`}>
          {(field: AnyFieldApi) => (
            <div>
              <label className="mb-1 block text-xs" htmlFor={field.name}>
                Field
              </label>
              <select
                className={selectClassName}
                id={field.name}
                value={field.state.value as string}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              >
                {TARGET_FIELDS.map((targetField) => (
                  <option key={targetField} value={targetField}>
                    {targetField}
                  </option>
                ))}
              </select>
              <FieldError field={field} />
            </div>
          )}
        </form.Field>

        <form.Field name={`${path}.operator`}>
          {(field: AnyFieldApi) => (
            <div>
              <label className="mb-1 block text-xs" htmlFor={field.name}>
                Operator
              </label>
              <select
                className={selectClassName}
                id={field.name}
                value={field.state.value as OperatorKey}
                onBlur={field.handleBlur}
                onChange={(event) =>
                  field.handleChange(event.target.value as OperatorKey)
                }
              >
                {(
                  Object.entries(OPERATORS) as Array<[OperatorKey, string]>
                ).map(([key, symbol]) => (
                  <option key={key} value={key}>
                    {key} ({symbol})
                  </option>
                ))}
              </select>
              <FieldError field={field} />
            </div>
          )}
        </form.Field>

        <form.Field name={`${path}.value`}>
          {(field: AnyFieldApi) => (
            <div>
              <label className="mb-1 block text-xs" htmlFor={field.name}>
                Value
              </label>
              <Input
                id={field.name}
                value={field.state.value as string}
                placeholder="beta"
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <FieldError field={field} />
            </div>
          )}
        </form.Field>

        {onRemove && (
          <Button
            aria-label="ลบเงื่อนไข"
            className="self-end"
            disabled={!canRemove}
            size="icon"
            type="button"
            variant="destructive"
            onClick={onRemove}
          >
            <Trash2 />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="border-primary/30 bg-primary/[0.03] space-y-3 rounded-lg border border-l-4 p-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <form.Field name={`${path}.logic`}>
          {(field: AnyFieldApi) => (
            <div className="w-44">
              <label className="mb-1 block text-xs" htmlFor={field.name}>
                เงื่อนไขในกลุ่ม
              </label>
              <select
                className={selectClassName}
                id={field.name}
                value={field.state.value as 'and' | 'or'}
                onBlur={field.handleBlur}
                onChange={(event) =>
                  field.handleChange(event.target.value as 'and' | 'or')
                }
              >
                <option value="and">ตรงทุกข้อ (AND)</option>
                <option value="or">ตรงข้อใดข้อหนึ่ง (OR)</option>
              </select>
              <FieldError field={field} />
            </div>
          )}
        </form.Field>

        {onRemove && (
          <Button
            disabled={!canRemove}
            size="sm"
            type="button"
            variant="destructive"
            onClick={onRemove}
          >
            <Trash2 /> ลบกลุ่ม
          </Button>
        )}
      </div>

      <form.Field name={`${path}.children`} mode="array">
        {(childrenField: AnyFieldApi) => {
          const children = childrenField.state.value as Condition[]

          return (
            <div className="space-y-2">
              {children.map((child, index) => (
                <ConditionNode
                  canRemove={children.length > 1}
                  form={form}
                  key={child.id}
                  node={child}
                  path={`${path}.children[${index}]`}
                  onRemove={() => childrenField.removeValue(index)}
                />
              ))}

              <FieldError field={childrenField} />

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => childrenField.pushValue(newRule())}
                >
                  <Plus /> เพิ่ม Rule
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => childrenField.pushValue(newGroup())}
                >
                  <Braces /> เพิ่ม Group
                </Button>
              </div>
            </div>
          )
        }}
      </form.Field>
    </div>
  )
}
