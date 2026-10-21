import type { CSSProperties } from 'react'

/** Inline twin of `button.press *{pointer-events:none}`: a label or icon inside a button is never the tap target. */
export const NO_HIT: CSSProperties = { pointerEvents: 'none' }
