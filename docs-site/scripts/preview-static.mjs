import { spawn } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const outDir = path.join(root, 'out')
const previewRoot = path.join(root, '.preview')
const port = process.env.PORT ?? '1221'

if (!existsSync(outDir)) {
  console.error('Missing docs-site/out. Run `npm run build` first.')
  process.exit(1)
}

rmSync(previewRoot, { recursive: true, force: true })
mkdirSync(path.join(previewRoot, 'docs'), { recursive: true })
cpSync(outDir, path.join(previewRoot, 'docs'), { recursive: true })

console.log(`Static docs preview: http://localhost:${port}/docs`)

const child = spawn('npx', ['serve', previewRoot, '-l', port], {
  stdio: 'inherit',
  shell: true,
  cwd: root,
})

child.on('exit', (code) => process.exit(code ?? 0))
