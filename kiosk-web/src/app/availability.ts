// Live availability gate for a single product (old kiosk: checkProductAvailable on card tap / info / detail add).
// Installed into the store at boot when the menu comes from the kiosk API (docs/reference/kiosk-product-checks.md §2).

import { withTimeout } from '../adapters/withTimeout'
import { patchUnavailable } from '../engine/state'
import { useEngine, type AvailabilityGate } from '../store/engine'
import { getRuntime } from './runtime'

/**
 * 'ok' | 'soldOut' from the API; 'unknown' on error, non-boolean body or timeout. Unknown never marks the
 * product sold out (the old kiosk did); the store then shows "could not check, try again" and adds nothing.
 */
export const liveGate: AvailabilityGate = async (pid) => {
  const rt = getRuntime()
  try {
    const r = await withTimeout(rt.resolved.adapters.availability.check([pid]), rt.config.timeouts.availability, 'availability')
    if (r.unknownIds?.includes(pid)) {
      rt.log('availability.unknown', { pid })
      return 'unknown'
    }
    const soldOut = r.unavailableIds.includes(pid)
    patchUnavailable([pid], soldOut ? [pid] : [])
    useEngine.getState().availChanged()
    if (soldOut) rt.log('availability.soldOut', { pid })
    return soldOut ? 'soldOut' : 'ok'
  } catch (e) {
    rt.log('availability.failed', { pid, error: String(e) })
    return 'unknown'
  }
}
