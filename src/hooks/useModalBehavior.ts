import { RefObject, useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

let scrollLocks = 0;

interface ModalBehaviorOptions {
  /** Close on Escape (default true). */
  closeOnEscape?: boolean;
  /** Lock page scroll while open (default true). */
  lockScroll?: boolean;
  /** Element to focus on open; defaults to the first focusable element in the container. */
  initialFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Shared dialog/drawer behavior: Escape to close, page scroll lock, focus moved
 * into the container and trapped with Tab, and focus returned to the trigger on close.
 */
export function useModalBehavior(
  isOpen: boolean,
  onClose: () => void,
  containerRef: RefObject<HTMLElement | null>,
  { closeOnEscape = true, lockScroll = true, initialFocusRef }: ModalBehaviorOptions = {}
) {
  // Keep the latest onClose without re-running the effect (callers often pass inline functions).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    if (lockScroll) {
      scrollLocks += 1;
      document.body.style.overflow = 'hidden';
    }

    const focusTimer = window.setTimeout(() => {
      const container = containerRef.current;
      if (!container || container.contains(document.activeElement)) return;
      const target = initialFocusRef?.current ?? container.querySelector<HTMLElement>(FOCUSABLE) ?? container;
      if (target === container && !container.hasAttribute('tabindex')) container.setAttribute('tabindex', '-1');
      target.focus();
    }, 30);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const container = containerRef.current;
      if (!container) return;
      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        el => el.offsetParent !== null || el === document.activeElement
      );
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      if (lockScroll) {
        scrollLocks = Math.max(0, scrollLocks - 1);
        if (scrollLocks === 0) document.body.style.overflow = '';
      }
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus();
    };
  }, [isOpen, closeOnEscape, lockScroll, containerRef, initialFocusRef]);
}
