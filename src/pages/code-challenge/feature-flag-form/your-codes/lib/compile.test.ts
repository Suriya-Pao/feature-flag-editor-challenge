import { describe, expect, it } from 'vitest'
import { buildFlagJson, castVariationValue, compileCondition } from './compile'
import type { FlagFormValues, Group, Variation } from './schema'

describe('castVariationValue', () => {
  it.each([
    [{ type: 'boolean', value: 'true' }, true],
    [{ type: 'boolean', value: 'false' }, false],
    [{ type: 'number', value: '42' }, 42],
    [{ type: 'string', value: 'hello' }, 'hello'],
  ] as const)('casts $type values', (input, expected) => {
    const variation: Variation = {
      id: 'variation',
      name: 'example',
      ...input,
    }

    expect(castVariationValue(variation)).toBe(expected)
  })
})

describe('compileCondition', () => {
  it('compiles nested AND/OR groups with parentheses', () => {
    const condition: Group = {
      id: 'root',
      kind: 'group',
      logic: 'and',
      children: [
        {
          id: 'group-rule',
          kind: 'rule',
          field: 'group',
          operator: 'eq',
          value: 'beta',
        },
        {
          id: 'nested',
          kind: 'group',
          logic: 'or',
          children: [
            {
              id: 'role-rule',
              kind: 'rule',
              field: 'role',
              operator: 'eq',
              value: 'admin',
            },
            {
              id: 'country-rule',
              kind: 'rule',
              field: 'country',
              operator: 'eq',
              value: 'TH',
            },
          ],
        },
      ],
    }

    expect(compileCondition(condition)).toBe(
      '(group == "beta" and (role == "admin" or country == "TH"))',
    )
  })
})

describe('buildFlagJson', () => {
  it('builds variations, targeting, default rule and disabled state', () => {
    const values: FlagFormValues = {
      name: 'new-checkout',
      description: 'Checkout for beta users',
      enabled: false,
      variations: [
        { id: 'on', name: 'on', type: 'boolean', value: 'true' },
        { id: 'off', name: 'off', type: 'boolean', value: 'false' },
      ],
      targeting: [
        {
          id: 'target',
          condition: {
            id: 'condition',
            kind: 'group',
            logic: 'and',
            children: [
              {
                id: 'rule',
                kind: 'rule',
                field: 'group',
                operator: 'eq',
                value: 'beta',
              },
            ],
          },
          percentage: 30,
          variation: 'on',
        },
      ],
      defaultVariation: 'off',
    }

    expect(buildFlagJson(values)).toEqual({
      flags: {
        'new-checkout': {
          description: 'Checkout for beta users',
          variations: { on: true, off: false },
          targeting: [
            {
              query: 'group == "beta"',
              percentage: 30,
              variation: 'on',
            },
          ],
          defaultRule: { variation: 'off' },
          disable: true,
        },
      },
    })
  })
})
