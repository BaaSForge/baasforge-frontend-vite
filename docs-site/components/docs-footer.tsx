import Link from 'next/link'
import { Footer } from 'nextra-theme-docs'
import { BrandMark } from './brand-mark'
import styles from './docs-footer.module.css'

type FooterLinkItem = {
  label: string
  href: string
  external?: boolean
}

const footerLinks: Array<{ title: string; links: FooterLinkItem[] }> = [
  {
    title: 'Documentation',
    links: [
      { label: 'Getting Started', href: '/getting-started' },
      { label: 'About', href: '/about/who-we-are' },
      { label: 'Platform', href: '/platform/glossary' },
    ],
  },
  {
    title: 'More',
    links: [
      { label: 'Security', href: '/security-billing/security' },
      { label: 'Costs & Billing', href: '/security-billing/costs' },
    ],
  },
  {
    title: 'Product',
    links: [
      { label: 'Home', href: '/', external: true },
      { label: 'Sign in', href: '/login', external: true },
    ],
  },
]

function FooterLink({ label, href, external }: FooterLinkItem) {
  if (external) {
    return (
      <a href={href} className={styles.link}>
        {label}
      </a>
    )
  }

  return (
    <Link href={href} className={styles.link}>
      {label}
    </Link>
  )
}

export function DocsFooter() {
  return (
    <Footer
      style={{
        flexDirection: 'column',
        width: '100%',
        alignItems: 'stretch',
      }}
    >
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <BrandMark />
            <p className={styles.tagline}>
              We got tired of juggling different tools and infrastructure just to ship
              a backend. So we built the one we wished we&apos;d had.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <p className={styles.groupTitle}>{group.title}</p>
              <ul className={styles.linkList}>
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.label}`}>
                    <FooterLink {...link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className={styles.copyright}>
          © {new Date().getFullYear()} BaaSForge
        </p>
      </div>
    </Footer>
  )
}
