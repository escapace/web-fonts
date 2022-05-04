import { build } from 'esbuild'
import { remove } from 'fs-extra'
import { mkdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const WD = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../')

process.umask(0o022)
process.chdir(WD)

const OUTDIR_CLI = path.join(WD, 'lib/cli')

await remove(OUTDIR_CLI)
await mkdir(OUTDIR_CLI, { recursive: true })

await build({
  entryPoints: ['src/cli.ts'],
  absWorkingDir: WD,
  sourcemap: true,
  bundle: true,
  platform: 'node',
  target: 'node17',
  format: 'cjs',
  tsconfig: path.join(WD, 'tsconfig.json'),
  external: ['esbuild'],
  outbase: path.join(WD, 'src'),
  outdir: OUTDIR_CLI,
  outExtension: { '.js': '.cjs' },
  logLevel: 'info'
})
