import { Button } from '#/components/ui/button'
import { RotateCcw, ShieldCheck } from 'lucide-react'
import JsonPreview from './components/json-preview'
import MetadataSection from './components/metadata-section'
import TargetingSection from './components/targeting-section'
import VariationsSection from './components/variations-section'
import { useFeatureFlagForm } from './lib/use-feature-flag-form'

function YourCode() {
  const form = useFeatureFlagForm()

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-6 px-4 pb-10 sm:px-6">
      <header>
        <p className="text-primary text-sm font-medium">Feature management</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Feature Flag Editor
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          สร้าง variations และ targeting rules พร้อมตรวจผลลัพธ์ JSON แบบ
          real-time
        </p>
      </header>

      <form
        className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(420px,0.8fr)]"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <div className="space-y-5">
          <div className="bg-card rounded-xl border p-5 shadow-sm">
            <MetadataSection form={form} />
          </div>

          <div className="bg-card rounded-xl border p-5 shadow-sm">
            <VariationsSection form={form} />
          </div>

          <div className="bg-card rounded-xl border p-5 shadow-sm">
            <TargetingSection form={form} />
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              <RotateCcw /> คืนค่าเริ่มต้น
            </Button>
            <Button type="submit">
              <ShieldCheck /> ตรวจสอบข้อมูล
            </Button>
          </div>
        </div>

        <div className="xl:sticky xl:top-4">
          <JsonPreview form={form} />
        </div>
      </form>
    </main>
  )
}

export default YourCode
