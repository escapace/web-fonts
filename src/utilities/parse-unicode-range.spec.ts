import { expect } from 'chai'
import { parseUnicodeRange } from './parse-unicode-range'

describe('./src/utilities/parse-unicode-range.spec.ts', () => {
  it('parses an empty string', () => {
    const cs = parseUnicodeRange('')

    expect(cs.size).to.eql(0)
    expect(cs.data).to.eql({})
  })

  it('parses a single value', () => {
    const cs = parseUnicodeRange('u+23,U+23')

    expect(cs.size).to.eql(1)
    expect(cs.data).to.eql({
      35: true
    })
  })

  it('parses multiple values', () => {
    const cs = parseUnicodeRange('u+23, u+22')

    expect(cs.size).to.eql(2)
    expect(cs.data).to.eql({
      34: true,
      35: true
    })
  })

  it('parses ranges', () => {
    const cs = parseUnicodeRange('u+22-25')

    expect(cs.size).to.eql(4)
    expect(cs.data).to.eql({
      34: true,
      35: true,
      36: true,
      37: true
    })
  })

  it('parses multiple ranges', () => {
    const cs = parseUnicodeRange('u+22-24, u+25-28')

    expect(cs.data).to.eql({
      34: true,
      35: true,
      36: true,
      37: true,
      38: true,
      39: true,
      40: true
    })
  })

  it('parses wildcards', () => {
    const cs = parseUnicodeRange('u+1?')

    expect(cs.data).to.eql({
      16: true,
      17: true,
      18: true,
      19: true,
      20: true,
      21: true,
      22: true,
      23: true,
      24: true,
      25: true,
      26: true,
      27: true,
      28: true,
      29: true,
      30: true,
      31: true
    })
  })
})
