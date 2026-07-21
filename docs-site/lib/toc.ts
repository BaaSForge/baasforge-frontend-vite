import type { Heading } from 'nextra'
import { slugify } from './slug'

export function toc(...items: Array<{ title: string; depth?: Heading['depth'] }>): Heading[] {
  return items.map(({ title, depth = 2 }) => ({
    depth,
    value: title,
    id: slugify(title),
  }))
}
