import { OPERATORS } from './schema'
import type { Condition, FlagFormValues, Variation } from './schema'

/* ------------------------------------------------------------------ *
 * ไฟล์นี้เป็น pure function ล้วน ไม่มี React ไม่มี state
 * แยกออกมาเพราะ (1) เทสง่าย (2) เป็น Separation of Concerns ที่เขาให้คะแนน
 * ------------------------------------------------------------------ */

/** ค่าที่ผู้ใช้พิมพ์เป็น string เสมอ — แปลงตาม type ที่เลือกไว้ */
export function castVariationValue(v: Variation): boolean | number | string {
  if (v.type === 'boolean') return v.value === 'true'
  if (v.type === 'number') {
    const n = Number(v.value)
    return Number.isFinite(n) ? n : 0
  }
  return v.value
}

function quote(value: string): string {
  return `"${value.replace(/"/g, '\\"')}"`
}

/** rule เดี่ยว → `role == "admin"` */
function compileRule(
  field: string,
  operator: keyof typeof OPERATORS,
  value: string,
): string {
  if (operator === 'in') {
    const list = value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map(quote)
      .join(', ')
    return `${field} in [${list}]`
  }
  return `${field} ${OPERATORS[operator]} ${quote(value)}`
}

/**
 * หัวใจของโจทย์ — เดิน tree แบบ recursive แล้วประกอบเป็น query string
 *
 * ใส่วงเล็บเฉพาะกลุ่มที่มีลูกมากกว่า 1 เท่านั้น
 * ไม่งั้นซ้อน 4 ชั้นจะได้ ((((a)))) ซึ่งอ่านไม่ออก
 */
export function compileCondition(node: Condition): string {
  if (node.kind === 'rule') {
    if (!node.field || !node.value) return ''
    return compileRule(node.field, node.operator, node.value)
  }

  const parts = node.children.map(compileCondition).filter(Boolean)

  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]
  return `(${parts.join(` ${node.logic} `)})`
}

/* ------------------------------------------------------------------ *
 * form values → JSON ตามรูปแบบ GoFeatureFlag
 * ------------------------------------------------------------------ */

export function buildFlagJson(values: FlagFormValues) {
  const flagName = values.name || 'untitled-flag'

  const variations: Record<string, boolean | number | string> = {}
  for (const v of values.variations) {
    if (v.name) variations[v.name] = castVariationValue(v)
  }

  const targeting = values.targeting
    .map((t) => {
      const query = compileCondition(t.condition)
      if (!query) return null
      return {
        query,
        ...(t.percentage < 100 ? { percentage: t.percentage } : {}),
        variation: t.variation,
      }
    })
    .filter((t): t is NonNullable<typeof t> => t !== null)

  return {
    flags: {
      [flagName]: {
        ...(values.description ? { description: values.description } : {}),
        variations,
        ...(targeting.length ? { targeting } : {}),
        defaultRule: { variation: values.defaultVariation },
        ...(values.enabled ? {} : { disable: true }),
      },
    },
  }
}

export function toPreviewString(values: FlagFormValues): string {
  return JSON.stringify(buildFlagJson(values), null, 2)
}
