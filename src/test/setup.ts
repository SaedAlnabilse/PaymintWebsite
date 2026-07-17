import '@testing-library/jest-dom';

// Node >= 22 ships an experimental global `localStorage` that is undefined
// unless --localstorage-file is passed, and it shadows jsdom's implementation
// in the vitest environment. Install a spec-compliant in-memory stub so
// components and tests can use web storage normally.
function createStorageStub(): Storage {
  let store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(String(key), String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store = new Map();
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  } as Storage;
}

for (const name of ['localStorage', 'sessionStorage'] as const) {
  if (typeof window !== 'undefined' && !window[name]) {
    const stub = createStorageStub();
    Object.defineProperty(window, name, { value: stub, configurable: true });
    Object.defineProperty(globalThis, name, { value: stub, configurable: true });
  }
}
