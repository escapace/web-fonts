import { assert } from 'chai'
import path from 'path'
import { webFonts } from './index'

describe('src/index.spec.ts', function () {
  this.timeout(30000)

  it('happy-path', async () => {
    assert.isFunction(webFonts)

    const result = await webFonts({
      cwd: path.resolve(__dirname, '../../test/happy-path')
    })

    assert.isObject(result)
  })
})
