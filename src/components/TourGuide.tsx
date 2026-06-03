'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback, type MouseEvent, type PointerEvent } from 'react';
import { Joyride, Step, TooltipRenderProps, EventData, ACTIONS, EVENTS, STATUS } from 'react-joyride';
import { useRouter, usePathname } from 'next/navigation';

export type CustomStep = Step & { route?: string };

const TOOLTIP_SELECTOR = '[data-tour-tooltip="true"]';
const TOOLTIP_VIEWPORT_MARGIN = 24;
const SCROLL_LOCK_EDGE_MARGIN = 16;
const SCROLL_LOCK_ACTIVATION_DELAY = 420;
const SMOOTH_STEP_SCROLL_TIMEOUT = 900;
const ESTIMATED_TOOLTIP_HEIGHT = 320;
const TOOLTIP_TARGET_CLEARANCE = 54;

function getTargetElementFromStep(step: CustomStep) {
  if (step.target === 'body') return document.body;
  if (typeof step.target === 'string') return document.querySelector(step.target);
  if (typeof step.target === 'function') return step.target();
  if ('current' in step.target) return step.target.current;
  return step.target;
}

function scrollTargetIntoCenter(step: CustomStep, behavior: ScrollBehavior = 'auto') {
  const targetElement = getTargetElementFromStep(step);

  if (!targetElement || targetElement === document.body) return null;

  const container = getScrollableParent(targetElement);

  if (!container) {
    targetElement.scrollIntoView({ behavior, block: 'center' });
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('resize'));
    return targetElement;
  }

  const targetRect = targetElement.getBoundingClientRect();
  const targetTop = getElementTopInsideContainer(targetElement, container);
  const viewportHeight = isDocumentScrollContainer(container) ? window.innerHeight : container.clientHeight;
  const targetCenter = targetTop + targetRect.height / 2;
  const tooltipElement = document.querySelector(TOOLTIP_SELECTOR);
  const tooltipHeight = tooltipElement?.getBoundingClientRect().height || ESTIMATED_TOOLTIP_HEIGHT;
  const placement = typeof step.placement === 'string' ? step.placement.split('-')[0] : 'bottom';
  let nextScrollTop = targetCenter - viewportHeight / 2;

  if (placement === 'top') {
    nextScrollTop = targetTop - tooltipHeight - TOOLTIP_TARGET_CLEARANCE - TOOLTIP_VIEWPORT_MARGIN;
  } else if (placement === 'bottom') {
    nextScrollTop = targetTop + targetRect.height - viewportHeight + tooltipHeight + TOOLTIP_TARGET_CLEARANCE + TOOLTIP_VIEWPORT_MARGIN;
  }

  const clampedScrollTop = clampScrollTop(nextScrollTop, container);

  if (isDocumentScrollContainer(container)) {
    window.scrollTo({ top: clampedScrollTop, behavior });
  } else {
    container.scrollTo({ top: clampedScrollTop, behavior });
  }

  window.dispatchEvent(new Event('scroll'));
  window.dispatchEvent(new Event('resize'));
  return targetElement;
}

function waitForLayoutToSettle() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

function waitForScrollToSettle(container: HTMLElement, timeout = SMOOTH_STEP_SCROLL_TIMEOUT) {
  return new Promise<void>((resolve) => {
    const start = performance.now();
    let lastScrollTop = getScrollTop(container);
    let stableFrames = 0;

    const tick = () => {
      const currentScrollTop = getScrollTop(container);
      const elapsed = performance.now() - start;

      if (Math.abs(currentScrollTop - lastScrollTop) < 0.5) {
        stableFrames += 1;
      } else {
        stableFrames = 0;
      }

      lastScrollTop = currentScrollTop;

      if ((elapsed > 120 && stableFrames >= 6) || elapsed >= timeout) {
        resolve();
        return;
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  });
}

function getScrollableParent(element: Element | null) {
  if (!element) return document.scrollingElement as HTMLElement | null;

  let parent = element.parentElement;

  while (parent) {
    const styles = window.getComputedStyle(parent);
    const canScrollY = /(auto|scroll|overlay)/.test(styles.overflowY);

    if (canScrollY && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }

    parent = parent.parentElement;
  }

  return document.scrollingElement as HTMLElement | null;
}

function scrollContainerBy(container: HTMLElement | null, deltaY: number, behavior: ScrollBehavior = 'auto') {
  if (!container || Math.abs(deltaY) < 1) return;

  if (isDocumentScrollContainer(container)) {
    window.scrollBy({ top: deltaY, behavior });
  } else {
    container.scrollTo({ top: container.scrollTop + deltaY, behavior });
  }

  window.dispatchEvent(new Event('scroll'));
  window.dispatchEvent(new Event('resize'));
}

function isDocumentScrollContainer(container: HTMLElement) {
  return container === document.documentElement || container === document.body || container === document.scrollingElement;
}

function getScrollTop(container: HTMLElement) {
  return isDocumentScrollContainer(container) ? window.scrollY : container.scrollTop;
}

function setScrollTop(container: HTMLElement, scrollTop: number) {
  if (isDocumentScrollContainer(container)) {
    window.scrollTo({ top: scrollTop, behavior: 'auto' });
  } else {
    container.scrollTop = scrollTop;
  }
}

function getMaxScrollTop(container: HTMLElement) {
  if (isDocumentScrollContainer(container)) {
    const scrollingElement = document.scrollingElement ?? document.documentElement;
    return Math.max(0, scrollingElement.scrollHeight - window.innerHeight);
  }

  return Math.max(0, container.scrollHeight - container.clientHeight);
}

function clampScrollTop(value: number, container: HTMLElement) {
  return Math.min(Math.max(value, 0), getMaxScrollTop(container));
}

function getElementTopInsideContainer(element: Element, container: HTMLElement) {
  const elementRect = element.getBoundingClientRect();

  if (isDocumentScrollContainer(container)) {
    return elementRect.top + window.scrollY;
  }

  const containerRect = container.getBoundingClientRect();
  return elementRect.top - containerRect.top + container.scrollTop;
}

function getElementBoundsInsideContainer(element: Element, container: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const top = getElementTopInsideContainer(element, container);

  return {
    top,
    bottom: top + rect.height,
  };
}

function getContainerViewportRect(container: HTMLElement) {
  if (isDocumentScrollContainer(container)) {
    return {
      top: 0,
      bottom: window.innerHeight,
      height: window.innerHeight,
    };
  }

  const rect = container.getBoundingClientRect();

  return {
    top: Math.max(0, rect.top),
    bottom: Math.min(window.innerHeight, rect.bottom),
    height: Math.min(window.innerHeight, rect.bottom) - Math.max(0, rect.top),
  };
}

function getStepScrollBounds(step: CustomStep) {
  const targetElement = getTargetElementFromStep(step);
  const tooltipElement = document.querySelector(TOOLTIP_SELECTOR);

  if (!targetElement || targetElement === document.body || !tooltipElement || step.placement === 'center') return null;

  const container = getScrollableParent(targetElement);

  if (!container) return null;

  const targetBounds = getElementBoundsInsideContainer(targetElement, container);
  const tooltipBounds = getElementBoundsInsideContainer(tooltipElement, container);
  const viewportHeight = isDocumentScrollContainer(container) ? window.innerHeight : container.clientHeight;
  const lockMargin = Math.min(SCROLL_LOCK_EDGE_MARGIN, viewportHeight / 4);
  const zoneTop = Math.min(targetBounds.top, tooltipBounds.top);
  const zoneBottom = Math.max(targetBounds.bottom, tooltipBounds.bottom);
  const zoneHeight = zoneBottom - zoneTop;
  let min = zoneTop - lockMargin;
  let max = zoneBottom - viewportHeight + lockMargin;

  if (zoneHeight <= viewportHeight - lockMargin * 2) {
    min = zoneBottom - viewportHeight + lockMargin;
    max = zoneTop - lockMargin;
  }

  min = clampScrollTop(min, container);
  max = clampScrollTop(max, container);

  if (min > max) {
    const currentScrollTop = clampScrollTop(getScrollTop(container), container);
    min = currentScrollTop;
    max = currentScrollTop;
  }

  return { container, min, max };
}

function clampScrollToStep(step: CustomStep) {
  const bounds = getStepScrollBounds(step);

  if (!bounds) return;

  const currentScrollTop = getScrollTop(bounds.container);
  const clampedScrollTop = Math.min(Math.max(currentScrollTop, bounds.min), bounds.max);

  if (Math.abs(currentScrollTop - clampedScrollTop) < 1) return;

  setScrollTop(bounds.container, clampedScrollTop);
  window.dispatchEvent(new Event('scroll'));
  window.dispatchEvent(new Event('resize'));
}

function isScrollOutsideStepBounds(step: CustomStep, deltaY: number) {
  const bounds = getStepScrollBounds(step);

  if (!bounds) return false;

  const currentScrollTop = getScrollTop(bounds.container);
  return (deltaY < 0 && currentScrollTop <= bounds.min + 1) || (deltaY > 0 && currentScrollTop >= bounds.max - 1);
}

function ensureTooltipFullyVisible(step: CustomStep, behavior: ScrollBehavior = 'auto') {
  const tooltipElement = document.querySelector(TOOLTIP_SELECTOR);
  const targetElement = getTargetElementFromStep(step);

  if (!tooltipElement || !targetElement) return null;

  const container = getScrollableParent(targetElement);

  if (!container) return null;

  const tooltipRect = tooltipElement.getBoundingClientRect();
  const viewportRect = getContainerViewportRect(container);
  const safeTop = viewportRect.top + TOOLTIP_VIEWPORT_MARGIN;
  const safeBottom = viewportRect.bottom - TOOLTIP_VIEWPORT_MARGIN;
  let deltaY = 0;

  if (tooltipRect.top < safeTop) {
    deltaY = tooltipRect.top - safeTop;
  } else if (tooltipRect.bottom > safeBottom) {
    deltaY = tooltipRect.bottom - safeBottom;
  }

  scrollContainerBy(container, deltaY, behavior);

  return Math.abs(deltaY) >= 1 ? container : null;
}

function isTooltipFullyInsideViewport(step: CustomStep) {
  const tooltipElement = document.querySelector(TOOLTIP_SELECTOR);
  const targetElement = getTargetElementFromStep(step);

  if (!tooltipElement || !targetElement) return false;

  const container = getScrollableParent(targetElement);

  if (!container) return false;

  const tooltipRect = tooltipElement.getBoundingClientRect();
  const viewportRect = getContainerViewportRect(container);
  const safeTop = viewportRect.top + TOOLTIP_VIEWPORT_MARGIN;
  const safeBottom = viewportRect.bottom - TOOLTIP_VIEWPORT_MARGIN;

  return tooltipRect.top >= safeTop - 1 && tooltipRect.bottom <= safeBottom + 1;
}

async function settleTooltipPositionBeforeReveal(step: CustomStep, behavior: ScrollBehavior = 'auto') {
  const targetElement = scrollTargetIntoCenter(step, behavior);
  const initialScrollContainer = targetElement ? getScrollableParent(targetElement) : null;
  let scrollContainer: HTMLElement | null = null;
  let stablePasses = 0;

  if (initialScrollContainer && behavior === 'smooth') {
    await waitForScrollToSettle(initialScrollContainer);
  }

  await waitForLayoutToSettle();

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const adjustedContainer = ensureTooltipFullyVisible(step, 'auto');
    scrollContainer = adjustedContainer ?? scrollContainer;
    stablePasses = adjustedContainer || !isTooltipFullyInsideViewport(step) ? 0 : stablePasses + 1;

    if (stablePasses >= 2) break;

    await waitForLayoutToSettle();
  }

  if (scrollContainer) {
    await waitForScrollToSettle(scrollContainer, 180);
  }
}

function useKeepTooltipFullyVisible(active: boolean, step?: CustomStep) {
  useEffect(() => {
    if (!active || !step) return;

    let animationFrame = 0;
    let attempts = 0;

    const correctTooltipPosition = () => {
      ensureTooltipFullyVisible(step, 'auto');
      attempts += 1;

      if (attempts < 24 && !isTooltipFullyInsideViewport(step)) {
        animationFrame = requestAnimationFrame(correctTooltipPosition);
      }
    };

    animationFrame = requestAnimationFrame(correctTooltipPosition);
    window.addEventListener('resize', correctTooltipPosition);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', correctTooltipPosition);
    };
  }, [active, step]);
}

function CustomTooltip({
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
  visible = true,
  onBackClick,
  onCloseClick,
  onPrimaryClick,
}: TooltipRenderProps & {
  visible?: boolean;
  onBackClick?: (event: MouseEvent<HTMLButtonElement>, index: number) => void;
  onCloseClick?: (event: MouseEvent<HTMLButtonElement>, index: number) => void;
  onPrimaryClick?: (event: MouseEvent<HTMLButtonElement>, index: number, isLastStep: boolean) => void;
}) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const actionHandledRef = useRef(false);

  useEffect(() => {
    actionHandledRef.current = false;
  }, [index]);

  const runOnce = (callback: () => void) => {
    if (actionHandledRef.current) return;

    actionHandledRef.current = true;
    callback();
  };

  const handleBackClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (onBackClick) {
      event.preventDefault();
      event.stopPropagation();
      runOnce(() => onBackClick(event, index));
      return;
    }

    backProps.onClick(event);
  };

  const handleBackPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!onBackClick) return;

    event.preventDefault();
    event.stopPropagation();
    runOnce(() => onBackClick(event as unknown as MouseEvent<HTMLButtonElement>, index));
  };

  const handleCloseClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (onCloseClick) {
      event.preventDefault();
      event.stopPropagation();
      runOnce(() => onCloseClick(event, index));
      return;
    }

    closeProps.onClick(event);
  };

  const handleClosePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!onCloseClick) return;

    event.preventDefault();
    event.stopPropagation();
    runOnce(() => onCloseClick(event as unknown as MouseEvent<HTMLButtonElement>, index));
  };

  const handlePrimaryClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (onPrimaryClick) {
      event.preventDefault();
      event.stopPropagation();
      runOnce(() => onPrimaryClick(event, index, isLastStep));
      return;
    }

    primaryProps.onClick(event);
  };

  const handlePrimaryPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!onPrimaryClick) return;

    event.preventDefault();
    event.stopPropagation();
    runOnce(() => onPrimaryClick(event as unknown as MouseEvent<HTMLButtonElement>, index, isLastStep));
  };

  useLayoutEffect(() => {
    const floater = tooltipRef.current?.closest('.react-joyride__floater') as HTMLElement | null;

    if (!floater) return;

    if (visible) {
      floater.style.opacity = '1';
      floater.style.pointerEvents = 'auto';
      floater.style.transition = '';
    } else {
      floater.style.opacity = '0';
      floater.style.pointerEvents = 'none';
      floater.style.transition = 'none';
    }
  }, [visible]);

  return (
    <div ref={tooltipRef} {...tooltipProps} data-tour-tooltip="true" style={{ border: 'none', outline: 'none', pointerEvents: 'auto' }} className="tour-guide-tooltip bg-white rounded-2xl p-5 w-80 max-w-sm shadow-2xl border-none outline-none">
      <div className="space-y-2">
        {step.content}
      </div>
      <div className="flex items-center justify-between mt-6">
        <div>
          {index > 0 && (
            <button type="button" onPointerDown={handleBackPointerDown} onClick={handleBackClick} style={{ border: 'none', outline: 'none', pointerEvents: 'auto' }} className="relative z-10 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors border-none outline-none bg-transparent">
              Kembali
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!isLastStep && (
            <button type="button" onPointerDown={handleClosePointerDown} onClick={handleCloseClick} style={{ border: 'none', outline: 'none', pointerEvents: 'auto' }} className="relative z-10 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors border-none outline-none bg-transparent">
              Lewati
            </button>
          )}
          <button type="button" onPointerDown={handlePrimaryPointerDown} onClick={handlePrimaryClick} style={{ border: 'none', outline: 'none', pointerEvents: 'auto' }} className="relative z-10 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg transition-colors shadow-md shadow-blue-500/20 border-none outline-none ring-0">
            {isLastStep ? 'Selesai' : 'Lanjut'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TourSpotlightOverlay({ active, step }: { active: boolean; step?: CustomStep }) {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const fullOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !step || !spotlightRef.current || !fullOverlayRef.current) {
      return;
    }

    let animationFrame = 0;

    const updateSpotlight = () => {
      const targetElement = getTargetElementFromStep(step);
      const spotlightElement = spotlightRef.current;
      const fullOverlayElement = fullOverlayRef.current;

      if (!spotlightElement || !fullOverlayElement) return;

      if (!targetElement || targetElement === document.body || step.placement === 'center') {
        fullOverlayElement.style.opacity = '1';
        spotlightElement.style.opacity = '0';
        animationFrame = requestAnimationFrame(updateSpotlight);
        return;
      }

      const targetRect = targetElement.getBoundingClientRect();
      const visibleTop = Math.max(0, targetRect.top);
      const visibleBottom = Math.min(window.innerHeight, targetRect.bottom);
      const visibleLeft = Math.max(0, targetRect.left);
      const visibleRight = Math.min(window.innerWidth, targetRect.right);
      const visibleWidth = Math.max(0, visibleRight - visibleLeft);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);

      fullOverlayElement.style.opacity = '0';
      spotlightElement.style.opacity = visibleWidth > 0 && visibleHeight > 0 ? '1' : '0';
      spotlightElement.style.width = `${visibleWidth}px`;
      spotlightElement.style.height = `${visibleHeight}px`;
      spotlightElement.style.transform = `translate3d(${visibleLeft}px, ${visibleTop}px, 0)`;
      animationFrame = requestAnimationFrame(updateSpotlight);
    };

    updateSpotlight();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [active, step]);

  if (!active) return null;

  return (
    <>
      <div
        ref={fullOverlayRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[900] bg-slate-950/72"
      />
      <div
        ref={spotlightRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[900] rounded-[10px] opacity-0 ring-1 ring-cyan-200/35 shadow-[0_0_0_9999px_rgba(2,6,23,0.72),0_0_34px_rgba(14,165,233,0.24)] will-change-transform"
      />
    </>
  );
}

function useDimFloatingTourDistractions(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const launcher = document.querySelector('.tour-target-assistant');
    const floatingContainer = launcher?.closest('.fixed') as HTMLElement | null;

    if (!floatingContainer) return;

    const previousOpacity = floatingContainer.style.opacity;
    const previousPointerEvents = floatingContainer.style.pointerEvents;
    const previousTransform = floatingContainer.style.transform;

    floatingContainer.style.opacity = '0';
    floatingContainer.style.pointerEvents = 'none';
    floatingContainer.style.transform = 'scale(0.96)';

    return () => {
      floatingContainer.style.opacity = previousOpacity;
      floatingContainer.style.pointerEvents = previousPointerEvents;
      floatingContainer.style.transform = previousTransform;
    };
  }, [active]);
}

function useHideDocumentScrollbarDuringTour(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflowY = root.style.overflowY;
    const previousBodyOverflowY = body.style.overflowY;
    const previousRootOverscrollBehavior = root.style.overscrollBehavior;
    const previousBodyOverscrollBehavior = body.style.overscrollBehavior;

    root.style.overflowY = 'hidden';
    body.style.overflowY = 'hidden';
    root.style.overscrollBehavior = 'none';
    body.style.overscrollBehavior = 'none';

    return () => {
      root.style.overflowY = previousRootOverflowY;
      body.style.overflowY = previousBodyOverflowY;
      root.style.overscrollBehavior = previousRootOverscrollBehavior;
      body.style.overscrollBehavior = previousBodyOverscrollBehavior;
    };
  }, [active]);
}

function useTourScrollLock(active: boolean, step?: CustomStep) {
  useEffect(() => {
    if (!active || !step) return;

    const targetElement = getTargetElementFromStep(step);

    if (!targetElement || targetElement === document.body || step.placement === 'center') return;

    const container = getScrollableParent(targetElement);

    if (!container) return;

    let animationFrame = 0;
    let touchStartY: number | null = null;
    let scrollLockEnabled = false;

    const scheduleClamp = () => {
      if (!scrollLockEnabled) return;

      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        clampScrollToStep(step);
      });
    };

    const handleWheel = (event: WheelEvent) => {
      if (!scrollLockEnabled) return;

      if (isScrollOutsideStepBounds(step, event.deltaY)) {
        event.preventDefault();
        clampScrollToStep(step);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!scrollLockEnabled || touchStartY === null) return;

      const currentY = event.touches[0]?.clientY ?? touchStartY;
      const deltaY = touchStartY - currentY;
      touchStartY = currentY;

      if (isScrollOutsideStepBounds(step, deltaY)) {
        event.preventDefault();
        clampScrollToStep(step);
      }
    };

    const activationTimer = window.setTimeout(() => {
      scrollLockEnabled = true;
      clampScrollToStep(step);
    }, SCROLL_LOCK_ACTIVATION_DELAY);

    container.addEventListener('scroll', scheduleClamp, { passive: true });
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('resize', scheduleClamp);

    return () => {
      window.clearTimeout(activationTimer);
      cancelAnimationFrame(animationFrame);
      container.removeEventListener('scroll', scheduleClamp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', scheduleClamp);
    };
  }, [active, step]);
}

const TOUR_STEPS: CustomStep[] = [
  {
    target: 'body',
    placement: 'center',
    route: '/dashboard',
    content: (
      <>
        <h3 className="font-bold text-lg text-slate-800">Selamat Datang di Dasbor My Tax! 🎉</h3>
        <p className="text-sm text-slate-600">Mari kita jelajahi seluruh fitur cerdas aplikasi ini agar pengelolaan pajak Anda menjadi sangat mudah.</p>
      </>
    )
  },
  {
    target: '.tour-target-sidebar',
    route: '/dashboard',
    placement: 'right',
    content: (
      <>
        <h3 className="font-bold text-lg text-slate-800 mb-2">Navigasi Utama</h3>
        <p className="text-sm text-slate-600">Ini adalah menu navigasi Anda. Dari sini Anda bisa berpindah ke modul Penghasilan, Aset, Dokumen, hingga Asisten AI secara instan.</p>
      </>
    )
  },
  {
    target: '.tour-target-ai-highlight',
    route: '/dashboard',
    placement: 'bottom',
    content: (
      <>
        <h3 className="font-bold text-lg text-slate-800 mb-2">✨ Sorotan Ajaib AI (Baru!)</h3>
        <p className="text-sm text-slate-600">Aktifkan mode ini, lalu <strong>blok/sorot teks apa pun</strong> di layar. Gemini AI akan langsung melayang di bawah teks tersebut siap untuk menjelaskannya kepada Anda!</p>
      </>
    )
  },
  {
    target: '.tour-target-dashboard-tabs',
    route: '/dashboard',
    placement: 'bottom',
    content: (
      <p className="text-sm text-slate-600">Anda juga dapat mengganti tab ini untuk melihat Analitik Lanjutan, Riwayat Transaksi lengkap, dan Kalender Pajak.</p>
    )
  },
  {
    target: '.tour-target-readiness',
    route: '/dashboard',
    placement: 'top',
    content: (
      <>
        <h3 className="font-bold text-lg text-slate-800 mb-2">Panel Kesiapan Pajak</h3>
        <p className="text-sm text-slate-600">Indikator utama kelengkapan data Anda. Capai 100% di sini untuk memastikan Anda aman dari denda DJP.</p>
      </>
    )
  },
  {
    target: '.tour-target-status-kelengkapan',
    route: '/dashboard',
    placement: 'bottom',
    content: (
      <p className="text-sm text-slate-600">Card ini menunjukkan status dokumen administratif Anda secara real-time berdasarkan input di modul-modul lain.</p>
    )
  },
  {
    target: '.tour-target-langkah-selanjutnya',
    route: '/dashboard',
    placement: 'bottom',
    content: (
      <p className="text-sm text-slate-600">Sistem cerdas kami akan selalu menyarankan tindakan spesifik yang perlu Anda lakukan selanjutnya pada card ini.</p>
    )
  },
  {
    target: '.tour-target-dashboard-stats',
    route: '/dashboard',
    placement: 'top',
    content: (
      <>
        <h3 className="font-bold text-lg text-slate-800 mb-2">Statistik Esensial</h3>
        <p className="text-sm text-slate-600">Pantau sekilas jumlah berkas pajak Anda dan persentase tarif pajak efektif (ETR) Anda yang dihitung secara matematis.</p>
      </>
    )
  },
  {
    target: '.tour-target-trend-chart',
    route: '/dashboard',
    placement: 'top',
    content: (
      <p className="text-sm text-slate-600">Grafik interaktif ini memvisualisasikan tren kewajiban pajak Anda bulan demi bulan sehingga mudah dianalisis.</p>
    )
  },
  {
    target: '.tour-target-income-form',
    route: '/dashboard/income',
    placement: 'top',
    content: (
      <>
        <h3 className="font-bold text-lg text-slate-800 mb-2">Penghasilan & Transaksi</h3>
        <p className="text-sm text-slate-600">Gunakan form ini untuk mencatat aliran dana Anda. Sistem otomatis membedakan Pajak Final dan Non-Final sesuai aturan.</p>
      </>
    )
  },
  {
    target: '.tour-target-income-list',
    route: '/dashboard/income',
    placement: 'bottom',
    content: (
      <p className="text-sm text-slate-600">Seluruh riwayat penghasilan yang telah Anda simpan akan tersusun rapi di tabel ini.</p>
    )
  },
  {
    target: '.tour-target-asset-form',
    route: '/dashboard/assets',
    placement: 'top',
    content: (
      <>
        <h3 className="font-bold text-lg text-slate-800 mb-2">Manajemen Harta & Aset</h3>
        <p className="text-sm text-slate-600">Penting untuk pelaporan SPT Tahunan! Catat semua aset baru Anda (rumah, kendaraan, saham) melalui form di sini.</p>
      </>
    )
  },
  {
    target: '.tour-target-asset-list',
    route: '/dashboard/assets',
    placement: 'top',
    content: (
      <p className="text-sm text-slate-600">Rekapitulasi nilai total aset Anda akan dipetakan dan dijumlahkan secara otomatis di area ini.</p>
    )
  },
  {
    target: '.tour-target-document-upload',
    route: '/dashboard/documents',
    placement: 'top',
    content: (
      <>
        <h3 className="font-bold text-lg text-slate-800 mb-2">Brankas Dokumen</h3>
        <p className="text-sm text-slate-600">Unggah dan simpan bukti potong bupot, NPWP, atau e-FIN Anda dengan aman di brankas digital terenkripsi ini.</p>
      </>
    )
  },
  {
    target: '.tax-type-chip',
    route: '/dashboard/kalkulator',
    placement: 'bottom',
    content: (
      <p className="text-sm text-slate-600">Jangan lupa, Anda bisa mengubah mode perhitungan dengan memilih jenis pajak (PPh 21, PPN, dll) di bagian ini.</p>
    )
  },
  {
    target: '.tour-target-calculator-form',
    route: '/dashboard/kalkulator',
    placement: 'right',
    content: (
      <>
        <h3 className="font-bold text-lg text-slate-800 mb-2">Simulasi Kalkulator</h3>
        <p className="text-sm text-slate-600">Pusat perhitungan presisi. Masukkan angka Anda di form ini, dan algoritma kami akan menghitung pajaknya berdasarkan UU HPP.</p>
      </>
    )
  },
  {
    target: '.tour-target-assistant-chat',
    route: '/dashboard/assistant',
    placement: 'left',
    content: (
      <>
        <h3 className="font-bold text-lg text-slate-800 mb-2">Asisten AI Pajak</h3>
        <p className="text-sm text-slate-600">Ruang obrolan pribadi Anda dengan Gemini AI. Tanya apa saja soal regulasi atau cara lapor, ia akan menjawab layaknya konsultan profesional. Selesai!</p>
      </>
    )
  },
];

const JOYRIDE_STEPS: CustomStep[] = TOUR_STEPS.map((step) => ({
  ...step,
  floatingOptions: {
    ...step.floatingOptions,
    autoUpdate: {
      ...step.floatingOptions?.autoUpdate,
      animationFrame: true,
    },
    flipOptions: false,
  },
  hideOverlay: true,
  skipBeacon: true,
  skipScroll: true,
  spotlightPadding: 0,
  spotlightRadius: 10,
  targetWaitTimeout: 10000,
}));

export default function TourGuide() {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isSamePageTransitioning, setIsSamePageTransitioning] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const pendingRouteStepRef = useRef<{ route: string; stepIndex: number } | null>(null);
  const targetObserverRef = useRef<MutationObserver | null>(null);
  const targetWaitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handledTooltipStepRef = useRef<number | null>(null);
  const tooltipRevealTokenRef = useRef(0);
  const pendingTooltipScrollBehaviorRef = useRef<ScrollBehavior>('auto');
  const samePageTransitionRef = useRef(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const currentStep = JOYRIDE_STEPS[stepIndex];

  useDimFloatingTourDistractions(run);
  useHideDocumentScrollbarDuringTour(run || isSamePageTransitioning);
  useKeepTooltipFullyVisible(run && isTooltipVisible, currentStep);
  useTourScrollLock(run && isTooltipVisible, currentStep);

  const clearRoutePolling = useCallback((clearPendingStep = false) => {
    if (targetObserverRef.current) {
      targetObserverRef.current.disconnect();
      targetObserverRef.current = null;
    }

    if (targetWaitTimeoutRef.current) {
      clearTimeout(targetWaitTimeoutRef.current);
      targetWaitTimeoutRef.current = null;
    }

    if (clearPendingStep) {
      pendingRouteStepRef.current = null;
    }
  }, []);

  const finishTour = useCallback(() => {
    clearRoutePolling(true);
    tooltipRevealTokenRef.current += 1;
    setIsTooltipVisible(false);
    setRun(false);
    localStorage.setItem('myTax_tour_completed', 'true');
    window.dispatchEvent(new Event('tour_completed'));

    if (pathname !== '/dashboard') {
      router.push('/dashboard');
    }
  }, [clearRoutePolling, pathname, router]);

  const isStepTargetReady = useCallback((step: CustomStep) => {
    return Boolean(getTargetElementFromStep(step));
  }, []);

  const startTargetWatcher = useCallback((nextStepIndex: number) => {
    const nextStep = JOYRIDE_STEPS[nextStepIndex];

    if (!nextStep) return;

    clearRoutePolling();

    const resumeWhenTargetReady = () => {
      if (!isStepTargetReady(nextStep)) return;

      clearRoutePolling(true);
      tooltipRevealTokenRef.current += 1;
      pendingTooltipScrollBehaviorRef.current = 'smooth';
      setIsTooltipVisible(false);
      setStepIndex(nextStepIndex);
      setRun(true);
    };

    resumeWhenTargetReady();

    if (isStepTargetReady(nextStep)) return;

    targetObserverRef.current = new MutationObserver(resumeWhenTargetReady);
    targetObserverRef.current.observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    targetWaitTimeoutRef.current = setTimeout(() => {
      clearRoutePolling(true);
    }, 10000);
  }, [clearRoutePolling, isStepTargetReady]);

  const navigateAndResumeTour = useCallback((route: string, nextStepIndex: number) => {
    clearRoutePolling(true);
    pendingRouteStepRef.current = { route, stepIndex: nextStepIndex };
    tooltipRevealTokenRef.current += 1;
    setIsTooltipVisible(false);
    setRun(false);
    router.push(route);
  }, [clearRoutePolling, router]);

  const transitionToStepOnSamePage = useCallback(async (nextStepIndex: number) => {
    if (samePageTransitionRef.current) return;

    const nextStep = JOYRIDE_STEPS[nextStepIndex];

    if (!nextStep) return;

    samePageTransitionRef.current = true;
    setIsSamePageTransitioning(true);
    tooltipRevealTokenRef.current += 1;
    setIsTooltipVisible(false);
    handledTooltipStepRef.current = null;
    setRun(false);

    try {
      await waitForLayoutToSettle();

      pendingTooltipScrollBehaviorRef.current = 'smooth';
      setStepIndex(nextStepIndex);
      setRun(true);
    } finally {
      setIsSamePageTransitioning(false);
      samePageTransitionRef.current = false;
    }
  }, []);

  const moveToStep = useCallback((nextStepIndex: number) => {
    const activeStep = JOYRIDE_STEPS[stepIndex];
    const nextStep = JOYRIDE_STEPS[nextStepIndex];

    if (nextStepIndex < 0) return;

    if (!nextStep) {
      finishTour();
      return;
    }

    if (nextStep.route && activeStep?.route && nextStep.route !== activeStep.route) {
      navigateAndResumeTour(nextStep.route, nextStepIndex);
      return;
    }

    void transitionToStepOnSamePage(nextStepIndex);
  }, [finishTour, navigateAndResumeTour, stepIndex, transitionToStepOnSamePage]);

  const handleTooltipBackClick = useCallback((_event: MouseEvent<HTMLButtonElement>, index: number) => {
    moveToStep(index - 1);
  }, [moveToStep]);

  const handleTooltipCloseClick = useCallback(() => {
    finishTour();
  }, [finishTour]);

  const handleTooltipPrimaryClick = useCallback((
    _event: MouseEvent<HTMLButtonElement>,
    index: number,
    isLastStep: boolean,
  ) => {
    if (isLastStep) {
      finishTour();
      return;
    }

    moveToStep(index + 1);
  }, [finishTour, moveToStep]);

  const TooltipComponent = useCallback((props: TooltipRenderProps) => (
    <CustomTooltip
      {...props}
      visible={isTooltipVisible}
      onBackClick={handleTooltipBackClick}
      onCloseClick={handleTooltipCloseClick}
      onPrimaryClick={handleTooltipPrimaryClick}
    />
  ), [handleTooltipBackClick, handleTooltipCloseClick, handleTooltipPrimaryClick, isTooltipVisible]);

  useEffect(() => {
    setIsMounted(true);
    const hasSeenTour = localStorage.getItem('myTax_tour_completed');
    
    if (!hasSeenTour) {
      setRun(true);
    }

    return () => {
      samePageTransitionRef.current = false;
      clearRoutePolling(true);
    };
  }, [clearRoutePolling]);

  useEffect(() => {
    const pendingRouteStep = pendingRouteStepRef.current;

    if (!pendingRouteStep || pathname !== pendingRouteStep.route) return;

    startTargetWatcher(pendingRouteStep.stepIndex);
  }, [pathname, startTargetWatcher]);

  useEffect(() => {
    tooltipRevealTokenRef.current += 1;
    handledTooltipStepRef.current = null;
    setIsTooltipVisible(false);
  }, [stepIndex, pathname]);

  const handleJoyrideCallback = (data: EventData) => {
    const { action, index, status, type } = data;
    const currentStep = JOYRIDE_STEPS[index];

    if (type === EVENTS.TOOLTIP && currentStep) {
      if (handledTooltipStepRef.current !== index) {
        handledTooltipStepRef.current = index;
        const revealToken = tooltipRevealTokenRef.current + 1;
        const revealScrollBehavior = pendingTooltipScrollBehaviorRef.current;
        tooltipRevealTokenRef.current = revealToken;
        pendingTooltipScrollBehaviorRef.current = 'auto';

        void settleTooltipPositionBeforeReveal(currentStep, revealScrollBehavior).then(() => {
          if (tooltipRevealTokenRef.current === revealToken) {
            setIsTooltipVisible(true);
          }
        });
      }
      return;
    }

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      finishTour();
    } else if (type === EVENTS.TARGET_NOT_FOUND) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      moveToStep(nextStepIndex);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      <TourSpotlightOverlay active={run} step={currentStep} />
      <Joyride
        steps={JOYRIDE_STEPS}
        run={run}
        stepIndex={stepIndex}
        continuous
        onEvent={handleJoyrideCallback}
        tooltipComponent={TooltipComponent}
        options={{
          overlayColor: 'rgba(15, 23, 42, 0)',
          zIndex: 1000,
          arrowColor: '#ffffff',
        }}
        styles={{
          floater: {
            pointerEvents: 'auto',
          },
        }}
      />
    </>
  );
}
