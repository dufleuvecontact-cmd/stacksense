const words = ['Peptide Tracking','Dose Adherence','Cycle Management','Smart Reminders','Progress Insights','Safety-First','Bioavailability','Clinical Clarity','Data Ownership','Full History Log']

export default function MarqueeStrip({ dark = false }) {
  const items = [...words, ...words]
  return (
    <div style={{
      overflow: 'hidden',
      borderTop: `1px solid ${dark ? 'rgba(255,255,255,.07)' : 'var(--border)'}`,
      borderBottom: `1px solid ${dark ? 'rgba(255,255,255,.07)' : 'var(--border)'}`,
      padding: '.75rem 0',
      background: dark ? 'rgba(255,255,255,.02)' : 'rgba(26,140,135,.03)',
    }}>
      <div className="marquee-inner">
        {items.map((w, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: '1rem',
            padding: '0 1.5rem',
            fontSize: '.72rem', fontWeight: 600, letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: dark ? 'rgba(255,255,255,.35)' : 'var(--text-3)',
            fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap',
          }}>
            {w}
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: dark ? 'rgba(26,140,135,.5)' : 'var(--teal)', opacity: .6, display: 'inline-block' }}/>
          </span>
        ))}
      </div>
    </div>
  )
}
