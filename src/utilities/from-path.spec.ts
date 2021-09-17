import { assert } from 'chai'
import { fromPath } from './from-path'

describe('./src/utilities/from-path.spec.ts', function () {
  it('stringifys simple paths with single quotes', function () {
    assert.deepEqual(
      fromPath(['a']),
      'a',
      'incorrectly stringified single node'
    )
    assert.deepEqual(
      fromPath(['a', 'b', 'c']),
      'a.b.c',
      'incorrectly stringified multi-node'
    )
    assert.deepEqual(
      fromPath(['a'], "'"),
      'a',
      'incorrectly stringified single node with excplicit single quote'
    )
    assert.deepEqual(
      fromPath(['a', 'b', 'c'], "'"),
      'a.b.c',
      'incorrectly stringified multi-node with excplicit single quote'
    )
  })

  it('stringifys simple paths with double quotes', function () {
    assert.deepEqual(
      fromPath(['a'], '"'),
      'a',
      'incorrectly stringified single node'
    )
    assert.deepEqual(
      fromPath(['a', 'b', 'c'], '"'),
      'a.b.c',
      'incorrectly stringified multi-node'
    )
  })

  it('stringifys a numberic nodes in bracket notation with single quotes', function () {
    assert.deepEqual(
      fromPath(['5']),
      '[5]',
      'incorrectly stringified single headless numeric node'
    )
    assert.deepEqual(
      fromPath(['5', 'a', '3']),
      '[5].a[3]',
      'incorrectly stringified headless numeric multi-node'
    )
  })

  it('stringifys a numberic nodes in bracket notation with double quotes', function () {
    assert.deepEqual(
      fromPath(['5'], '"'),
      '[5]',
      'incorrectly stringified single headless numeric node'
    )
    assert.deepEqual(
      fromPath(['5', 'a', '3'], '"'),
      '[5].a[3]',
      'incorrectly stringified headless numeric multi-node'
    )
  })

  it('stringifys a combination of dot and bracket notation with single quotes', function () {
    assert.deepEqual(
      fromPath(['a', '1', 'b', 'c', 'd', 'e', 'f', 'g']),
      'a[1].b.c.d.e.f.g'
    )
    assert.deepEqual(
      fromPath(['a', '1', 'b', 'c', 'd', 'e', 'f', 'g'], undefined, true),
      "['a']['1']['b']['c']['d']['e']['f']['g']"
    )
  })

  it('stringifys a combination of dot and bracket notation with double quotes', function () {
    assert.deepEqual(
      fromPath(['a', '1', 'b', 'c', 'd', 'e', 'f', 'g'], '"'),
      'a[1].b.c.d.e.f.g'
    )
    assert.deepEqual(
      fromPath(['a', '1', 'b', 'c', 'd', 'e', 'f', 'g'], '"', true),
      '["a"]["1"]["b"]["c"]["d"]["e"]["f"]["g"]'
    )
  })

  it('stringifys unicode characters with single quotes', function () {
    assert.deepEqual(
      fromPath(['∑´ƒ©∫∆']),
      "['∑´ƒ©∫∆']",
      'incorrectly stringified single node path with unicode'
    )
    assert.deepEqual(
      fromPath(['∑´ƒ©∫∆', 'ø']),
      "['∑´ƒ©∫∆']['ø']",
      'incorrectly stringified multi-node path with unicode characters'
    )
  })

  it('stringifys unicode characters with double quotes', function () {
    assert.deepEqual(
      fromPath(['∑´ƒ©∫∆'], '"'),
      '["∑´ƒ©∫∆"]',
      'incorrectly stringified single node path with unicode'
    )
    assert.deepEqual(
      fromPath(['∑´ƒ©∫∆', 'ø'], '"'),
      '["∑´ƒ©∫∆"]["ø"]',
      'incorrectly stringified multi-node path with unicode characters'
    )
  })

  it('stringifys nodes with control characters and single quotes', function () {
    assert.deepEqual(
      fromPath(['a.b.'], "'"),
      "['a.b.']",
      'incorrectly stringified dots from inside brackets'
    )
    assert.deepEqual(
      fromPath(["'", '\\"'], "'"),
      "['\\'']['\\\\\"']",
      'incorrectly stringified escaped quotes'
    )
    assert.deepEqual(
      fromPath(['"', "'"], "'"),
      "['\"']['\\'']",
      'incorrectly stringified unescaped quotes'
    )
    assert.deepEqual(
      fromPath(["\\'", '\\"'], "'"),
      "['\\\\\\'']['\\\\\"']",
      'incorrectly stringified escape character'
    )
    assert.deepEqual(
      fromPath(['["a"]', "[\\'a\\']"], "'"),
      "['[\"a\"]']['[\\\\\\'a\\\\\\']']",
      'incorrectly stringified escape character'
    )
  })

  it('stringifys nodes with backslash', function () {
    const originalProperty = ' \\" \\\\" \\\\\\'
    const path = fromPath([' \\" \\\\" \\\\\\'], '"')
    const finalProperty = JSON.parse(path.substring(1, path.length - 1))

    assert.deepEqual(
      finalProperty,
      originalProperty,
      'incorrectly stringified escaped backslash'
    )
  })

  it('stringifys nodes with control characters and double quotes', function () {
    assert.deepEqual(
      fromPath(['a.b.'], '"'),
      '["a.b."]',
      'incorrectly stringified dots from inside brackets'
    )
    assert.deepEqual(
      fromPath(['"', "\\'"], '"'),
      '["\\""]["\\\\\'"]',
      'incorrectly stringified escaped quotes'
    )
    assert.deepEqual(
      fromPath(["'", '"'], '"'),
      '["\'"]["\\""]',
      'incorrectly stringified unescaped quotes'
    )
    assert.deepEqual(
      fromPath(['\\"', "\\'"], '"'),
      '["\\\\\\""]["\\\\\'"]',
      'incorrectly stringified escape character'
    )
    assert.deepEqual(
      fromPath(["['a']", '[\\"a\\"]'], '"'),
      '["[\'a\']"]["[\\\\\\"a\\\\\\"]"]',
      'incorrectly stringified escape character'
    )
  })
})
