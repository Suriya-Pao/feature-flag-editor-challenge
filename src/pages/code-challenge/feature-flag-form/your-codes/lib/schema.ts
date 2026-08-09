import { z } from 'zod'

/* ------------------------------------------------------------------ *
 * Condition tree
 *
 * รูปแบบข้อมูลใน "ฟอร์ม" ไม่เหมือน JSON ที่ output ออกไป
 * ฟอร์มเก็บเป็น tree เพื่อให้ซ้อนกลุ่มได้ไม่จำกัดชั้น
 * แล้วค่อย compile เป็น query string ตอนสร้าง output (ดู compile.ts)
 * ------------------------------------------------------------------ */

export const OPERATORS = {
  eq: '==',
  neq: '!=',
  gt: '>',
  lt: '<',
  contains: 'co',
  startsWith: 'sw',
  in: 'in',
} as const

export type OperatorKey = keyof typeof OPERATORS

/** field ที่ให้ผู้ใช้เลือกได้ — เพิ่มตรงนี้ที่เดียว UI จะตามเอง */
export const TARGET_FIELDS = [
  'group',
  'role',
  'email',
  'country',
  'company',
  'anonymous',
] as const

export const ruleSchema = z.object({
  id: z.string(),
  kind: z.literal('rule'),
  field: z.string().min(1, 'เลือก field ก่อน'),
  operator: z.enum(
    Object.keys(OPERATORS) as [OperatorKey, ...Array<OperatorKey>],
  ),
  value: z.string().min(1, 'ใส่ค่าที่ต้องการเทียบ'),
})

export type Rule = z.infer<typeof ruleSchema>

export type Group = {
  id: string
  kind: 'group'
  logic: 'and' | 'or'
  children: Array<Condition>
}

export type Condition = Rule | Group

/**
 * Group อ้างถึง conditionSchema ที่ยังไม่ถูกประกาศ — วนกันเอง
 *
 * runtime: getter แก้ให้ เพราะ getter ถูกเรียกตอน validate ไม่ใช่ตอนประกาศ
 * TypeScript: getter อย่างเดียวไม่พอ tsc จะฟ้อง TS7023 / TS2615
 *             ต้องใส่ return type ให้ getter ด้วย เพื่อตัดวงจร inference
 *
 * ประกาศ type Condition ด้วยมือข้างบน แทนที่จะใช้ z.infer
 * เพราะ z.infer ต้องรอ schema ซึ่งก็ต้องรอ type — วนอีกเหมือนกัน
 */
export const groupSchema = z.object({
  id: z.string(),
  kind: z.literal('group'),
  logic: z.enum(['and', 'or']),
  get children(): z.ZodArray<z.ZodType<Condition, Condition>> {
    return z
      .array(conditionSchema)
      .min(1, 'กลุ่มนี้ยังว่าง เพิ่มเงื่อนไขอย่างน้อย 1 ข้อ')
  },
})

export const conditionSchema: z.ZodType<Condition, Condition> =
  z.discriminatedUnion('kind', [ruleSchema, groupSchema])

/* ------------------------------------------------------------------ *
 * Variations
 * ------------------------------------------------------------------ */

export const variationSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, 'ตั้งชื่อ variation')
    .regex(/^[a-zA-Z0-9_-]+$/, 'ใช้ได้เฉพาะ a-z, 0-9, - และ _'),
  type: z.enum(['boolean', 'string', 'number']),
  value: z.string().min(1, 'ใส่ค่าของ variation'),
})

export type Variation = z.infer<typeof variationSchema>

/* ------------------------------------------------------------------ *
 * Targeting entry — 1 แถว = 1 เงื่อนไข ที่ชี้ไป 1 variation
 * ------------------------------------------------------------------ */

export const targetingSchema = z.object({
  id: z.string(),
  condition: groupSchema,
  percentage: z.number().int().min(0, 'ต่ำสุด 0').max(100, 'สูงสุด 100'),
  variation: z.string().min(1, 'เลือก variation ที่จะให้'),
})

export type Targeting = z.infer<typeof targetingSchema>

/* ------------------------------------------------------------------ *
 * Root form schema
 * ------------------------------------------------------------------ */

export const flagFormSchema = z
  .object({
    name: z
      .string()
      .min(1, 'ตั้งชื่อ flag')
      .regex(/^[a-zA-Z0-9_-]+$/, 'ใช้ได้เฉพาะ a-z, 0-9, - และ _'),
    description: z.string().optional(),
    enabled: z.boolean(),
    variations: z.array(variationSchema).min(2, 'ต้องมีอย่างน้อย 2 variations'),
    targeting: z.array(targetingSchema),
    defaultVariation: z
      .string()
      .min(1, 'เลือก variation สำหรับคนที่ไม่เข้าเงื่อนไขไหนเลย'),
  })
  /** ตรวจข้ามฟิลด์: ชื่อ variation ห้ามซ้ำ */
  .superRefine((data, ctx) => {
    const seen = new Set<string>()
    data.variations.forEach((v, i) => {
      if (seen.has(v.name)) {
        ctx.addIssue({
          code: 'custom',
          path: ['variations', i, 'name'],
          message: `ชื่อ "${v.name}" ถูกใช้ไปแล้ว`,
        })
      }
      seen.add(v.name)
    })

    /** targeting / default ต้องชี้ไป variation ที่มีอยู่จริง */
    data.targeting.forEach((t, i) => {
      if (t.variation && !seen.has(t.variation)) {
        ctx.addIssue({
          code: 'custom',
          path: ['targeting', i, 'variation'],
          message: `ไม่พบ variation ชื่อ "${t.variation}"`,
        })
      }
    })

    if (data.defaultVariation && !seen.has(data.defaultVariation)) {
      ctx.addIssue({
        code: 'custom',
        path: ['defaultVariation'],
        message: `ไม่พบ variation ชื่อ "${data.defaultVariation}"`,
      })
    }
  })

export type FlagFormValues = z.input<typeof flagFormSchema>

/* ------------------------------------------------------------------ *
 * Factories — ทุก node ต้องมี id ของตัวเอง
 * ใช้เป็น React key เวลา map array ถ้าใช้ index แทน
 * พอลบ node กลางๆ React จะ reuse DOM ผิดตัว ค่าในช่องจะสลับกันเอง
 * ------------------------------------------------------------------ */

const uid = () => Math.random().toString(36).slice(2, 10)

export const newRule = (): Rule => ({
  id: uid(),
  kind: 'rule',
  field: 'group',
  operator: 'eq',
  value: '',
})

export const newGroup = (): Group => ({
  id: uid(),
  kind: 'group',
  logic: 'and',
  children: [newRule()],
})

export const newVariation = (): Variation => ({
  id: uid(),
  name: '',
  type: 'boolean',
  value: 'true',
})

export const newTargeting = (): Targeting => ({
  id: uid(),
  condition: newGroup(),
  percentage: 100,
  variation: '',
})

export const emptyFlag = (): FlagFormValues => ({
  name: '',
  description: '',
  enabled: true,
  variations: [
    { id: uid(), name: 'on', type: 'boolean', value: 'true' },
    { id: uid(), name: 'off', type: 'boolean', value: 'false' },
  ],
  targeting: [],
  defaultVariation: 'off',
})
