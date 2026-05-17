import { useEffect, useRef } from 'react'
import { Star, Quote } from 'lucide-react'

const list = [
  { name:'Marcus T.', role:'Research Enthusiast', av:'MT', color:'#1a8c87', quote:"Finally a tool that takes the organisation side seriously. I've tried spreadsheets, notes apps, everything — StackSense is the first thing that actually feels purpose-built for this." },
  { name:'Dr. Jordan P.', role:'Sports Medicine Practitioner', av:'JP', color:'#0d6b67', quote:"The safety-first workflow design is impressive. It's the kind of structural thinking I'd want in any tool clients are using to track this sort of data." },
  { name:'Reyna M.', role:'Performance Coach', av:'RM', color:'#25b5af', quote:"The history and logging features alone make it worth it. Being able to revisit exactly what I did in a previous cycle — with timestamps and notes — changes everything." },
]

export default function Testimonials() {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target) } })
    }, { threshold: 0.1 })
    ref.current.querySelectorAll('.sr').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={ref} className="section" style={{ background:'#fff' }}>
      <div className="wrap">
        <div className="sr" style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <p className="eyebrow" style={{ marginBottom:'.75rem' }}>Early Feedback</p>
          <h2 className="display-sm" style={{ marginBottom:'.5rem' }}>What early users are saying</h2>
          <p className="small">From beta feedback and early conversations. Full launch reviews coming soon.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem' }}>
          {list.map((t,i) => (
            <div key={t.name} className={`card sr d${i+1}`} style={{ padding:'1.5rem' }}>
              <div style={{ display:'flex',gap:2,marginBottom:'1rem' }}>
                {[0,1,2,3,4].map(j=><Star key={j} size={12} color="#d97706" fill="#d97706"/>)}
              </div>
              <div style={{ position:'relative',marginBottom:'1.2rem' }}>
                <Quote size={18} color={`${t.color}25`} style={{ position:'absolute',top:-3,left:-3 }}/>
                <p className="body" style={{ paddingLeft:'.4rem' }}>{t.quote}</p>
              </div>
              <div style={{ display:'flex',alignItems:'center',gap:'.6rem' }}>
                <div style={{ width:34,height:34,borderRadius:'50%',background:`linear-gradient(135deg,${t.color},${t.color}88)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.68rem',fontWeight:700,color:'#fff',flexShrink:0 }}>
                  {t.av}
                </div>
                <div>
                  <div style={{ fontSize:'.82rem',fontWeight:700,fontFamily:'var(--font-sans)',color:'var(--text)' }}>{t.name}</div>
                  <div className="small">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
