import type { GuestitAdapters } from './types'
import { createStaticAdapters, type StaticAdaptersHandle } from './static/staticAdapters'

export interface ResolvedAdapters {
  adapters: GuestitAdapters
  /** Present only when running on the static simulation. */
  staticHandle: StaticAdaptersHandle | null
}

/**
 * Resolution order:
 * 1. window.GuestitAdapters — injected by the Guestit Launcher (Kotlin) later.
 * 2. Static JSON simulation (development).
 * In production mode the kiosk must refuse to run without real adapters (v36 rule);
 * that check happens in the boot sequence once the config is known.
 */
export function resolveAdapters(): ResolvedAdapters {
  if (typeof window !== 'undefined' && window.GuestitAdapters) {
    return { adapters: window.GuestitAdapters, staticHandle: null }
  }
  const handle = createStaticAdapters()
  return { adapters: handle.adapters, staticHandle: handle }
}
