'use client'

import cn from 'clsx'
import Link from 'next/link'
import { Button } from 'nextra/components'
import { MenuIcon } from 'nextra/icons'
import { setMenu, useMenu, useThemeConfig } from 'nextra-theme-docs'

const linkClass = cn(
  'x:text-sm x:contrast-more:text-gray-700 x:contrast-more:dark:text-gray-100 x:whitespace-nowrap',
  'x:text-gray-600 x:hover:text-black x:dark:text-gray-400 x:dark:hover:text-gray-200',
  'x:ring-inset x:transition-colors',
)

const docsLinkClass = cn(
  'x:text-sm x:whitespace-nowrap x:font-bold x:subpixel-antialiased',
  'x:text-gray-900 x:dark:text-white',
  'x:ring-inset x:transition-colors',
)

export function DocsNavbarNav() {
  const themeConfig = useThemeConfig()
  const menu = useMenu()

  return (
    <>
      <div className="x:flex x:gap-4 x:overflow-x-auto nextra-scrollbar x:py-1.5 x:max-md:hidden">
        <a href="/" className={linkClass}>
          Home
        </a>
        <Link href="/" className={docsLinkClass} aria-current="page">
          Docs
        </Link>
        <a href="/login" className={linkClass}>
          Sign in
        </a>
      </div>
      {themeConfig.search && (
        <div className="x:max-md:hidden">
          {themeConfig.search}
        </div>
      )}
      <Button
        aria-label="Menu"
        className={cn('nextra-hamburger x:md:hidden', menu && 'x:bg-gray-400/20')}
        onClick={() => setMenu((open) => !open)}
      >
        <MenuIcon height="24" className={cn({ open: menu })} />
      </Button>
    </>
  )
}
