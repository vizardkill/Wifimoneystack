import { type JSX, useLayoutEffect, useRef } from 'react'

import type { EasingDefinition } from 'motion/react'
import { motion, useAnimate } from 'motion/react'
import { Outlet, useLocation } from 'react-router'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/**
 * Smooth cubic-bezier from the CodePen by thecalicoder.
 * Produces a slow, cinematic wipe effect.
 */
const EASE_SLIDE: EasingDefinition = [0.76, 0, 0.24, 1]

/** Duration (seconds) for each phase of the curtain slide. */
const CURTAIN_DURATION = 0.9

/** Small pause (ms) after swapping content so React can paint. */
const SWAP_DELAY_MS = 50

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * Persistent auth layout that wraps all `/login`, `/signup`,
 * `/forgot-password`, `/reset-password` and `/verification-status`
 * routes with a cinematic dark-curtain page transition.
 *
 * How it works:
 *  1. User clicks a link to another auth route.
 *  2. Dark panel slides in from the left, covering the old page  (0.9 s).
 *  3. Old content is hidden, new `<Outlet />` content shows       (instant, behind curtain).
 *  4. Dark panel slides out to the right, revealing the new page  (0.9 s).
 *
 * On first load / SSR the curtain stays off-screen — no animation.
 */
export default function AuthLayout(): JSX.Element {
  const location = useLocation()

  /* Imperative control over the curtain element */
  const [curtainScope, animateCurtain] = useAnimate<HTMLDivElement>()

  /* Ref to the content wrapper — used to toggle visibility during swap */
  const contentRef = useRef<HTMLDivElement>(null)

  /* Track previous pathname to detect intra-auth navigations */
  const prevPathRef = useRef(location.pathname)

  /* Lock so rapid clicks don't stack animations */
  const isAnimatingRef = useRef(false)

  /*
   * useLayoutEffect fires synchronously after DOM mutation but
   * BEFORE the browser paints.  This prevents a 1-frame flash
   * of the new content before the curtain covers it.
   *
   * On the server this is a no-op (curtain starts off-screen via
   * the `initial` prop, so SSR renders normally without animation).
   */
  useLayoutEffect(() => {
    /* Same path → nothing to do (first render / hydration). */
    if (prevPathRef.current === location.pathname) {
      return
    }
    prevPathRef.current = location.pathname

    /* Already running → skip (prevents stacking). */
    if (isAnimatingRef.current) {
      return
    }
    isAnimatingRef.current = true

    /* Hide the freshly-swapped content before the browser paints. */
    if (contentRef.current) {
      contentRef.current.style.opacity = '0'
    }

    const runTransition = async (): Promise<void> => {
      /* ① Reset curtain to off-screen LEFT (instant). */
      animateCurtain(curtainScope.current, { x: '-100%' }, { duration: 0 })

      /* ② Slide curtain in from left → covers the viewport. */
      await animateCurtain(curtainScope.current, { x: '0%' }, { duration: CURTAIN_DURATION, ease: EASE_SLIDE })

      /* ③ Curtain fully covers — make content visible behind it. */
      if (contentRef.current) {
        contentRef.current.style.opacity = '1'
      }

      /* ④ Brief pause so React paints the new content. */
      await new Promise<void>((resolve) => {
        setTimeout(resolve, SWAP_DELAY_MS)
      })

      /* ⑤ Slide curtain out to the right → reveals new page. */
      await animateCurtain(curtainScope.current, { x: '100%' }, { duration: CURTAIN_DURATION, ease: EASE_SLIDE })

      isAnimatingRef.current = false
    }

    void runTransition()
  }, [location.pathname, animateCurtain, curtainScope])

  return (
    <div className="relative min-h-screen">
      <div ref={contentRef} className="min-h-screen">
        <Outlet />
      </div>
      <motion.div ref={curtainScope} className="pointer-events-none fixed inset-0 z-50 bg-gray-950 will-change-transform" initial={{ x: '-100%' }} />
    </div>
  )
}
