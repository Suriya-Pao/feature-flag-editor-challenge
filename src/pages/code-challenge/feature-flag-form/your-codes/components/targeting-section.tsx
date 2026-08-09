import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import type { AnyFieldApi } from '@tanstack/react-form'
import { Plus, Trash2 } from 'lucide-react'
import { ConditionNode } from './condition-node'
import { FieldError } from './field-error'
import { newTargeting } from '../lib/schema'
import type { Targeting, Variation } from '../lib/schema'
import type { FeatureFlagFormApi } from '../lib/use-feature-flag-form'

const selectClassName =
  'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3'

const TargetingSection = ({ form }: { form: FeatureFlagFormApi }) => {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Targeting Rules</h2>
        <p className="text-muted-foreground text-sm">
          สร้างกลุ่มเงื่อนไขเพื่อเลือก variation ให้ผู้ใช้แต่ละกลุ่ม
        </p>
      </div>

      <form.Subscribe selector={(state) => state.values.variations}>
        {(variationsValue) => {
          const variations = (variationsValue ?? []) as Variation[]

          return (
            <form.Field name="targeting" mode="array">
              {(targetingField: AnyFieldApi) => {
                const targets = targetingField.state.value as Targeting[]

                return (
                  <div className="space-y-4">
                    {targets.length === 0 && (
                      <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
                        ยังไม่มี targeting rule ทุกคนจะได้รับ default variation
                      </div>
                    )}

                    {targets.map((target, index) => (
                      <article
                        className="space-y-4 rounded-xl border p-4"
                        key={target.id}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-medium">Rule set {index + 1}</h3>
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => targetingField.removeValue(index)}
                          >
                            <Trash2 /> ลบ Rule set
                          </Button>
                        </div>

                        <ConditionNode
                          canRemove={false}
                          form={form}
                          node={target.condition}
                          path={`targeting[${index}].condition`}
                        />

                        <div className="grid gap-3 md:grid-cols-2">
                          <form.Field name={`targeting[${index}].percentage`}>
                            {(field: AnyFieldApi) => (
                              <div>
                                <label
                                  className="mb-1 block text-sm"
                                  htmlFor={field.name}
                                >
                                  Percentage
                                </label>
                                <Input
                                  id={field.name}
                                  max={100}
                                  min={0}
                                  type="number"
                                  value={field.state.value as number}
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(
                                      Number(event.target.value),
                                    )
                                  }
                                />
                                <FieldError field={field} />
                              </div>
                            )}
                          </form.Field>

                          <form.Field name={`targeting[${index}].variation`}>
                            {(field: AnyFieldApi) => (
                              <div>
                                <label
                                  className="mb-1 block text-sm"
                                  htmlFor={field.name}
                                >
                                  Variation ที่ได้รับ
                                </label>
                                <select
                                  className={selectClassName}
                                  id={field.name}
                                  value={field.state.value as string}
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(event.target.value)
                                  }
                                >
                                  <option value="">เลือก variation</option>
                                  {variations
                                    .filter((variation) => variation.name)
                                    .map((variation) => (
                                      <option
                                        key={variation.id}
                                        value={variation.name}
                                      >
                                        {variation.name}
                                      </option>
                                    ))}
                                </select>
                                <FieldError field={field} />
                              </div>
                            )}
                          </form.Field>
                        </div>
                      </article>
                    ))}

                    <FieldError field={targetingField} />

                    <Button
                      type="button"
                      onClick={() => {
                        const target = newTargeting()
                        target.variation = variations[0]?.name ?? ''
                        targetingField.pushValue(target)
                      }}
                    >
                      <Plus /> เพิ่ม Targeting Rule
                    </Button>
                  </div>
                )
              }}
            </form.Field>
          )
        }}
      </form.Subscribe>
    </section>
  )
}

export default TargetingSection
