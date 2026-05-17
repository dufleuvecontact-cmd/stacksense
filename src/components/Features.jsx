import { useEffect, useRef } from 'react'
import { LayoutGrid, Clock, Bell, BarChart2, ShieldCheck, Search, Download, Smartphone } from 'lucide-react'

const features = [
  { icon: LayoutGrid,   title: 'Organised Tracking',      desc: 'Every compound, dose, and cycle in one clean workspace. No spreadsheets. No guesswork.', color: '#1a8c87' },
  { icon: Clock,        title: 'Full Activity History',   desc: 'A tamper-proof log you can revisit any time — with dates, notes, and dosage details intact.', color: '#0d6b67' },
  { icon: Bell,         title: 'Smart Reminders',          desc: 'Customisable alerts that fit your schedule. Never miss a window, never double-dose.', color: '#25b5af' },
  { icon: BarChart2,    title: 'Clean Data Views',         desc: 'Charts and summaries that turn raw entries into insight. Understand your data at a glance.', color: '#1a8c87' },
  { icon: ShieldCheck,  title: 'Safety-First Workflows',   desc: 'Built-in safeguards, cycle limits, and flagging help you stay within safe parameters.', color: '#0d6b67' },
  { icon: Search,       title: 'Fast Search & Filter',     desc: 'Full-text search across your entire log history. Find any entry in seconds.', color: '#25b5af' },
  { icon: Download,     title: 'Export & Records Access',  desc: 'Generate clean exports in PDF or CSV for personal records or professional review.', color: '#1a8c87' },
  { icon: Smartphone,   title: 'Mobile-Ready',              desc: 'Log on your phone, review on your desktop. Everything synced, everything in reach.', color: '#0d6b67' },
]

export default function Features() {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target) } })
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
    ref.current.querySelectorAll('.sr,.sr-fade').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="features" ref={ref} className="section" style={{ background: '#fff' }}>
      <div className="wrap">
        <div className="sr" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p className="eyebrow" style={{ marginBottom: '.75rem' }}>Core Features</p>
          <h2 className="display-md" style={{ marginBottom: '1rem' }}>
            Everything you need to<br/>
            <span className="italic-serif teal-text"> stay in control</span>
          </h2>
          <p className="lead" style={{ maxWidth: 500, margin: '0 auto' }}>
            A focused toolkit built around clarity, safety, and consistency.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: '1rem' }}>
          {features.map((f, i) => (
            <div key={f.title} className={`card sr d${(i % 8) + 1}`} style={{ padding: '1.5rem', cursor: 'default' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 11,
                background: `${f.color}14`, border: `1px solid ${f.color}28`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
              }}>
                <f.icon size={18} color={f.color} strokeWidth={1.8}/>
              </div>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '.95rem', marginBottom: '.45rem', letterSpacing: '-.01em', color: 'var(--text)' }}>
                {f.title}
              </h3>
              <p className="body">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
