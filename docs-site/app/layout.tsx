import { Layout, LastUpdated } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import type { ReactNode } from 'react'
import { DocsNavbar } from '../components/docs-navbar'
import { BrandMark } from '../components/brand-mark'
import { DocsFooter } from '../components/docs-footer'
import 'nextra-theme-docs/style.css'

export const metadata = {
  title: {
    default: 'BaaSForge Docs',
    template: '%s – BaaSForge Docs',
  },
  description: 'Documentation for BaaSForge — build and ship backend APIs faster.',
}

const navbar = (
  <DocsNavbar
    logo={<BrandMark nudge />}
  />
)

const footer = <DocsFooter />

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          editLink={null}
          feedback={{ content: null }}
          lastUpdated={<LastUpdated />}
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
