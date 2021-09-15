import { expect } from 'chai'
import { CharacterSet } from './character-set'

describe('./src/utilities/character-set.spec.ts', () => {
  describe('#constructor', () => {
    it('should create a CharacterSet instance with a single code point', () => {
      const cs = new CharacterSet(1)

      expect(cs.data).to.eql({ 1: true })
    })

    it('should create a CharacterSet instance from an ASCII string', () => {
      const cs = new CharacterSet('abc')

      expect(cs.data).to.eql({
        97: true,
        98: true,
        99: true
      })
    })

    it('should create a CharacterSet instance from a BMP string', () => {
      const cs = new CharacterSet('中国')

      expect(cs.data).to.eql({
        20013: true,
        22269: true
      })
    })

    it('should create a CharacterSet instance from a string containing surrogate pairs', () => {
      const cs = new CharacterSet('a\uD834\uDF06bc')

      expect(cs.data).to.eql({
        97: true,
        98: true,
        99: true,
        119558: true
      })
    })

    // it('should create a CharacterSet from a range', () => {
    //   const cs = new CharacterSet([1, 2])

    //   expect(cs).not.to.be(null)
    //   expect(cs.data).to.eql({
    //     1: true,
    //     2: true
    //   })
    // })

    // it('should create a CharacterSet from a compressed range', () => {
    //   const cs = new CharacterSet([1, [3, 5], 6])

    //   expect(cs).not.to.be(null)
    //   expect(cs.data).to.eql({
    //     1: true,
    //     3: true,
    //     4: true,
    //     5: true,
    //     6: true
    //   })
    // })
  })

  describe('#getSize', () => {
    it('should return zero on an empty character set', () => {
      const cs = new CharacterSet()

      expect(cs.getSize()).to.eql(0)
    })

    // it('should return the correct size with single code points', () => {
    //   const cs = new CharacterSet([1, 2])

    //   expect(cs.getSize()).to.eql(2)
    // })

    // it('should return the correct size with ranges', () => {
    //   const cs = new CharacterSet([[1, 5]])

    //   expect(cs.getSize()).to.eql(5)
    // })

    it('should return the correct size for a string', () => {
      const cs = new CharacterSet('hello world')

      expect(cs.getSize()).to.eql(8)
    })

    it('should return the correct size with surrogate pairs', () => {
      const cs = new CharacterSet('\uD834\uDF06')

      expect(cs.getSize()).to.eql(1)
    })

    // it('should maintain the correct size when removing code points', () => {
    //   const cs = new CharacterSet([1, 2, 3])

    //   expect(cs.getSize()).to.eql(3)

    //   cs.remove(3)
    //   expect(cs.getSize()).to.eql(2)
    // })

    it('should maintain the correct size when adding code points', () => {
      const cs = new CharacterSet()

      expect(cs.getSize()).to.eql(0)

      cs.add(1)
      expect(cs.getSize()).to.eql(1)
    })
  })

  // describe('#equals', () => {
  //   it('should consider two empty character sets equal', () => {
  //     const a = new CharacterSet()
  //     const b = new CharacterSet()

  //     expect(a.equals(b)).to.be(true)
  //     expect(b.equals(a)).to.be(true)
  //   })

  //   it('should consider two identical non-empty character sets equal', () => {
  //     const a = new CharacterSet(200)
  //     const b = new CharacterSet(200)

  //     expect(a.equals(b)).to.be(true)
  //     expect(b.equals(a)).to.be(true)
  //   })

  //   it('should consider two different character sets to be unequal', () => {
  //     const a = new CharacterSet(200)
  //     const b = new CharacterSet(404)

  //     expect(a.equals(b)).to.be(false)
  //     expect(b.equals(a)).to.be(false)
  //   })
  // })

  // describe('#expandRange', () => {
  //   it('should not expand non ranges', () => {
  //     const cs = new CharacterSet()

  //     expect(cs.expandRange([1, 2, 3])).to.eql([1, 2, 3])
  //   })

  //   it('should expand a single range', () => {
  //     const cs = new CharacterSet()

  //     expect(cs.expandRange([[1, 4]])).to.eql([1, 2, 3, 4])
  //   })

  //   it('should expand multiple ranges', () => {
  //     const cs = new CharacterSet()

  //     expect(
  //       cs.expandRange([
  //         [1, 4],
  //         [5, 8]
  //       ])
  //     ).to.eql([1, 2, 3, 4, 5, 6, 7, 8])
  //   })

  //   it('should expand ranges and non ranges', () => {
  //     const cs = new CharacterSet()

  //     expect(cs.expandRange([[1, 2], 3, 4, [5, 8]])).to.eql([
  //       1, 2, 3, 4, 5, 6, 7, 8
  //     ])
  //   })
  // })

  describe('#compressRange', () => {
    it('should not compress non continuous code points', () => {
      const cs = new CharacterSet()

      expect(cs.compressRange([1, 3, 5])).to.eql([1, 3, 5])
    })

    it('should compress a single range', () => {
      const cs = new CharacterSet()

      expect(cs.compressRange([1, 2, 3])).to.eql([[1, 3]])
    })

    it('should not compress a range only consisting of two code points', () => {
      const cs = new CharacterSet()

      expect(cs.compressRange([1, 2])).to.eql([1, 2])
    })

    it('should compress multiple ranges', () => {
      const cs = new CharacterSet()

      expect(cs.compressRange([1, 2, 3, 5, 6, 7])).to.eql([
        [1, 3],
        [5, 7]
      ])
    })

    it('should compress multiple ranges and single code points', () => {
      const cs = new CharacterSet()

      expect(cs.compressRange([1, 2, 3, 5, 7, 8, 9, 11])).to.eql([
        [1, 3],
        5,
        [7, 9],
        11
      ])
    })
  })

  describe('#toArray', () => {
    it('should return the correct code points', () => {
      const cs = new CharacterSet([1, 2])

      expect(cs.toArray()).to.eql([1, 2])
    })

    it('should return the correct code points in sorted order', () => {
      const cs = new CharacterSet([2, 1, 3, 0])

      expect(cs.toArray()).to.eql([0, 1, 2, 3])
    })

    it('should sort numerically instead of lexicographical', () => {
      const cs = new CharacterSet([7, 40, 300])

      expect(cs.toArray()).to.eql([7, 40, 300])
    })
  })

  describe('#toRange', () => {
    it('should return a range', () => {
      const cs = new CharacterSet([1, [2, 4], 5])

      expect(cs.toRange()).to.eql([[1, 5]])
    })
  })

  describe('#isEmpty', () => {
    it('should return true when empty', () => {
      const cs = new CharacterSet()

      expect(cs.isEmpty()).to.eql(true)
    })

    it('should return false when not empty', () => {
      const cs = new CharacterSet(119558)

      expect(cs.isEmpty()).to.eql(false)
    })
  })

  // describe('#add', () => {
  //   let cs = null

  //   beforeEach(() => {
  //     cs = new CharacterSet()
  //   })

  //   it('should add a single code point', () => {
  //     cs.add(1)

  //     expect(cs.size).to.eql(1)
  //     expect(cs.data).to.eql({
  //       1: true
  //     })
  //   })

  //   it('should add another code point', () => {
  //     cs.add(1)
  //     cs.add(2)

  //     expect(cs.size).to.eql(2)
  //     expect(cs.data).to.eql({
  //       1: true,
  //       2: true
  //     })
  //   })

  //   it('should not add the same code point twice', () => {
  //     cs.add(1)
  //     cs.add(2)
  //     cs.add(1)

  //     expect(cs.size).to.eql(2)
  //     expect(cs.data).to.eql({
  //       1: true,
  //       2: true
  //     })
  //   })

  //   it('should add multiple code points at the same time', () => {
  //     cs.add(1, 2)

  //     expect(cs.size).to.eql(2)
  //     expect(cs.data).to.eql({
  //       1: true,
  //       2: true
  //     })
  //   })

  //   it('should only add a single code point if they are the same', () => {
  //     cs.add(1, 1)

  //     expect(cs.size).to.eql(1)
  //     expect(cs.data).to.eql({
  //       1: true
  //     })
  //   })
  // })

  // describe('#remove', () => {
  //   let cs = null

  //   beforeEach(() => {
  //     cs = new CharacterSet([1, 2, 3, 4])
  //   })

  //   it('should remove a single code point', () => {
  //     cs.remove(1)

  //     expect(cs.size).to.eql(3)
  //     expect(cs.data).to.eql({
  //       1: false,
  //       2: true,
  //       3: true,
  //       4: true
  //     })
  //   })

  //   it('should remove another code point', () => {
  //     cs.remove(1)
  //     cs.remove(2)

  //     expect(cs.size).to.eql(2)
  //     expect(cs.data).to.eql({
  //       1: false,
  //       2: false,
  //       3: true,
  //       4: true
  //     })
  //   })

  //   it('should not remove the same code point twice', () => {
  //     cs.remove(1)
  //     cs.remove(2)

  //     expect(cs.size).to.eql(2)
  //     expect(cs.data).to.eql({
  //       1: false,
  //       2: false,
  //       3: true,
  //       4: true
  //     })
  //   })

  //   it('should remove two code points at the same time', () => {
  //     cs.remove(1, 2)

  //     expect(cs.size).to.eql(2)
  //     expect(cs.data).to.eql({
  //       1: false,
  //       2: false,
  //       3: true,
  //       4: true
  //     })
  //   })
  // })

  // describe('encodeCodePoint', () => {
  //   let characterSet = null

  //   beforeEach(() => {
  //     characterSet = new CharacterSet()
  //   })

  //   it('should encode ASCII safe characters as themselves', () => {
  //     expect(characterSet.encodeCodePoint(65)).to.eql('A')
  //     expect(characterSet.encodeCodePoint(57)).to.eql('9')
  //     expect(characterSet.encodeCodePoint(97)).to.eql('a')
  //   })

  //   it('should encode ASCII unsafe code points encoded', () => {
  //     expect(characterSet.encodeCodePoint(0)).to.eql('\\u0000')
  //     expect(characterSet.encodeCodePoint(36)).to.eql('\\u0024')
  //     expect(characterSet.encodeCodePoint(62)).to.eql('\\u003E')
  //     expect(characterSet.encodeCodePoint(127)).to.eql('\\u007F')
  //   })

  //   it('should always encode code points in the BMP that are not safe characters', () => {
  //     expect(characterSet.encodeCodePoint(20013)).to.eql('\\u4E2D')
  //     expect(characterSet.encodeCodePoint(22269)).to.eql('\\u56FD')
  //   })

  //   it('should encode code points outside the BMP as surrogate pairs', () => {
  //     expect(characterSet.encodeCodePoint(119558)).to.eql('\\uD834\\uDF06')
  //   })
  // })

  // describe('#toString', () => {
  //   it('should return ASCII as ASCII', () => {
  //     const cs = new CharacterSet('abc')

  //     expect(cs.toString()).to.eql('abc')
  //   })

  //   it('should not contain duplicates', () => {
  //     const cs = new CharacterSet('abcabc')

  //     expect(cs.toString()).to.eql('abc')
  //   })

  //   it('should encode characters inside the BMP as using hex escapes', () => {
  //     const cs = new CharacterSet([20013, 22269])

  //     expect(cs.toString()).to.eql('\\u4E2D\\u56FD')
  //   })

  //   it('should encode characters outside the BMP as surrogate pairs', () => {
  //     const cs = new CharacterSet(119558)

  //     expect(cs.toString()).to.eql('\\uD834\\uDF06')
  //   })
  // })

  // describe('#toHexString', () => {
  //   it('should return hex', () => {
  //     const cs = new CharacterSet('abc')

  //     expect(cs.toHexString()).to.eql('U+61,U+62,U+63')
  //   })

  //   it('should not contain duplicates', () => {
  //     const cs = new CharacterSet('abcabc')

  //     expect(cs.toHexString()).to.eql('U+61,U+62,U+63')
  //   })

  //   it('should encode characters inside the BMP', () => {
  //     const cs = new CharacterSet([20013, 22269])

  //     expect(cs.toHexString()).to.eql('U+4E2D,U+56FD')
  //   })

  //   it('should encode characters outside the BMP as a single codepoint', () => {
  //     const cs = new CharacterSet(119558)

  //     expect(cs.toHexString()).to.eql('U+1D306')
  //   })
  // })

  describe('#toHexRangeString', () => {
    it('should return return hex', () => {
      const cs = new CharacterSet('ac')

      expect(cs.toHexRangeString()).to.eql('U+61,U+63')
    })

    it('should return a hex range', () => {
      const cs = new CharacterSet('abc')

      expect(cs.toHexRangeString()).to.eql('U+61-63')
    })

    it('should return a hex range and individual code points', () => {
      const cs = new CharacterSet('abch')

      expect(cs.toHexRangeString()).to.eql('U+61-63,U+68')
    })

    it('should return encoded ranges', () => {
      const cs = new CharacterSet([[127, 255]])

      expect(cs.toHexRangeString()).to.eql('U+7F-FF')
    })

    it('should return encoded ranges outside the BMP', () => {
      const cs = new CharacterSet([[0x10000, 0x10fff]])

      expect(cs.toHexRangeString()).to.eql('U+10000-10FFF')
    })

    it('should return range and single points', () => {
      const cs = new CharacterSet([1, [4, 7]])

      expect(cs.toHexRangeString()).to.eql('U+1,U+4-7')
    })
  })

  // describe('#toRangeString', () => {
  //   it('should return return ASCII as ASCII', () => {
  //     const cs = new CharacterSet('ac')

  //     expect(cs.toRangeString()).to.eql('[ac]')
  //   })

  //   it('should return ASCII ranges', () => {
  //     const cs = new CharacterSet('abc')

  //     expect(cs.toRangeString()).to.eql('[a-c]')
  //   })

  //   it('should return ASCII range and points', () => {
  //     const cs = new CharacterSet('abch')

  //     expect(cs.toRangeString()).to.eql('[a-ch]')
  //   })

  //   it('should return combined ASCII and encoded ranges', () => {
  //     const cs = new CharacterSet([[67, 127]])

  //     expect(cs.toRangeString()).to.eql('[C-\\u007F]')
  //   })

  //   it('should return encoded ranges', () => {
  //     const cs = new CharacterSet([[127, 255]])

  //     expect(cs.toRangeString()).to.eql('[\\u007F-\\u00FF]')
  //   })

  //   it('should return encoded ranges outside the BMP', () => {
  //     const cs = new CharacterSet([[0x10000, 0x10fff]])

  //     expect(cs.toRangeString()).to.eql('[\\uD800\\uDC00-\\uD803\\uDFFF]')
  //   })

  //   it('should return range and single points', () => {
  //     const cs = new CharacterSet([1, [4, 7]])

  //     expect(cs.toRangeString()).to.eql('[\\u0001\\u0004-\\u0007]')
  //   })
  // })

  // describe('#union', () => {
  //   it('should union two distinct character sets', () => {
  //     const a = new CharacterSet([1, 2])
  //     const b = new CharacterSet([3, 4])

  //     expect(a.union(b).data).to.eql({
  //       1: true,
  //       2: true,
  //       3: true,
  //       4: true
  //     })
  //   })

  //   it('should union two overlapping character sets', () => {
  //     const a = new CharacterSet([1, 2, 3])
  //     const b = new CharacterSet([2, 3, 4])

  //     expect(a.union(b).data).to.eql({
  //       1: true,
  //       2: true,
  //       3: true,
  //       4: true
  //     })
  //   })
  // })

  // describe('#intersection', () => {
  //   it('should not find any code points in common', () => {
  //     const a = new CharacterSet([1, 2])
  //     const b = new CharacterSet([3, 4])

  //     expect(a.intersect(b).data).to.eql({})
  //   })

  //   it('should find code points in common', () => {
  //     const a = new CharacterSet([1, 2, 3])
  //     const b = new CharacterSet([2, 3, 4])

  //     expect(a.intersect(b).data).to.eql({
  //       2: true,
  //       3: true
  //     })
  //   })
  // })

  // describe('#difference', () => {
  //   it('should return the same set if there are now common code points', () => {
  //     const a = new CharacterSet([1, 2])
  //     const b = new CharacterSet([3, 4])

  //     expect(a.difference(b).data).to.eql({
  //       1: true,
  //       2: true
  //     })
  //     expect(b.difference(a).data).to.eql({
  //       3: true,
  //       4: true
  //     })
  //     expect(a.difference(a).data).to.eql({})
  //   })

  //   it('should only return those code points that are not in common', () => {
  //     const a = new CharacterSet([1, 2, 3])
  //     const b = new CharacterSet([2, 3, 4])

  //     expect(a.difference(b).data).to.eql({
  //       1: true
  //     })
  //     expect(b.difference(a).data).to.eql({
  //       4: true
  //     })
  //   })
  // })

  // describe('#subset', () => {
  //   it('should consider an empty character set as a subset of any character set', () => {
  //     const a = new CharacterSet()
  //     const b = new CharacterSet([1, 2])

  //     expect(a.subset(b)).to.be(true)
  //     expect(b.subset(a)).to.be(false)
  //   })

  //   it('should consider a character set a subset only if all its codepoints are present in another character set', () => {
  //     const a = new CharacterSet([1, 2])
  //     const b = new CharacterSet([1, 2, 3])

  //     expect(a.subset(b)).to.be(true)
  //     expect(b.subset(a)).to.be(false)
  //   })

  //   it('should consider a character set a subset of itself', () => {
  //     const a = new CharacterSet([1, 2])

  //     expect(a.subset(a)).to.be(true)
  //   })
  // })

  // describe('#toRegExp', () => {
  //   it('should build a regex for safe ASCII', () => {
  //     const cs = new CharacterSet(67)

  //     expect(cs.toRegExp()).to.eql('C')
  //   })

  //   it('should build a regex for a safe ASCII range', () => {
  //     const cs = new CharacterSet([[67, 70]])

  //     expect(cs.toRegExp()).to.eql('[C-F]')
  //   })

  //   it('should build a regex for ranges and points', () => {
  //     const cs = new CharacterSet([1, 3, [67, 70]])

  //     expect(cs.toRegExp()).to.eql('[\\u0001\\u0003C-F]')
  //   })

  //   it('should build a regex for a range that crosses the BMP', () => {
  //     const cs = new CharacterSet([[65534, 65537]])

  //     expect(cs.toRegExp()).to.eql('[\\uFFFE\\uFFFF]|\\uD800[\\uDC00\\uDC01]')
  //   })

  //   it('should build a regex for a code point outside the BMP', () => {
  //     const cs = new CharacterSet(119558)

  //     expect(cs.toRegExp()).to.eql('\\uD834\\uDF06')
  //   })

  //   it('should build a regex for a code point range outside the BMP', () => {
  //     const cs = new CharacterSet([[119558, 119638]])

  //     expect(cs.toRegExp()).to.eql('\\uD834[\\uDF06-\\uDF56]')
  //   })

  //   it('should build a regex for a code point range and point outside the BMP', () => {
  //     const cs = new CharacterSet([119555, [119558, 119638]])
  //     expect(cs.toRegExp()).to.eql('\\uD834[\\uDF03\\uDF06-\\uDF56]')
  //   })

  //   it('should build a regex for a code point range outside the BMP that spans multiple high surrogates', () => {
  //     const cs = new CharacterSet([[119558, 126980]])

  //     expect(cs.toRegExp()).to.eql(
  //       '\\uD834[\\uDF06-\\uDFFF]|[\\uD835-\\uD83B][\\uDC00-\\uDFFF]|\\uD83C[\\uDC00-\\uDC04]'
  //     )
  //   })
  // })
})
