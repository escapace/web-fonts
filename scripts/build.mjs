import { build } from 'esbuild'
import execa from 'execa'
import { remove } from 'fs-extra'
import { mkdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const cwd = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../')

process.umask(0o022)
process.chdir(cwd)

const outdir = path.join(cwd, 'lib/cjs')

await remove(outdir)
await mkdir(outdir, { recursive: true })

await build({
  entryPoints: ['src/index.ts'],
  sourcemap: true,
  bundle: true,
  platform: 'node',
  target: 'node14.17.0',
  format: 'cjs',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  tsconfig: path.join(cwd, 'tsconfig-build.json'),
  external: ['esbuild'],
  outbase: path.join(cwd, 'src'),
  outfile: path.join(outdir, `index.cjs`),
  logLevel: 'info'
})

await remove(path.join(cwd, 'lib/types'))

await execa(
  path.join(cwd, 'node_modules', '.bin', 'tsc'),
  [
    '-p',
    './tsconfig-build.json',
    '--emitDeclarationOnly',
    '--declarationDir',
    'lib/types'
  ],
  { all: true, cwd }
).catch((reason) => {
  console.error(reason.all)
  process.exit(reason.exitCode)
})
