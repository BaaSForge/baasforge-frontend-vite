import path from 'node:path'
import { fileURLToPath } from 'node:url'
import nextra from 'nextra'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const withNextra = nextra({
  defaultShowCopyCode: true,
  search: { codeblocks: false },
})

const mermaidComponent = path.join(__dirname, 'components/mermaid.tsx')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/docs',
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: __dirname,
  turbopack: {
    resolveAlias: {
      '@theguild/remark-mermaid/mermaid': mermaidComponent,
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@theguild/remark-mermaid/mermaid': mermaidComponent,
    }
    return config
  },
}

export default withNextra(nextConfig)
