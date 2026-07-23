'use client'

import { useEffect, useId, useRef, useState, type RefObject } from 'react'

function useIsVisible(ref: RefObject<HTMLElement | null>) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect()
        setIsIntersecting(true)
      }
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])

  return isIntersecting
}

export function Mermaid({ chart }: { chart: string }) {
  const reactId = useId()
  const [svg, setSvg] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const renderCount = useRef(0)
  const isVisible = useIsVisible(containerRef)

  useEffect(() => {
    if (!isVisible) return

    const htmlElement = document.documentElement
    let cancelled = false

    async function renderChart() {
      const isDarkTheme =
        htmlElement.classList.contains('dark') ||
        htmlElement.getAttribute('data-theme') === 'dark'

      const { default: mermaid } = await import('mermaid')

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        fontFamily: 'inherit',
        themeCSS: 'margin: 1.5rem auto 0;',
        theme: isDarkTheme ? 'dark' : 'default',
      })

      renderCount.current += 1
      const id = `mermaid-${reactId.replaceAll(':', '')}-${renderCount.current}`

      try {
        const { svg: nextSvg } = await mermaid.render(
          id,
          chart.replaceAll('\\n', '\n'),
        )

        document.getElementById(id)?.remove()
        document.getElementById(`d${id}`)?.remove()

        if (!cancelled) setSvg(nextSvg)
      } catch (error) {
        console.error('Error while rendering mermaid', error)
      }
    }

    const observer = new MutationObserver(() => {
      void renderChart()
    })
    observer.observe(htmlElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    })
    void renderChart()

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [chart, isVisible, reactId])

  return (
    <div
      ref={containerRef}
      style={{ minHeight: svg ? undefined : '1.5rem' }}
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  )
}
