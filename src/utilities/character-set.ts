/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unnecessary-boolean-literal-compare */
/* eslint-disable @typescript-eslint/prefer-for-of */

export class CharacterSet {
  size = 0
  data: Record<number, boolean> = {}

  add(...args: number[]) {
    for (let i = 0; i < args.length; i += 1) {
      const codePoint = args[i]

      if (this.data[codePoint] !== true) {
        this.data[codePoint] = true
        this.size += 1
      }
    }
  }

  constructor(input?: string | number | Array<number | [number, number]>) {
    if (typeof input === 'string') {
      for (let i = 0; i < input.length; i += 1) {
        const codePoint = input.charCodeAt(i)

        if ((codePoint & 0xf800) === 0xd800 && i < input.length) {
          const nextCodePoint = input.charCodeAt(i + 1)
          if ((nextCodePoint & 0xfc00) === 0xdc00) {
            this.add(
              ((codePoint & 0x3ff) << 10) + (nextCodePoint & 0x3ff) + 0x10000
            )
          } else {
            this.add(codePoint)
          }
          i += 1
        } else {
          this.add(codePoint)
        }
      }
    } else if (typeof input === 'number') {
      this.add(input)
    } else if (Array.isArray(input)) {
      const value = this.expandRange(input)

      for (let i = 0; i < value.length; i += 1) {
        this.add(value[i])
      }
    }
  }

  toArray() {
    const result: number[] = []

    for (const codePoint in this.data) {
      if (
        // this.data.hasOwnProperty(codePoint) &&
        this.data[codePoint] === true
      ) {
        result.push(parseInt(codePoint, 10))
      }
    }

    result.sort(function (a, b) {
      return a - b
    })

    return result
  }

  compressRange(codePoints: number[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any[] = []

    for (let i = 0; i < codePoints.length; i += 1) {
      const previous = i > 0 ? codePoints[i - 1] : null
      const next = i < codePoints.length - 1 ? codePoints[i + 1] : null
      const current = codePoints[i]

      if (
        (current - 1 !== previous || previous === null) &&
        (current + 1 !== next || next === null)
      ) {
        result.push(current)
      } else if (
        (current - 1 !== previous || previous === null) &&
        (current + 1 === next || next === null)
      ) {
        result.push(current)
      } else if (
        (current - 1 === previous || previous === null) &&
        (current + 1 !== next || next === null)
      ) {
        // Don't bother collapsing the range if the range only consists of two adjacent code points
        if (current - result[result.length - 1] > 1) {
          result[result.length - 1] = [result[result.length - 1], current] as [
            number,
            number
          ]
        } else {
          result.push(current)
        }
      }
    }

    return result as Array<number | [number, number]>
  }

  toRange() {
    return this.compressRange(this.toArray())
  }

  toHexRangeString() {
    return this.toRange()
      .map(function (value) {
        if (Array.isArray(value)) {
          return (
            'U+' +
            value[0].toString(16).toUpperCase() +
            '-' +
            value[1].toString(16).toUpperCase()
          )
        } else {
          return 'U+' + value.toString(16).toUpperCase()
        }
      })
      .join(',')
  }

  getSize() {
    return this.size
  }

  expandRange(range: Array<number | [number, number]>) {
    const result: number[] = []

    for (let i = 0; i < range.length; i += 1) {
      const current = range[i]

      if (Array.isArray(current)) {
        for (let j = current[0]; j < current[1] + 1; j += 1) {
          result.push(j)
        }
      } else {
        result.push(current)
      }
    }

    return result
  }

  isEmpty() {
    return this.size === 0
  }
}
