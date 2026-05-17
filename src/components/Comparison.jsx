import { useEffect, useRef } from 'react'
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react'

const features = [
  { label: 'Peptide protocols', ss: 'Yes', mfp: 'No', sheet: 'Manual', crono: 'No' },
  { label: 'Bioavailability calc', ss: 'Yes', mfp: 'No', sheet: 'No', crono: 'No' },
  { label: 'Cycle tracking', ss: 'Yes', mfp: 'No', sheet: 'Manual', crono: 'No' },
  { label: '420+ compounds', ss: 'Yes', mfp: 'No', sheet: 'DIY', crono: 'Limited' },
]

export default function Comparison() {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target) } })
    }, { threshold: 0.08 })
    ref.current.querySelectorAll('.sr,.sr-fade,.sr-left,.sr-right').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="comparison" ref={ref} className="section" style={{ background: 'var(--bg)' }}>
      <div className="wrap">
        <div className="sr" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p className="eyebrow" style={{ marginBottom: '.75rem' }}>The 10X Difference</p>
          <h2 className="display-md" style={{ marginBottom: '1rem' }}>
            Why spreadsheets <span className="italic-serif teal-text">fail you.</span>
          </h2>
          <p className="lead" style={{ maxWidth: 620, margin: '0 auto' }}>
            Generic calorie trackers don't understand peptide half-lives. Spreadsheets require endless manual maintenance. Here is how StackSense stacks up.
          </p>
        </div>

        <div className="sr card-flat" style={{ overflow: 'hidden', padding: '1rem', background: '#fff' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 680 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '1.25rem 1.5rem', fontFamily: 'var(--font-sans)', fontSize: '.9rem', fontWeight: 700, color: 'var(--text)' }}>Feature</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontFamily: 'var(--font-sans)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--teal-deep)', background: 'var(--teal-muted)', borderRadius: '12px 12px 0 0', width: '22%' }}>StackSense</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontFamily: 'var(--font-sans)', fontSize: '.9rem', fontWeight: 700, color: 'var(--text-2)', width: '19%' }}>MyFitnessPal</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontFamily: 'var(--font-sans)', fontSize: '.9rem', fontWeight: 700, color: 'var(--text-2)', width: '19%' }}>Spreadsheets</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontFamily: 'var(--font-sans)', fontSize: '.9rem', fontWeight: 700, color: 'var(--text-2)', width: '19%' }}>Cronometer</th>
                </tr>
              </thead>
              <tbody>
                {features.map((f, i) => (
                  <tr key={f.label} style={{ borderBottom: i === features.length - 1 ? 'none' : '1px solid var(--border)' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--text)', fontSize: '.95rem' }}>{f.label}</td>
                    
                    {/* StackSense Column */}
                    <td style={{ padding: '1.25rem 1.5rem', background: 'var(--teal-muted)', fontWeight: 700, color: 'var(--teal-deep)', borderRadius: i === features.length - 1 ? '0 0 12px 12px' : '0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <CheckCircle2 size={18} color="var(--teal)" strokeWidth={2.5}/>
                        <span>{f.ss}</span>
                      </div>
                    </td>

                    {/* MFP */}
                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <XCircle size={17} color="#ef4444" opacity={0.7}/>
                        <span>{f.mfp}</span>
                      </div>
                    </td>

                    {/* Spreadsheets */}
                    <td style={{ padding: '1.25rem 1.5rem', color: f.sheet === 'No' ? 'var(--text-3)' : 'var(--text-2)', fontWeight: f.sheet !== 'No' ? 600 : 400 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        {f.sheet === 'No' ? <XCircle size={17} color="#ef4444" opacity={0.7}/> : <HelpCircle size={17} color="#f59e0b"/>}
                        <span>{f.sheet}</span>
                      </div>
                    </td>

                    {/* Cronometer */}
                    <td style={{ padding: '1.25rem 1.5rem', color: f.crono === 'No' ? 'var(--text-3)' : 'var(--text-2)', fontWeight: f.crono !== 'No' ? 600 : 400 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        {f.crono === 'No' ? <XCircle size={17} color="#ef4444" opacity={0.7}/> : <HelpCircle size={17} color="#f59e0b"/>}
                        <span>{f.crono}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
