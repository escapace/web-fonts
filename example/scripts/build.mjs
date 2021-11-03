import { build } from 'esbuild'
import { readFileSync } from 'fs'
import { remove } from 'fs-extra'
import { mkdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const absWorkingDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../'
)

const external = Object.keys(
  JSON.parse(readFileSync(path.join(absWorkingDir, 'package.json')).toString())
    .dependencies
).filter((value) => value !== 'lodash-es')

process.umask(0o022)
process.chdir(absWorkingDir)

const outdirFunctions = path.join(absWorkingDir, 'functions/')
const outdirLib = path.join(absWorkingDir, 'lib/')

await remove(outdirFunctions)
await mkdir(outdirFunctions, { recursive: true })

await remove(outdirLib)
await mkdir(outdirLib, { recursive: true })

const script = (
  await build({
    absWorkingDir,
    bundle: true,
    entryPoints: ['src/entry-script.ts'],
    target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
    format: 'iife',
    minify: false,
    platform: 'browser',
    sourcemap: false,
    write: false,
    tsconfig: path.join(absWorkingDir, 'tsconfig.json')
  })
).outputFiles[0].contents

await build({
  entryPoints: ['src/entry-serverless.ts'],
  absWorkingDir,
  sourcemap: true,
  bundle: true,
  platform: 'node',
  target: 'node14.17.0',
  format: 'cjs',
  tsconfig: path.join(absWorkingDir, 'tsconfig.json'),
  define: {
    'process.env.SCRIPT': JSON.stringify(Buffer.from(script).toString('base64'))
  },
  external,
  outbase: path.join(absWorkingDir, 'src'),
  outfile: path.join(outdirFunctions, 'index.js'),
  logLevel: 'info'
})

await build({
  entryPoints: ['src/entry-dev.ts'],
  absWorkingDir,
  sourcemap: true,
  bundle: true,
  platform: 'node',
  target: 'node14.17.0',
  format: 'cjs',
  tsconfig: path.join(absWorkingDir, 'tsconfig.json'),
  define: {
    'process.env.SCRIPT': JSON.stringify(Buffer.from(script).toString('base64'))
  },
  external,
  outbase: path.join(absWorkingDir, 'src'),
  outfile: path.join(outdirLib, 'dev.cjs'),
  logLevel: 'info'
})
