import { useEffect, useRef } from 'react'
import { CheckCircle2, Zap, Circle } from 'lucide-react'

const stages = [
  {
    stage:'Pre-Seed', period:'2023–2024', status:'done', tag:'Complete',
    tagline:'Build and validate',
    desc:'Zero product, zero users — just a problem worth solving. We spent this period validating the need, building the first prototype, and confirming real demand existed.',
    items:['Problem validated with 40+ potential users','First working prototype shipped','Core data model designed','Brand identity established'],
  },
  {
    stage:'Seed', period:'2024–Present', status:'active', tag:'Active',
    tagline:'Product ready. Market credible.',
    desc:'StackSense has a working product, active development cycles, and growing beta interest. We\'re collecting feedback, iterating quickly, and building operational foundations to scale.',
    items:['Core features complete and in active development','Beta interest from early adopters','Feedback loops with initial users','Preparing go-to-market and hiring strategy'],
  },
  {
    stage:'Series A', period:'Target 2025', status:'upcoming', tag:'Upcoming',
    tagline:'Scale what works',
    desc:'With proven traction, Series A marks the shift from product-finding to growth-building. Investment goes directly into team expansion, product acceleration, and market leadership.',
    items:['Strong user base with high retention','Revenue-generating with clear monetisation','Expanded product and engineering team','Partnerships with health-tech platforms'],
  },
  {
    stage:'Series B', period:'Target 2026+', status:'upcoming', tag:'Upcoming',
    tagline:'Expand and lead',
    desc:'Category expansion and market dominance. Platform extensions into adjacent use cases, new markets, and enterprise-grade infrastructure. StackSense becomes the definitive platform.',
    items:['Market leadership in core segment','Enterprise and professional tiers launched','International expansion underway','Third-party integration ecosystem'],
  },
]

const statusColor = { done:'#1a8c87', active:'#1a8c87', upcoming:'#7a9490' }

export default function Timeline() {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target) } })
    }, { threshold: 0.08 })
    ref.current.querySelectorAll('.sr,.sr-fade').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="timeline" ref={ref} className="section" style={{ background:'var(--bg)' }}>
      <div className="wrap">
        <div className="sr" style={{ textAlign:'center', marginBottom:'3.5rem' }}>
          <p className="eyebrow" style={{ marginBottom:'.75rem' }}>Company Journey</p>
          <h2 className="display-md" style={{ marginBottom:'1rem' }}>
            Where we are &amp;<span className="italic-serif teal-text"> where we're going</span>
          </h2>
          <p className="lead" style={{ maxWidth:500, margin:'0 auto' }}>
            A transparent view of StackSense's fundraising journey and milestones at each stage.
          </p>
        </div>

        <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
          {stages.map((s, i) => (
            <div key={s.stage} className={`sr d${i+1}`} style={{
              flex:'1 1 220px', minWidth:220,
              background: s.status==='active' ? 'rgba(26,140,135,.04)' : '#fff',
              border:`1px solid ${s.status==='active'?'rgba(26,140,135,.25)':'var(--border)'}`,
              borderRadius:18, padding:'1.5rem', position:'relative',
            }}>
              {s.status==='active' && (
                <div style={{ position:'absolute',top:-1,left:'50%',transform:'translateX(-50%)',background:'var(--teal)',color:'#fff',fontSize:'.6rem',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',padding:'.16rem .65rem',borderRadius:'0 0 8px 8px' }}>
                  Current Stage
                </div>
              )}
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.75rem',marginTop:s.status==='active'?.35:0 }}>
                <div style={{ width:30,height:30,borderRadius:'50%',background:`${statusColor[s.status]}14`,border:`1.5px solid ${statusColor[s.status]}`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                  {s.status==='done'?<CheckCircle2 size={14} color="#1a8c87"/>:s.status==='active'?<Zap size={13} color="#1a8c87"/>:<Circle size={13} color="#7a9490"/>}
                </div>
                <span className={`pill ${s.status==='done'?'pill-green':s.status==='active'?'pill-teal':'pill-gray'}`}>{s.tag}</span>
              </div>
              <h3 style={{ fontFamily:'var(--font-serif)',fontSize:'1.2rem',letterSpacing:'-.02em',marginBottom:'.18rem',color:'var(--text)' }}>{s.stage}</h3>
              <p style={{ fontSize:'.7rem',color:statusColor[s.status],fontWeight:600,fontFamily:'var(--font-sans)',marginBottom:'.35rem' }}>{s.period}</p>
              <p style={{ fontSize:'.78rem',color:'var(--text-2)',fontStyle:'italic',fontFamily:'var(--font-sans)',marginBottom:'.75rem' }}>"{s.tagline}"</p>
              <p className="small" style={{ marginBottom:'.85rem', lineHeight:1.65 }}>{s.desc}</p>
              <ul style={{ listStyle:'none',display:'flex',flexDirection:'column',gap:'.4rem' }}>
                {s.items.map(m=>(
                  <li key={m} style={{ display:'flex',alignItems:'flex-start',gap:'.45rem' }}>
                    <div style={{ width:4,height:4,borderRadius:'50%',background:s.status==='upcoming'?'#7a9490':statusColor[s.status],marginTop:'.45rem',flexShrink:0 }}/>
                    <span className="small">{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* What's next */}
        <div className="sr" style={{ marginTop:'2rem', background:'rgba(26,140,135,.05)', border:'1px solid rgba(26,140,135,.18)', borderRadius:16, padding:'1.5rem 2rem' }}>
          <div style={{ display:'flex',alignItems:'center',gap:'.65rem',marginBottom:'.7rem' }}>
            <Zap size={15} color="var(--teal)"/>
            <h3 style={{ fontFamily:'var(--font-sans)',fontSize:'.95rem',fontWeight:700,color:'var(--text)' }}>What's next</h3>
          </div>
          <p className="body" style={{ maxWidth:700 }}>
            Right now we're focused on closing the seed round, finalising the product for public launch, and growing our early adopter community. If you're an investor, operator, or early builder —{' '}
            <a href="#funding" style={{ color:'var(--teal)',textDecoration:'none',fontWeight:600 }}>let's talk</a>.
          </p>
        </div>
      </div>
    </section>
  )
}
