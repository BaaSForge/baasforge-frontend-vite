import path from 'node:path'
import { fileURLToPath } from 'node:url'
import nextra from 'nextra'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const withNextra = nextra({
  defaultShowCopyCode: true,
  search: { codeblocks: false },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/docs',
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: __dirname,
}

export default withNextra(nextConfig)
