'use client'

import type { ReactNode } from 'react'
import { Playground } from 'nextra/components'

function Button({ children }: { children?: ReactNode }) {
  return <button type="button">{children ?? 'Click me'}</button>
}

export function PlaygroundDemo() {
  return (
    <Playground
      components={{ Button }}
      source="<Button>Click me</Button>"
    />
  )
}
