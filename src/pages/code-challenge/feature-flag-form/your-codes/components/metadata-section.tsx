import { Input } from '#/components/ui/input'
import type { AnyFieldApi } from '@tanstack/react-form'
import { FieldError } from './field-error'
import type { FeatureFlagFormApi } from '../lib/use-feature-flag-form'

const MetadataSection = ({ form }: { form: FeatureFlagFormApi }) => {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">ข้อมูล Flag</h2>

      {/* ---------- 1. ชื่อ flag — ตัวอย่าง ---------- */}
      <form.Field name="name">
        {(field: AnyFieldApi) => (
          <div>
            <label className="mb-1 block text-sm" htmlFor={field.name}>
              ชื่อ Flag
            </label>
            <Input
              id={field.name}
              name={field.name}
              placeholder="my-new-feature"
              value={(field.state.value as string | undefined) ?? ''}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldError field={field} />
          </div>
        )}
      </form.Field>

      <form.Field name="description">
        {(field: AnyFieldApi) => (
          <div>
            <label className="mb-1 block text-sm" htmlFor={field.name}>
              คำอธิบาย
            </label>
            <Input
              id={field.name}
              name={field.name}
              placeholder="เปิดระบบใหม่สำหรับผู้ใช้กลุ่ม Beta"
              value={(field.state.value as string | undefined) ?? ''}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldError field={field} />
          </div>
        )}
      </form.Field>

      <form.Field name="enabled">
        {(field: AnyFieldApi) => (
          <div className="flex gap-2">
            <input
              id={field.name}
              type="checkbox"
              checked={field.state.value as boolean}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.checked)}
            />
            <label htmlFor={field.name}>เปิดใช้งาน Flag</label>
          </div>
        )}
      </form.Field>
    </section>
  )
}

export default MetadataSection
