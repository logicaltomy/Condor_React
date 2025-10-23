import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock global por si algún módulo toca localStorage al importarse
const store: Record<string, string> = {}

// Mock básico de localStorage
vi.stubGlobal('localStorage', {

  // Simula getItem, setItem, removeItem y clear
  getItem: (key: string) => (key in store ? store[key] : null),
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { for (const k of Object.keys(store)) delete store[k] },
})
