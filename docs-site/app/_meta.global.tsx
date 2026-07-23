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
      'open-source': 'Open Source',
    },
  },
  platform: {
    title: 'Platform',
    items: {
      glossary: 'Glossary',
      'runtime-environment': 'Runtime Environment',
      'data-storage': 'Data Storage',
      units: 'Units',
      'unit-versioning': 'Unit Versioning',
      sdk: 'SDK',
      'unit-types': {
        title: 'Unit Types',
        items: {
          'api-unit': 'API Unit',
          'common-unit': 'Common Unit',
          'actor-unit': 'Actor Unit',
          'workflow-unit': 'Workflow Unit',
          'queue-worker-unit': 'Queue Worker Unit',
        },
      } as MetaRecord[string],
    } as MetaRecord,
  },
  development: {
    title: 'Development',
    items: {
      'ai-role': 'AI Role',
      'execution-environments': 'Execution Environments',
      releases: 'Releases',
      'avoiding-conflicts': 'Avoiding Conflicts',
      'release-history': 'Release History & Rollback',
      variables: 'Variables',
      'running-apis-units': 'Running APIs & Units',
      'auto-api-docs': 'Auto API Docs',
      tracing: 'Tracing & Debugging',
    },
  },
  'security-billing': {
    title: 'Security & Billing',
    items: {
      security: 'Security',
      costs: 'Costs & Billing',
    },
  },
  guides: {
    title: 'Guides',
    items: {
      'nextra-showcase': 'Nextra Showcase',
    },
  },
}

export default meta as MetaRecord
