import { assert } from 'chai'
import { combinations } from './combinations'

describe('src/utilities/combinations.spec.ts', () => {
  it('combinations', () => {
    assert.deepEqual(combinations(['a', 'b', 'c', 'd']), [
      ['a'],
      ['b'],
      ['c'],
      ['d'],
      ['a', 'b'],
      ['a', 'c'],
      ['a', 'd'],
      ['b', 'c'],
      ['b', 'd'],
      ['c', 'd'],
      ['a', 'b', 'c'],
      ['a', 'b', 'd'],
      ['a', 'c', 'd'],
      ['b', 'c', 'd'],
      ['a', 'b', 'c', 'd']
    ])
  })
})
