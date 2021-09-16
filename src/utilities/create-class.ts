import { find, flatMap, map, uniq } from 'lodash-es'
import { State, TypeInferClass } from '../types'
import { combinations } from './combinations'
import { createBlock } from './create-block'
import { createFont } from './create-font'

export const createClass = (
  locale: string,
  className: string,
  value: TypeInferClass,
  state: State
) => {
  const newValue = {
    ...value,
    fonts: map(value.fonts, (value) => createFont(value, state))
  }

  const classWeight = newValue.fonts[0].weight
  const classStyle = newValue.fonts[0].style

  const resourceHint: string[] = flatMap(
    newValue.fonts,
    (value) => value.resourceHint
  )

  const fontFace: string[] = flatMap(newValue.fonts, (value) => value.fontFace)

  const selectorFallback = `html:lang(${locale}) .${className}`

  const style: string[] = []

  const noScriptStyle: string[] = [
    `${selectorFallback} { ${createBlock({
      family: [
        ...map(newValue.fonts, (value) => value.family),
        ...newValue.fallback
      ],
      weight: classWeight,
      style: classStyle
    })} }`
  ]

  if (newValue.fallback.length > 0) {
    style.push(
      `${selectorFallback} { ${createBlock({
        family: newValue.fallback,
        weight: classWeight,
        style: classStyle
      })} }`
    )
  }

  const comb = map(
    combinations(map(newValue.fonts, (value) => value.slug)),
    (value) =>
      map(
        value,
        (value) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          find(newValue.fonts, ({ slug }) => slug === value)!
      )
  )

  style.push(
    ...map(comb, (value) => {
      const selector = `html${map(
        value,
        ({ slug }) => `[data-fonts-loaded~='${slug}']`
      ).join('')}:lang(${locale}) .${className}`

      return `${selector} { ${createBlock({
        family: [...map(value, (value) => value.family), ...newValue.fallback],
        weight: newValue.fallback.length > 0 ? undefined : classWeight,
        style: newValue.fallback.length > 0 ? undefined : classStyle
      })} }`
    })
  )

  return {
    ...newValue,
    className,
    resourceHint: uniq(resourceHint),
    fontFace: uniq(fontFace),
    noScriptStyle: uniq(noScriptStyle),
    style: uniq(style)
  }
}
