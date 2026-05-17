import { useEffect, useRef } from 'react'
import { TrendingUp, Target, Users, FileText, ArrowRight, Mail, CheckCircle2 } from 'lucide-react'

const highlights = [
  { icon:TrendingUp, label:'Stage',   val:'Seed',        sub:'Active fundraising', color:'#1a8c87' },
  { icon:Target,     label:'Focus',   val:'Health-tech', sub:'Workflow & data',    color:'#0d6b67' },
  { icon:Users,      label:'Traction',val:'Growing',     sub:'Waitlist + beta',    color:'#25b5af' },
  { icon:FileText,   label:'Product', val:'Live MVP',    sub:'Core features done', color:'#1a8c87' },
]

const reasons = [
  { title:'Underserved market',   desc:'The peptide space has grown substantially yet lacks serious purpose-built tracking infrastructure. We are building that foundation.' },
  { title:'Working product',      desc:'This is not a pitch deck — StackSense is a functional product in active development with real user feedback informing every iteration.' },
  { title:'Defensible data moat', desc:'As users log more data over time the platform becomes more valuable and harder to replicate. Structured longitudinal data is a significant advantage.' },
  { title:'Clear growth path',    desc:'From individual users to practitioners to enterprise — the platform scales across segments with minimal product variation.' },
]

export default function Funding() {
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
    <section id="funding" ref={ref} className="section" style={{ background:'#fff' }}>
      <div className="wrap">
        <div className="sr" style={{ textAlign:'center', marginBottom:'3.5rem' }}>
          <p className="eyebrow" style={{ marginBottom:'.75rem' }}>For Investors</p>
          <h2 className="display-md" style={{ marginBottom:'1rem' }}>
            Seeking<span className="italic-serif teal-text"> seed-round funding</span>
          </h2>
          <p className="lead" style={{ maxWidth:500, margin:'0 auto' }}>
            Working product, validated market interest, and a clear path to scale. We're looking for aligned investors who understand the opportunity.
          </p>
        </div>

        {/* Stat cards */}
        <div className="sr" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'1rem', marginBottom:'2.5rem' }}>
          {highlights.map(h=>(
            <div key={h.label} className="card-flat" style={{ padding:'1.25rem', textAlign:'center' }}>
              <div style={{ width:40,height:40,background:`${h.color}12`,border:`1px solid ${h.color}22`,borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto .75rem' }}>
                <h.icon size={17} color={h.color} strokeWidth={1.8}/>
              </div>
              <div style={{ fontSize:'.65rem',color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.06em',fontFamily:'var(--font-sans)',marginBottom:'.2rem' }}>{h.label}</div>
              <div style={{ fontSize:'1.05rem',fontWeight:800,letterSpacing:'-.02em',fontFamily:'var(--font-sans)',color:'var(--text)',marginBottom:'.12rem' }}>{h.val}</div>
              <div className="small">{h.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'2rem' }} id="funding-grid">
          {/* Why invest */}
          <div className="card-flat sr-left" style={{ padding:'1.75rem' }}>
            <h3 style={{ fontFamily:'var(--font-sans)',fontSize:'1rem',fontWeight:700,marginBottom:'1.2rem',color:'var(--text)' }}>Why invest in StackSense</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {reasons.map(r=>(
                <div key={r.title} style={{ display:'flex',gap:'.7rem',alignItems:'flex-start' }}>
                  <CheckCircle2 size={14} color="var(--teal)" style={{ marginTop:2,flexShrink:0 }}/>
                  <div>
                    <div style={{ fontSize:'.85rem',fontWeight:700,marginBottom:'.18rem',fontFamily:'var(--font-sans)',color:'var(--text)' }}>{r.title}</div>
                    <p className="small" style={{ lineHeight:1.65 }}>{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA card */}
          <div className="sr-right" style={{ background:'linear-gradient(135deg,rgba(26,140,135,.07) 0%,rgba(13,107,103,.04) 100%)',border:'1px solid rgba(26,140,135,.18)',borderRadius:18,padding:'1.75rem',display:'flex',flexDirection:'column',justifyContent:'space-between' }}>
            <div>
              <span className="pill pill-teal" style={{ marginBottom:'1rem',display:'inline-flex' }}>Open to Investment</span>
              <h3 style={{ fontFamily:'var(--font-serif)',fontSize:'1.5rem',letterSpacing:'-.025em',marginBottom:'.75rem',lineHeight:1.15,color:'var(--text)' }}>
                Ready to discuss the opportunity?
              </h3>
              <p className="body" style={{ marginBottom:'1.5rem' }}>
                Transparent, focused, and moving fast. If you're an investor with conviction in health-tech infrastructure, we'd love to connect.
              </p>
              <ul style={{ listStyle:'none',display:'flex',flexDirection:'column',gap:'.4rem',marginBottom:'1.75rem' }}>
                {['Investor deck available on request','Financials accessible under NDA','Founder call within 48 hours'].map(i=>(
                  <li key={i} style={{ display:'flex',alignItems:'center',gap:'.45rem' }}>
                    <div style={{ width:4,height:4,borderRadius:'50%',background:'var(--teal)',flexShrink:0 }}/>
                    <span className="small">{i}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ display:'flex',gap:'.75rem',flexWrap:'wrap' }}>
              <a href="mailto:invest@stacksense.io" className="btn btn-teal" style={{ flex:'1 1 auto',justifyContent:'center',minWidth:140 }}>
                <Mail size={14}/> Contact Us
              </a>
              <a href="mailto:invest@stacksense.io?subject=Investor Deck" className="btn btn-outline" style={{ flex:'1 1 auto',justifyContent:'center',minWidth:140 }}>
                Request Deck <ArrowRight size={13}/>
              </a>
            </div>
          </div>
        </div>

        {/* Founder note */}
        <div className="sr" style={{ background:'var(--bg)',border:'1px solid var(--border)',borderRadius:16,padding:'1.75rem 2rem',display:'flex',gap:'1.25rem',alignItems:'flex-start' }} id="founder-note">
          <div style={{ width:42,height:42,borderRadius:'50%',background:'linear-gradient(135deg,#1a8c87,#25b5af)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.85rem',fontWeight:800,color:'#fff',flexShrink:0 }}>SS</div>
          <div>
            <p style={{ fontFamily:'var(--font-serif)',fontStyle:'italic',fontSize:'.95rem',color:'var(--text-2)',lineHeight:1.78,marginBottom:'.7rem' }}>
              "We're building StackSense because we were the users who couldn't find a tool that actually worked for this. The market is real, the pain is real, and the timing is right. We're disciplined builders doing this properly — not rushing it."
            </p>
            <div style={{ fontFamily:'var(--font-sans)',fontSize:'.82rem',fontWeight:700,color:'var(--text)' }}>The StackSense Team</div>
            <div className="small">Founders, StackSense</div>
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:700px){#funding-grid{grid-template-columns:1fr!important}#founder-note{flex-direction:column!important}}
      `}</style>
    </section>
  )
}
