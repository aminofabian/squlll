import { useEffect } from "react";

const PREVIOUS_CLASS_KEY = "[";
const NEXT_CLASS_KEY = "]";
const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return TYPING_TAGS.has(target.tagName) || target.isContentEditable;
}

/** "[" and "]" step to the previous and next class while nothing is being typed. */
export function useClassStepperKeys(handlers: {
  onPrevious?: () => void;
  onNext?: () => void;
  enabled: boolean;
}) {
  const { onPrevious, onNext, enabled } = handlers;

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
      if (event.key === PREVIOUS_CLASS_KEY && onPrevious) {
        event.preventDefault();
        onPrevious();
      }
      if (event.key === NEXT_CLASS_KEY && onNext) {
        event.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, onPrevious, onNext]);
}
