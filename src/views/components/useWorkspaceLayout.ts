import { RefObject, useLayoutEffect, useState } from 'react';

export const WORKSPACE_STACKED_BREAKPOINT = 1440;
export const TIMETABLE_COMPACT_BREAKPOINT = 900;

const STACKED_MEDIA_QUERY = `(min-width: ${WORKSPACE_STACKED_BREAKPOINT}px)`;

export type WorkspaceLayoutState = {
  isStacked: boolean;
  isCompact: boolean;
};

function getStackedFromMedia(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  const mediaQuery = window.matchMedia(STACKED_MEDIA_QUERY);
  return mediaQuery ? !mediaQuery.matches : false;
}

export function useWorkspaceLayout(
  timetableRef: RefObject<HTMLElement | null>,
): WorkspaceLayoutState {
  const [isStacked, setIsStacked] = useState(getStackedFromMedia);
  const [timetableWidth, setTimetableWidth] = useState(TIMETABLE_COMPACT_BREAKPOINT);

  useLayoutEffect(() => {
    const timetableEl = timetableRef.current;
    let cleanupStacked: (() => void) | undefined;

    if (typeof window.matchMedia === 'function') {
      const mediaQuery = window.matchMedia(STACKED_MEDIA_QUERY);

      const syncStacked = () => {
        setIsStacked(!mediaQuery.matches);
      };

      syncStacked();

      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', syncStacked);
        cleanupStacked = () => mediaQuery.removeEventListener('change', syncStacked);
      } else {
        mediaQuery.addListener(syncStacked);
        cleanupStacked = () => mediaQuery.removeListener(syncStacked);
      }
    } else {
      const syncStackedFromWidth = () => {
        setIsStacked(window.innerWidth < WORKSPACE_STACKED_BREAKPOINT);
      };

      syncStackedFromWidth();
      window.addEventListener('resize', syncStackedFromWidth);
      cleanupStacked = () => window.removeEventListener('resize', syncStackedFromWidth);
    }

    const syncTimetableWidth = () => {
      if (timetableEl) {
        setTimetableWidth(timetableEl.getBoundingClientRect().width);
      }
    };

    syncTimetableWidth();

    let cleanupTimetableResize: (() => void) | undefined;

    if (typeof ResizeObserver !== 'undefined') {
      let rafId = 0;

      const observer = new ResizeObserver((entries) => {
        // Defer past the current layout pass so compact toggles cannot re-enter
        // ResizeObserver in the same frame (avoids "undelivered notifications" loop).
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          rafId = 0;
          for (const entry of entries) {
            if (entry.target === timetableEl) {
              const width = entry.contentRect.width;
              setTimetableWidth((prev) => (prev === width ? prev : width));
            }
          }
        });
      });

      if (timetableEl) observer.observe(timetableEl);

      cleanupTimetableResize = () => {
        if (rafId) cancelAnimationFrame(rafId);
        observer.disconnect();
      };
    } else {
      window.addEventListener('resize', syncTimetableWidth);
      cleanupTimetableResize = () => window.removeEventListener('resize', syncTimetableWidth);
    }

    return () => {
      cleanupStacked?.();
      cleanupTimetableResize?.();
    };
  }, [timetableRef]);

  const isCompact = timetableWidth < TIMETABLE_COMPACT_BREAKPOINT;

  return { isStacked, isCompact };
}