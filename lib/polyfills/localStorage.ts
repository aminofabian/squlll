/**
 * localStorage polyfill for Node.js/Bun environments
 * Fixes the issue where localStorage exists but methods aren't functions
 */

if (typeof window === 'undefined' && typeof global !== 'undefined') {
  // We're in Node.js/Bun server environment
  const createNoopStorage = () => ({
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  });

  // Check if localStorage exists but is broken
  try {
    if (typeof globalThis.localStorage !== 'undefined') {
      // Test if getItem is actually a function
      if (typeof globalThis.localStorage.getItem !== 'function') {
        console.warn('[localStorage polyfill] Detected broken localStorage, replacing with noop storage');
        (globalThis as any).localStorage = createNoopStorage();
      }
    } else {
      // localStorage doesn't exist, create noop version
      (globalThis as any).localStorage = createNoopStorage();
    }
  } catch (error) {
    // If any error occurs, just use noop storage
    console.warn('[localStorage polyfill] Error accessing localStorage, using noop storage:', error);
    (globalThis as any).localStorage = createNoopStorage();
  }
}

export {};

