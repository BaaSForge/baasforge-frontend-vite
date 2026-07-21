import cn from 'clsx'
import type { ReactNode } from 'react'
import { DocsNavbarNav } from './docs-navbar-nav'

type DocsNavbarProps = {
  logo: ReactNode
}

export function DocsNavbar({ logo }: DocsNavbarProps) {
  return (
    <header
      className={cn(
        'nextra-navbar x:sticky x:top-0 x:z-30 x:w-full x:bg-transparent x:print:hidden',
        'x:max-md:[.nextra-banner:not([class$=hidden])~&]:top-(--nextra-banner-height)',
      )}
    >
      <div
        className={cn(
          'nextra-navbar-blur x:absolute x:-z-1 x:size-full',
          'nextra-border x:border-b',
          'x:backdrop-blur-md x:bg-nextra-bg/70',
        )}
      />
      <nav
        style={{ height: 'var(--nextra-navbar-height)' }}
        className={cn(
          'x:mx-auto x:flex x:max-w-(--nextra-content-width) x:items-center x:gap-4',
          'x:pl-[max(env(safe-area-inset-left),1.5rem)] x:pr-[max(env(safe-area-inset-right),1.5rem)]',
          'x:justify-end',
        )}
      >
        <div className="x:flex x:items-center x:me-auto">
          {logo}
        </div>
        <DocsNavbarNav />
      </nav>
    </header>
  )
}
