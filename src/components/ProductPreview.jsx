import { useEffect, useRef, useState } from 'react'
import { Activity, Bell, LayoutGrid, Search, Filter, MoreHorizontal } from 'lucide-react'

const tabs = ['Dashboard', 'Log Entry', 'History', 'Reminders']

function Dashboard() {
  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.5rem' }}>
        {[['Active','4','compounds'],['Entries','312','all time'],['Adherence','96%','this month'],['Streak','21d','best: 21d']].map(([l,v,s]) => (
          <div key={l} style={{ background: '#f5f7f6', borderRadius: 10, padding: '.65rem', border: '1px solid #dce8e5' }}>
            <div style={{ fontSize: '.58rem', color: '#7a9490', fontFamily: 'var(--font-sans)', marginBottom: 2 }}>{l}</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0c1a18', fontFamily: 'var(--font-sans)', lineHeight: 1 }}>{v}</div>
            <div style={{ fontSize: '.56rem', color: '#1a8c87', marginTop: 2, fontFamily: 'var(--font-sans)' }}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem' }}>
        {/* Bar chart */}
        <div style={{ background: '#f5f7f6', borderRadius: 10, padding: '.75rem', border: '1px solid #dce8e5' }}>
          <div style={{ fontSize: '.65rem', fontWeight: 600, color: '#0c1a18', fontFamily: 'var(--font-sans)', marginBottom: '.55rem' }}>Weekly Adherence</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '.28rem', height: 56 }}>
            {[70,88,92,78,96,100,85].map((h,i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ width: '100%', height: `${h * .56}%`, background: i===5?'#1a8c87':'rgba(26,140,135,.3)', borderRadius: '2px 2px 0 0' }}/>
                <span style={{ fontSize: '.48rem', color: '#7a9490', fontFamily: 'var(--font-sans)' }}>{['M','T','W','T','F','S','S'][i]}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Today schedule */}
        <div style={{ background: '#f5f7f6', borderRadius: 10, padding: '.75rem', border: '1px solid #dce8e5' }}>
          <div style={{ fontSize: '.65rem', fontWeight: 600, color: '#0c1a18', fontFamily: 'var(--font-sans)', marginBottom: '.55rem' }}>Today</div>
          {[['BPC-157','8:00 AM',true],['TB-500','8:00 AM',true],['Sermorelin','10:00 PM',false]].map(([n,t,d]) => (
            <div key={n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: d?'#1a8c87':'#dce8e5', border: d?'none':'1.5px solid #7a9490' }}/>
                <span style={{ fontSize: '.64rem', fontFamily: 'var(--font-sans)', color: d?'#7a9490':'#0c1a18' }}>{n}</span>
              </div>
              <span style={{ fontSize: '.58rem', color: '#7a9490', fontFamily: 'var(--font-sans)' }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Log table */}
      <div style={{ background: '#f5f7f6', borderRadius: 10, overflow: 'hidden', border: '1px solid #dce8e5' }}>
        <div style={{ padding: '.5rem .75rem', borderBottom: '1px solid #dce8e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '.64rem', fontWeight: 600, color: '#0c1a18', fontFamily: 'var(--font-sans)' }}>Recent Log</span>
          <button style={{ background: 'none', border: 'none', color: '#7a9490', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: '.58rem', fontFamily: 'var(--font-sans)' }}>
            <Filter size={9}/> Filter
          </button>
        </div>
        {[['BPC-157','250mcg','SQ','Today 8:12 AM'],['TB-500','500mcg','SQ','Today 8:14 AM'],['BPC-157','250mcg','SQ','Yesterday']].map(([c,d,r,t],i) => (
          <div key={i} style={{ padding: '.42rem .75rem', borderBottom: i<2?'1px solid #e8efee':'none', display: 'flex', alignItems: 'center', gap: '.55rem' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: i%2===0?'#1a8c87':'#25b5af', flexShrink: 0 }}/>
            <span style={{ fontSize: '.66rem', fontWeight: 600, color: '#0c1a18', fontFamily: 'var(--font-sans)', flex: 1 }}>{c}</span>
            <span style={{ fontSize: '.6rem', color: '#7a9490', fontFamily: 'var(--font-sans)' }}>{d}</span>
            <span style={{ fontSize: '.55rem', fontWeight: 700, color: '#1a8c87', background: 'rgba(26,140,135,.1)', padding: '1px 5px', borderRadius: 4 }}>{r}</span>
            <span style={{ fontSize: '.58rem', color: '#7a9490', fontFamily: 'var(--font-sans)' }}>{t}</span>
            <MoreHorizontal size={11} color="#7a9490"/>
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div style={{ background: '#f5f7f6', borderRadius: 10, padding: '.6rem .75rem', border: '1px solid #dce8e5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.35rem' }}>
          <span style={{ fontSize: '.62rem', color: '#3a504d', fontFamily: 'var(--font-sans)' }}>Cycle Progress</span>
          <span style={{ fontSize: '.62rem', color: '#1a8c87', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>70% — Week 10 of 14</span>
        </div>
        <div style={{ height: 5, background: '#dce8e5', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '70%', background: 'linear-gradient(90deg,#1a8c87,#25b5af)', borderRadius: 3 }}/>
        </div>
      </div>
    </div>
  )
}

export default function ProductPreview() {
  const [activeTab, setActiveTab] = useState(0)
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
    <section id="product" ref={ref} className="section" style={{ background: 'var(--bg)' }}>
      <div className="wrap">
        <div className="sr" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="eyebrow" style={{ marginBottom: '.75rem' }}>Product Preview</p>
          <h2 className="display-md" style={{ marginBottom: '1rem' }}>
            Built for<span className="italic-serif teal-text"> serious users</span>
          </h2>
          <p className="lead" style={{ maxWidth: 480, margin: '0 auto' }}>
            Clean UI, dense information, zero noise. Designed to surface what matters.
          </p>
        </div>

        <div className="sr d2" style={{
          background: '#fff', border: '1px solid var(--border)', borderRadius: 22, overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,.08)', maxWidth: 860, margin: '0 auto',
        }}>
          {/* Window chrome */}
          <div style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <div style={{ display: 'flex', gap: '.38rem' }}>
              {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }}/>)}
            </div>
            <div style={{ flex: 1, background: '#fff', border: '1px solid var(--border)', borderRadius: 6, padding: '.18rem .8rem', fontSize: '.7rem', color: 'var(--text-3)', maxWidth: 260, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '.35rem' }}>
              <Search size={9}/> app.stacksense.io
            </div>
          </div>

          {/* App shell */}
          <div style={{ display: 'flex', height: 420 }} id="app-shell">
            {/* Sidebar */}
            <div style={{ width: 172, background: 'var(--bg)', borderRight: '1px solid var(--border)', padding: '.9rem .65rem', display: 'flex', flexDirection: 'column', gap: '.2rem' }} id="preview-sidebar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem', padding: '.35rem .5rem', marginBottom: '.65rem' }}>
                <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                  <rect width="28" height="28" rx="7" fill="#1a8c87"/>
                  <rect x="7" y="7" width="6" height="6" rx="1.5" fill="white" opacity=".95"/>
                  <rect x="15" y="7" width="6" height="6" rx="1.5" fill="white" opacity=".55"/>
                  <rect x="7" y="15" width="6" height="6" rx="1.5" fill="white" opacity=".55"/>
                  <rect x="15" y="15" width="6" height="6" rx="1.5" fill="white" opacity=".25"/>
                </svg>
                <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-sans)', letterSpacing: '-.01em' }}>StackSense</span>
              </div>
              {[{icon: LayoutGrid, label: 'Dashboard'},{icon: Activity, label: 'Log Entry'},{icon: Search, label: 'History'},{icon: Bell, label: 'Reminders'}].map((item, i) => (
                <button key={item.label} onClick={() => setActiveTab(i)} style={{
                  background: activeTab===i ? 'rgba(26,140,135,.1)' : 'transparent',
                  border: `1px solid ${activeTab===i ? 'rgba(26,140,135,.2)' : 'transparent'}`,
                  borderRadius: 8, padding: '.42rem .6rem',
                  display: 'flex', alignItems: 'center', gap: '.45rem',
                  cursor: 'pointer', width: '100%', transition: 'all .15s',
                }} onMouseEnter={e => { if(activeTab!==i) e.currentTarget.style.background='rgba(0,0,0,.03)' }}
                   onMouseLeave={e => { if(activeTab!==i) e.currentTarget.style.background='transparent' }}>
                  <item.icon size={13} color={activeTab===i?'#1a8c87':'#7a9490'}/>
                  <span style={{ fontSize: '.7rem', fontWeight: activeTab===i?600:500, color: activeTab===i?'#1a8c87':'#7a9490', fontFamily: 'var(--font-sans)' }}>{item.label}</span>
                </button>
              ))}
              <div style={{ marginTop: 'auto', padding: '.45rem .5rem', background: '#fff', border: '1px solid var(--border)', borderRadius: 9, display: 'flex', alignItems: 'center', gap: '.45rem' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#1a8c87,#25b5af)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.55rem', fontWeight: 700, color: '#fff' }}>JD</div>
                <div>
                  <div style={{ fontSize: '.62rem', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>J. Doe</div>
                  <div style={{ fontSize: '.54rem', color: 'var(--text-3)', fontFamily: 'var(--font-sans)' }}>Early Access</div>
                </div>
              </div>
            </div>
            {/* Content */}
            <div style={{ flex: 1, overflow: 'auto' }}><Dashboard/></div>
          </div>
        </div>
        <p className="small sr-fade" style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          Live interface preview · UI subject to change during development
        </p>
      </div>
      <style>{`@media(max-width:600px){#preview-sidebar{display:none!important}}`}</style>
    </section>
  )
}
