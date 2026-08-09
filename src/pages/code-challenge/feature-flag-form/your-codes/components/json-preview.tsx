import { Editor } from '@monaco-editor/react'
import { CheckCircle2, CircleAlert } from 'lucide-react'
import { flagFormSchema } from '../lib/schema'
import type { FlagFormValues } from '../lib/schema'
import { toPreviewString } from '../lib/compile'
import type { FeatureFlagFormApi } from '../lib/use-feature-flag-form'

const JsonPreview = ({ form }: { form: FeatureFlagFormApi }) => {
  return (
    <form.Subscribe selector={(state) => state.values}>
      {(values) => {
        const result = flagFormSchema.safeParse(values)
        const issues = result.success ? [] : result.error.issues
        const preview = toPreviewString(values as FlagFormValues)

        return (
          <section className="overflow-hidden rounded-xl border bg-slate-950 text-slate-100 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-4 py-3">
              <div>
                <h2 className="font-medium">JSON Preview</h2>
                <p className="text-xs text-slate-400">
                  อัปเดตทันทีเมื่อค่าในฟอร์มเปลี่ยน
                </p>
              </div>
              {result.success ? (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle2 className="size-4" /> Valid
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-amber-400">
                  <CircleAlert className="size-4" /> {issues.length} issues
                </span>
              )}
            </div>

            <Editor
              height="560px"
              language="json"
              theme="vs-dark"
              value={preview}
              options={{
                automaticLayout: true,
                fontSize: 13,
                minimap: { enabled: false },
                readOnly: true,
                scrollBeyondLastLine: false,
                tabSize: 2,
              }}
            />

            {issues.length > 0 && (
              <div className="border-t border-slate-800 bg-slate-900 p-4">
                <p className="mb-2 text-xs font-medium text-amber-400">
                  ต้องแก้ก่อนนำ configuration ไปใช้
                </p>
                <ul className="space-y-1 text-xs text-slate-300">
                  {issues.slice(0, 5).map((issue, index) => (
                    <li key={`${issue.path.join('.')}-${index}`}>
                      <code className="text-sky-300">
                        {issue.path.join('.') || 'form'}
                      </code>{' '}
                      — {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )
      }}
    </form.Subscribe>
  )
}

export default JsonPreview
