import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import type { AnyFieldApi } from '@tanstack/react-form'
import { Plus, Trash2 } from 'lucide-react'
import { FieldError } from './field-error'
import { newVariation } from '../lib/schema'
import type { Variation } from '../lib/schema'
import type { FeatureFlagFormApi } from '../lib/use-feature-flag-form'

const selectClassName =
  'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3'

const VariationsSection = ({ form }: { form: FeatureFlagFormApi }) => {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Variations</h2>
        <p className="text-muted-foreground text-sm">
          กำหนดค่าที่ flag สามารถส่งกลับได้อย่างน้อย 2 ค่า
        </p>
      </div>

      <form.Field name="variations" mode="array">
        {(variationsField: AnyFieldApi) => {
          const variations = variationsField.state.value as Variation[]

          return (
            <div className="space-y-3">
              {variations.map((variation, index) => (
                <div
                  className="bg-muted/30 grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_150px_1fr_auto]"
                  key={variation.id}
                >
                  <form.Field name={`variations[${index}].name`}>
                    {(field: AnyFieldApi) => (
                      <div>
                        <label
                          className="mb-1 block text-xs"
                          htmlFor={field.name}
                        >
                          ชื่อ
                        </label>
                        <Input
                          id={field.name}
                          value={field.state.value as string}
                          placeholder="beta"
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                        />
                        <FieldError field={field} />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name={`variations[${index}].type`}>
                    {(field: AnyFieldApi) => (
                      <div>
                        <label
                          className="mb-1 block text-xs"
                          htmlFor={field.name}
                        >
                          ชนิดข้อมูล
                        </label>
                        <select
                          className={selectClassName}
                          id={field.name}
                          value={field.state.value as Variation['type']}
                          onBlur={field.handleBlur}
                          onChange={(event) => {
                            const type = event.target.value as Variation['type']
                            field.handleChange(type)
                            form.setFieldValue(
                              `variations[${index}].value`,
                              type === 'boolean' ? 'true' : '',
                            )
                          }}
                        >
                          <option value="boolean">boolean</option>
                          <option value="string">string</option>
                          <option value="number">number</option>
                        </select>
                        <FieldError field={field} />
                      </div>
                    )}
                  </form.Field>

                  <form.Subscribe
                    selector={(state) => state.values.variations[index]?.type}
                  >
                    {(typeValue) => {
                      const type = typeValue as Variation['type']

                      return (
                        <form.Field name={`variations[${index}].value`}>
                          {(field: AnyFieldApi) => (
                            <div>
                              <label
                                className="mb-1 block text-xs"
                                htmlFor={field.name}
                              >
                                ค่า
                              </label>
                              {type === 'boolean' ? (
                                <select
                                  className={selectClassName}
                                  id={field.name}
                                  value={field.state.value as string}
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(event.target.value)
                                  }
                                >
                                  <option value="true">true</option>
                                  <option value="false">false</option>
                                </select>
                              ) : (
                                <Input
                                  id={field.name}
                                  type={type === 'number' ? 'number' : 'text'}
                                  value={field.state.value as string}
                                  placeholder={
                                    type === 'number' ? '100' : 'value'
                                  }
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(event.target.value)
                                  }
                                />
                              )}
                              <FieldError field={field} />
                            </div>
                          )}
                        </form.Field>
                      )
                    }}
                  </form.Subscribe>

                  <Button
                    aria-label={`ลบ variation ${variation.name || index + 1}`}
                    className="self-end"
                    disabled={variations.length <= 2}
                    size="icon"
                    type="button"
                    variant="destructive"
                    onClick={() => variationsField.removeValue(index)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}

              <FieldError field={variationsField} />

              <Button
                type="button"
                variant="outline"
                onClick={() => variationsField.pushValue(newVariation())}
              >
                <Plus /> เพิ่ม Variation
              </Button>
            </div>
          )
        }}
      </form.Field>

      <form.Subscribe selector={(state) => state.values.variations}>
        {(variationsValue) => {
          const variations = (variationsValue ?? []) as Variation[]

          return (
            <form.Field name="defaultVariation">
              {(field: AnyFieldApi) => (
                <div className="max-w-sm">
                  <label className="mb-1 block text-sm" htmlFor={field.name}>
                    Default variation
                  </label>
                  <select
                    className={selectClassName}
                    id={field.name}
                    value={field.state.value as string}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  >
                    <option value="">เลือก variation</option>
                    {variations
                      .filter((variation) => variation.name)
                      .map((variation) => (
                        <option key={variation.id} value={variation.name}>
                          {variation.name}
                        </option>
                      ))}
                  </select>
                  <FieldError field={field} />
                </div>
              )}
            </form.Field>
          )
        }}
      </form.Subscribe>
    </section>
  )
}

export default VariationsSection
