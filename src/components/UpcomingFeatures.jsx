import { useEffect, useRef } from 'react'
import { BarChart3, Zap, Plug, FileDown, UserCircle, FolderKanban, SearchCode, Users } from 'lucide-react'

const items = [
  { icon:BarChart3,   title:'Smart Insights & Analytics',  desc:'Pattern recognition across your logs — trends, anomalies, and cycle summaries surfaced automatically.', badge:'In Development', bc:'pill-teal',   color:'#1a8c87' },
  { icon:Zap,         title:'Advanced Reminder Workflows', desc:'Context-aware reminders that adapt to your schedule, cycle phase, and past behaviour.', badge:'In Development', bc:'pill-teal',   color:'#0d6b67' },
  { icon:FileDown,    title:'Exportable Records',           desc:'Clean exports in PDF, CSV, or JSON — ready for personal use or professional review.', badge:'Soon',           bc:'pill-amber',  color:'#d97706' },
  { icon:Plug,        title:'Platform Integrations',        desc:'Connect StackSense with calendar apps, wearables, and health data platforms.', badge:'Planned',        bc:'pill-gray',   color:'#25b5af' },
  { icon:UserCircle,  title:'User Profiles',                desc:'Personalised profiles with notification prefs, unit settings, and saved protocols.', badge:'Soon',           bc:'pill-amber',  color:'#d97706' },
  { icon:FolderKanban,title:'Enhanced Organisation',        desc:'Tag-based organisation, nested folders for compounds, and a visual cycle planner.', badge:'Planned',        bc:'pill-gray',   color:'#1a8c87' },
  { icon:SearchCode,  title:'Faster Search',                desc:'Full-text semantic search across your entire history — any entry in milliseconds.', badge:'In Development', bc:'pill-teal',   color:'#0d6b67' },
  { icon:Users,       title:'Team & Shared Access',         desc:'Controlled access for practitioners, coaches, or collaborators. Safety and privacy by default.', badge:'Future', bc:'pill-purple', color:'#7c3aed' },
]

export default function UpcomingFeatures() {
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
    <section id="roadmap" ref={ref} className="section" style={{ background:'var(--bg)' }}>
      <div className="wrap">
        <div className="sr" style={{ textAlign:'center', marginBottom:'3.5rem' }}>
          <p className="eyebrow" style={{ marginBottom:'.75rem' }}>Roadmap</p>
          <h2 className="display-md" style={{ marginBottom:'1rem' }}>
            What's<span className="italic-serif teal-text"> coming next</span>
          </h2>
          <p className="lead" style={{ maxWidth:480, margin:'0 auto 1.25rem' }}>
            We ship with intention. Here's what's actively in development and what we're planning next.
          </p>
          <div style={{ display:'flex',justifyContent:'center',gap:'.6rem',flexWrap:'wrap' }}>
            {[['In Development','pill-teal'],['Soon','pill-amber'],['Planned','pill-gray'],['Future','pill-purple']].map(([l,c])=>(
              <span key={l} className={`pill ${c}`}>{l}</span>
            ))}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(245px,1fr))', gap:'1rem' }}>
          {items.map((f, i) => (
            <div key={f.title} className={`card sr d${(i%8)+1}`} style={{ padding:'1.4rem', cursor:'default' }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'.85rem' }}>
                <div style={{ width:38,height:38,background:`${f.color}12`,border:`1px solid ${f.color}22`,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <f.icon size={16} color={f.color} strokeWidth={1.8}/>
                </div>
                <span className={`pill ${f.bc}`}>{f.badge}</span>
              </div>
              <h3 style={{ fontFamily:'var(--font-sans)',fontWeight:700,fontSize:'.9rem',marginBottom:'.42rem',letterSpacing:'-.01em',color:'var(--text)' }}>{f.title}</h3>
              <p className="small" style={{ lineHeight:1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="sr" style={{ marginTop:'2rem',textAlign:'center',background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'1.5rem' }}>
          <p className="body" style={{ marginBottom:'1rem' }}>
            Want to influence what gets built? Early waitlist members get direct access to share feedback with the team.
          </p>
          <a href="#waitlist" className="btn btn-teal"><Zap size={13}/> Join the Waitlist</a>
        </div>
      </div>
    </section>
  )
}
