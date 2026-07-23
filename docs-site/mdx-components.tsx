import type { ComponentProps } from 'react'
import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs'

const themeComponents = getThemeComponents()
const ThemeLink = themeComponents.a!

const appLinkClassName =
  'x:text-primary-600 x:underline x:hover:no-underline x:decoration-from-font x:[text-underline-position:from-font]'

function isAppRoute(href: string) {
  return (
    href === '/login' ||
    href.startsWith('/login?') ||
    href === '/dashboard' ||
    href.startsWith('/dashboard/')
  )
}

export function useMDXComponents(components?: Record<string, unknown>) {
  return {
    ...themeComponents,
    a: (props: ComponentProps<typeof ThemeLink>) => {
      const { href, className } = props

      if (typeof href === 'string' && isAppRoute(href)) {
        const { href: _href, ...rest } = props
        return (
          <a
            href={href}
            className={className ? `${appLinkClassName} ${className}` : appLinkClassName}
            {...rest}
          />
        )
      }

      return <ThemeLink {...props} />
    },
    ...components,
  }
}
