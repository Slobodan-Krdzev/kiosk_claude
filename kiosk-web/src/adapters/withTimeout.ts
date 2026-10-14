export class AdapterTimeout extends Error {
  op: string
  ms: number
  constructor(op: string, ms: number) {
    super(`${op} timed out after ${ms} ms`)
    this.name = 'AdapterTimeout'
    this.op = op
    this.ms = ms
  }
}

/** Rejects with AdapterTimeout after `ms`. The caller must treat that as UNKNOWN, not as failure. */
export function withTimeout<T>(p: Promise<T>, ms: number, op: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new AdapterTimeout(op, ms)), ms)
    p.then(
      (v) => {
        clearTimeout(timer)
        resolve(v)
      },
      (e) => {
        clearTimeout(timer)
        reject(e)
      },
    )
  })
}

export function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
