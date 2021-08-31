import { includes } from 'lodash-es'
import { WEIGHTS } from '../constants'

export const weightName = (weight: number) =>
  includes(WEIGHTS, weight)
    ? {
        100: 'thin',
        200: 'extra-light',
        300: 'light',
        400: undefined,
        500: 'medium',
        600: 'semi bold',
        700: 'bold',
        800: 'extra bold',
        900: 'black'
      }[weight]
    : weight
