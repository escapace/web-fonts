import execa from 'execa'
import path from 'path'
import { fileURLToPath } from 'url'

const WD = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../')
const WD_EXAMPLE = path.join(WD, 'example')

process.umask(0o022)
process.chdir(WD)

const { exitCode } = await execa(
  'npx',
  [
    'vercel',
    '--prod',
    '--scope',
    'escapace',
    `--token=${process.env.VERCEL_TOKEN}`
  ],
  {
    cwd: WD_EXAMPLE,
    all: true,
    reject: false,
    env: {
      VERCEL_ORG_ID: process.env.VERCEL_ORG_ID,
      VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID,
      VERCEL_TOKEN: process.env.VERCEL_TOKEN
    }
  }
)

process.exit(exitCode)
