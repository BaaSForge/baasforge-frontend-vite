'use client'

import {
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import styles from './mermaid.module.css'

const MIN_DIAGRAM_SCALE = 1

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

function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 3H3v6M15 3h6v6M9 21H3v-6M21 15v6h-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function readAbsoluteAttr(svg: SVGSVGElement, name: 'width' | 'height') {
  const raw = svg.getAttribute(name)
  if (!raw || raw.includes('%')) return 0
  const value = Number.parseFloat(raw)
  return Number.isFinite(value) && value > 0 ? value : 0
}

function readSvgNaturalSize(svg: SVGSVGElement) {
  const viewBox = svg.viewBox?.baseVal
  let bboxWidth = 0
  let bboxHeight = 0

  try {
    const bbox = svg.getBBox()
    bboxWidth = bbox.width
    bboxHeight = bbox.height
  } catch {
    // SVG may not be laid out yet
  }

  const width =
    readAbsoluteAttr(svg, 'width') ||
    (viewBox && viewBox.width > 0 ? viewBox.width : 0) ||
    bboxWidth

  const height =
    readAbsoluteAttr(svg, 'height') ||
    (viewBox && viewBox.height > 0 ? viewBox.height : 0) ||
    bboxHeight

  return { width, height }
}

function lockSvgReadableSize(svg: SVGSVGElement) {
  const { width, height } = readSvgNaturalSize(svg)
  if (!(width > 0 && height > 0)) return

  const nextWidth = width * MIN_DIAGRAM_SCALE
  const nextHeight = height * MIN_DIAGRAM_SCALE

  svg.setAttribute('width', String(nextWidth))
  svg.setAttribute('height', String(nextHeight))
  svg.style.width = `${nextWidth}px`
  svg.style.height = `${nextHeight}px`
  svg.style.maxWidth = 'none'
  svg.style.maxHeight = 'none'
}

export function Mermaid({ chart }: { chart: string }) {
  const reactId = useId()
  const [svg, setSvg] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const panRef = useRef<HTMLDivElement>(null)
  const renderCount = useRef(0)
  const isVisible = useIsVisible(containerRef)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  useEffect(() => {
    if (!expanded) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    closeBtnRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [expanded])

  useEffect(() => {
    if (!expanded) return

    const viewport = panRef.current
    if (!viewport) return

    const svgEl = viewport.querySelector('svg')
    if (svgEl) lockSvgReadableSize(svgEl)

    const center = () => {
      viewport.scrollLeft = Math.max(
        0,
        (viewport.scrollWidth - viewport.clientWidth) / 2,
      )
      viewport.scrollTop = Math.max(
        0,
        (viewport.scrollHeight - viewport.clientHeight) / 2,
      )
    }

    center()
    requestAnimationFrame(center)

    let dragging = false
    let startX = 0
    let startY = 0
    let startScrollLeft = 0
    let startScrollTop = 0

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      if ((event.target as HTMLElement | null)?.closest('button')) return

      dragging = true
      startX = event.clientX
      startY = event.clientY
      startScrollLeft = viewport.scrollLeft
      startScrollTop = viewport.scrollTop
      viewport.classList.add(styles.modalChartDragging)
      viewport.setPointerCapture(event.pointerId)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      viewport.scrollLeft = startScrollLeft - (event.clientX - startX)
      viewport.scrollTop = startScrollTop - (event.clientY - startY)
    }

    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return
      dragging = false
      viewport.classList.remove(styles.modalChartDragging)
      if (viewport.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId)
      }
    }

    viewport.addEventListener('pointerdown', onPointerDown)
    viewport.addEventListener('pointermove', onPointerMove)
    viewport.addEventListener('pointerup', onPointerUp)
    viewport.addEventListener('pointercancel', onPointerUp)

    return () => {
      viewport.removeEventListener('pointerdown', onPointerDown)
      viewport.removeEventListener('pointermove', onPointerMove)
      viewport.removeEventListener('pointerup', onPointerUp)
      viewport.removeEventListener('pointercancel', onPointerUp)
    }
  }, [expanded, svg])

  return (
    <div ref={containerRef} className={styles.root}>
      {svg ? (
        <button
          type="button"
          className={styles.expandBtn}
          onClick={() => setExpanded(true)}
          aria-label="Expand diagram"
          title="Expand"
        >
          <ExpandIcon />
        </button>
      ) : null}
      <div
        className={styles.chart}
        style={{ minHeight: svg ? undefined : '1.5rem' }}
        dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
      />
      {mounted &&
        expanded &&
        svg &&
        createPortal(
          <div
            className={styles.overlay}
            role="presentation"
            onClick={() => setExpanded(false)}
          >
            <div
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-label="Expanded diagram"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                ref={closeBtnRef}
                type="button"
                className={styles.closeBtn}
                onClick={() => setExpanded(false)}
                aria-label="Close expanded diagram"
                title="Close"
              >
                <CloseIcon />
              </button>
              <div
                ref={panRef}
                className={styles.modalChart}
                aria-label="Drag to pan diagram"
              >
                <div
                  className={styles.modalChartInner}
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
