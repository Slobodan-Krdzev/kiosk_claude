// Order-tag illustrations (table sign / pager / name), shared by the tag screen and the success screen.

export const TAG_ILL: Record<'table' | 'pager' | 'name', React.ReactNode> = {
  table: (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M14 104h92" />
      <path d="M28 104 52 20h30l20 84" />
      <path d="M52 20 38 104" opacity=".35" />
      <text x="68" y="78" textAnchor="middle" className="tag-ill-n" stroke="none">
        12
      </text>
    </svg>
  ),
  pager: (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round">
      <circle cx="56" cy="64" r="40" />
      <circle cx="56" cy="64" r="22" opacity=".35" />
      <text x="56" y="74" textAnchor="middle" className="tag-ill-n" stroke="none" style={{ fontSize: 28 }}>
        7
      </text>
      <path d="M94 16c7 6 11 13 11 22M84 24c4 4 7 8 7 14" className="tag-ill-a" />
    </svg>
  ),
  name: (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round">
      <path d="M18 26h84a8 8 0 0 1 8 8v42a8 8 0 0 1-8 8H54l-22 18V84H18a8 8 0 0 1-8-8V34a8 8 0 0 1 8-8z" />
      <text x="60" y="68" textAnchor="middle" className="tag-ill-n" stroke="none" style={{ fontSize: 30 }}>
        Aa
      </text>
    </svg>
  ),
}
