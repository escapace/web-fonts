import { find, flatMap, forEach, map, uniq } from 'lodash-es'
import { TypeInferClass } from '../schema'
import { combinations } from './combinations'
import { createBlock } from './create-block'
import { createFont } from './create-font'

export const createClass = (
  locale: string,
  className: string,
  value: TypeInferClass
) => {
  const newValue = {
    ...value,
    fonts: map(value.fonts, (value) => createFont(value))
  }

  const classWeight = newValue.fonts[0].weight
  const classStyle = newValue.fonts[0].style

  const resourceHint: string[] = uniq(
    flatMap(newValue.fonts, (value) => value.resourceHint)
  )

  const fontFace: string[] = uniq(
    flatMap(newValue.fonts, (value) => value.fontFace)
  )

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

  forEach(comb, (value) => {
    const selector = `html${map(
      value,
      ({ slug }) => `[data-fonts-loaded~='${slug}']`
    ).join('')}:lang(${locale}) .${className}`

    const block = `${selector} { ${createBlock({
      family: [...map(value, (value) => value.family), ...newValue.fallback],
      weight: newValue.fallback.length > 0 ? undefined : classWeight,
      style: newValue.fallback.length > 0 ? undefined : classStyle
    })} }`

    style.push(block)
  })

  return {
    ...newValue,
    className,
    resourceHint,
    fontFace,
    noScriptStyle,
    style
  }
}
