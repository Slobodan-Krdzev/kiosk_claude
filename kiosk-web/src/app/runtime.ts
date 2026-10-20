// Process-wide singletons: adapters, payment controller, structured log.
// Created once in the boot sequence; React reads them through hooks.

import { recordAcceptedOrder } from '../engine/popularity'
import { resolveAdapters, type ResolvedAdapters } from '../adapters'
import { getDeviceId, newOrderId } from '../domain/ids'
import type { GuestitConfig } from '../domain/types'
import { PaymentController } from '../payment/controller'
import { LocalStoragePaidRecordStore } from '../payment/persistence'
import { useEngine } from '../store/engine'
import { attachPayState } from '../store/payment'

export interface LogEntry {
  at: string
  event: string
  data?: Record<string, unknown>
}

export interface Runtime {
  deviceId: string
  resolved: ResolvedAdapters
  controller: PaymentController
  config: GuestitConfig
  log: (event: string, data?: Record<string, unknown>) => void
  logEntries: () => LogEntry[]
}

let runtime: Runtime | null = null
const buffer: LogEntry[] = []

function log(event: string, data?: Record<string, unknown>): void {
  const entry: LogEntry = { at: new Date().toISOString(), event, data }
  buffer.push(entry)
  if (buffer.length > 200) buffer.shift()
  if (import.meta.env.DEV) console.debug(`[kiosk] ${event} ${data ? JSON.stringify(data) : ''}`)
}

export function createRuntime(resolved: ResolvedAdapters, config: GuestitConfig): Runtime {
  const deviceId = getDeviceId()
  const controller = new PaymentController({
    adapters: { payment: resolved.adapters.payment, pos: resolved.adapters.pos, printer: resolved.adapters.printer },
    store: new LocalStoragePaidRecordStore(),
    timeouts: config.timeouts,
    uncertainMs: config.uncertainMs,
    currency: config.currency,
    deviceId,
    newOrderId: () => newOrderId(deviceId),
    onAccepted: ({ orderNo, snapshot, orderId }) => {
      // The cart is emptied only now — after the POS accepted the order.
      useEngine.getState().setCart([])
      // Per-device "Popular" tally (simulated on the frontend, 2026-10-20).
      recordAcceptedOrder(snapshot)
      resolved.adapters.analytics.send([{ type: 'order_accepted', at: new Date().toISOString(), data: { orderNo, totalCents: snapshot.totals.totalCents, count: snapshot.totals.count } }])
      if (snapshot.loyalty) {
        void resolved.adapters.loyalty.commit({ key: `LTY-${orderId}`, memberId: snapshot.loyalty.memberId, orderId, totalCents: snapshot.totals.totalCents })
      }
    },
    log,
  })
  runtime = { deviceId, resolved, controller, config, log, logEntries: () => [...buffer] }
  attachPayState(controller)
  return runtime
}

export function getRuntime(): Runtime {
  if (!runtime) throw new Error('runtime not booted')
  return runtime
}

export function hasRuntime(): boolean {
  return runtime !== null
}

export { resolveAdapters }
