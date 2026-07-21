import type { Heading } from 'nextra'
import type { ReactNode } from 'react'
import { useMDXComponents as getMDXComponents } from '../mdx-components'

const Wrapper = getMDXComponents().wrapper

type DocsPageProps = {
  children: ReactNode
  title: string
  filePath: string
  toc?: Heading[]
  timestamp?: number | string | Date
  sourceCode?: string
}

export function DocsPage({
  children,
  title,
  filePath,
  toc = [],
  timestamp,
  sourceCode = '',
}: DocsPageProps) {
  if (!Wrapper) {
    return children
  }

  return (
    <Wrapper
      toc={toc}
      metadata={{
        title,
        filePath,
        timestamp: new Date(timestamp ?? Date.now()).valueOf(),
      }}
      sourceCode={sourceCode}
    >
      {children}
    </Wrapper>
  )
}
