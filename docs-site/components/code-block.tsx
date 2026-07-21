import { compileMdx } from 'nextra/compile'
import { MDXRemote } from 'nextra/mdx-remote'

export type CodeBlockProps = {
  code: string
  language?: string
  filename?: string
  copy?: boolean
  showLineNumbers?: boolean
}

function buildFenceMeta({
  language = 'typescript',
  copy = true,
  showLineNumbers,
  filename,
}: Omit<CodeBlockProps, 'code'>) {
  const parts = [language]
  if (copy) parts.push('copy')
  if (showLineNumbers) parts.push('showLineNumbers')
  if (filename) parts.push(`filename="${filename}"`)
  return parts.join(' ')
}

export async function CodeBlock({
  code,
  language,
  filename,
  copy,
  showLineNumbers,
}: CodeBlockProps) {
  const meta = buildFenceMeta({ language, filename, copy, showLineNumbers })
  const source = `\`\`\`${meta}\n${code.trim()}\n\`\`\``
  const compiledSource = await compileMdx(source, {
    filePath: 'code-block.mdx',
    defaultShowCopyCode: true,
  })

  return <MDXRemote compiledSource={compiledSource} />
}
