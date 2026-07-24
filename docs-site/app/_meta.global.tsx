import type { MetaRecord } from 'nextra'

const meta = {
  index: {
    display: 'hidden',
  },
  'getting-started': 'Getting Started',
  about: {
    title: 'About',
    items: {
      'who-we-are': 'Who We Are',
      'what-you-can-do': 'What You Can Do With',
      advantages: 'Advantages',
      'why-still-needed': 'Why Still Needed',
      'future-plans': 'Future Plans',
    },
  },
  platform: {
    title: 'Platform',
    items: {
      glossary: 'Glossary',
      units: {
        title: 'Units',
        items: {
          'api-unit': 'API Unit',
          'common-unit': 'Common Unit',
          'actor-unit': 'Actor Unit',
          'workflow-unit': 'Workflow Unit',
          'queue-worker-unit': 'Queue Worker Unit',
        },
      } as MetaRecord[string],
      sdk: 'SDK',
      'ai-role': 'AI Role',
      runtimes: 'Runtimes',
      releases: 'Releases',
      'avoiding-conflicts': 'Avoiding Conflicts',
      'release-history': 'Release History & Rollback',
      variables: 'Variables',
      'running-apis-units': 'Running APIs & Units',
      'auto-api-docs': 'Auto API Docs',
      tracing: 'Tracing & Debugging',
    } as MetaRecord,
  },
  'security-billing': {
    title: 'Security & Billing',
    items: {
      security: 'Security',
      costs: 'Costs & Billing',
    },
  },
}

export default meta as MetaRecord
