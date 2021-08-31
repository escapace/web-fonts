import { flatMap, values } from 'lodash-es'

const combination = <T>(collection: ArrayLike<T>, n: number) => {
  const array = values(collection)

  if (array.length < n) {
    return []
  }

  const recur = (array: T[], n: number) => {
    if (--n < 0) {
      return [[]]
    }

    const combinations: T[][] = []

    array = array.slice()

    while (array.length - n !== 0) {
      const value = array.shift() as T

      recur(array, n).forEach((combination) => {
        combination.unshift(value)
        combinations.push(combination)
      })
    }

    return combinations
  }

  return recur(array, n)
}

export const combinations = <T>(value: T[]) =>
  flatMap(value, (_, i, a) => combination(a, i + 1))
