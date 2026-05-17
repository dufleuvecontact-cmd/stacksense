import { useEffect, useRef } from 'react'
import { ArrowRight, ChevronDown, CheckCircle2, Activity, Bell, LayoutGrid } from 'lucide-react'

function PhoneMockup() {
  return (
    <div style={{ position: 'relative', width: 260, margin: '0 auto' }}>
      {/* Phone shell */}
      <div style={{
        background: '#0c1a18', borderRadius: 40, padding: '10px',
        boxShadow: '0 40px 80px rgba(0,0,0,.35), 0 0 0 1px rgba(26,140,135,.15)',
      }}>
        {/* Screen */}
        <div style={{
          background: '#f5f7f6', borderRadius: 32, overflow: 'hidden',
          position: 'relative', minHeight: 480,
        }}>
          {/* Notch */}
          <div style={{
            position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
            width: 90, height: 22, background: '#0c1a18', borderRadius: 11, zIndex: 10,
          }}/>

          {/* App header */}
          <div style={{ padding: '44px 16px 12px', background: '#fff', borderBottom: '1px solid #e8efee' }}>
            <div style={{ fontSize: '.75rem', color: '#7a9490', fontFamily: 'var(--font-sans)', marginBottom: 2 }}>
              Good morning
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-sans)', color: '#0c1a18', letterSpacing: '-.01em' }}>
              Progress
            </div>
          </div>

          {/* Stats card */}
          <div style={{ margin: '12px 12px 8px', background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid #e8efee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: '.7rem', fontWeight: 600, color: '#0c1a18', fontFamily: 'var(--font-sans)' }}>
                Weight &amp; Body Composition
              </div>
              <span style={{
                fontSize: '.58rem', fontWeight: 700, color: '#1a8c87',
                background: 'rgba(26,140,135,.1)', padding: '2px 7px', borderRadius: 20,
                letterSpacing: '.04em', textTransform: 'uppercase',
              }}>Last 7 Days</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 8 }}>
              {[['STARTING','0 kg'],['CURRENT','0 kg'],['CHANGE','0.0 kg']].map(([l,v]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '.5rem', color: '#7a9490', fontFamily: 'var(--font-sans)', letterSpacing: '.05em', marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: '.8rem', fontWeight: 700, color: l === 'CHANGE' ? '#1a8c87' : '#0c1a18', fontFamily: 'var(--font-sans)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Adherence card */}
          <div style={{ margin: '0 12px 8px', background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid #e8efee' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
              <Activity size={12} color="#1a8c87"/>
              <span style={{ fontSize: '.7rem', fontWeight: 600, color: '#0c1a18', fontFamily: 'var(--font-sans)' }}>Dose Adherence</span>
            </div>
            <div style={{ display: 'flex', gap: 5, justifyContent: 'space-between', marginBottom: 7 }}>
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: i < 6 ? '#1a8c87' : '#e8efee',
                    opacity: i < 6 ? (i === 5 ? 1 : .75) : 1,
                  }}/>
                  <span style={{ fontSize: '.5rem', color: '#7a9490', fontFamily: 'var(--font-sans)' }}>{d}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '.62rem', color: '#1a8c87', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
              100% adherence today. <span style={{ fontStyle: 'italic' }}>On track.</span>
            </div>
          </div>

          {/* Bioavailability row */}
          <div style={{ margin: '0 12px 8px', background: '#fff', borderRadius: 14, padding: '12px 14px', border: '1px solid #e8efee' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(26,140,135,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LayoutGrid size={10} color="#1a8c87"/>
              </div>
              <span style={{ fontSize: '.7rem', fontWeight: 600, color: '#0c1a18', fontFamily: 'var(--font-sans)' }}>
                Bioavailability Calculator
              </span>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: '#fff', borderTop: '1px solid #e8efee',
            padding: '8px 0 10px', display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          }}>
            {[
              { label: 'TODAY', active: false },
              { label: 'STACK', active: false },
              { label: 'CYCLES', active: false },
              { label: 'INSIGHTS', active: true },
              { label: 'AI', active: false },
              { label: 'PROFILE', active: false },
            ].map(({ label, active }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{
                  width: 18, height: 3, borderRadius: 2,
                  background: active ? '#1a8c87' : '#dce8e5',
                  marginBottom: 1,
                }}/>
                <span style={{
                  fontSize: '.42rem', fontWeight: active ? 700 : 500,
                  color: active ? '#1a8c87' : '#7a9490',
                  fontFamily: 'var(--font-sans)', letterSpacing: '.04em',
                }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating card – reminder */}
      <div style={{
        position: 'absolute', top: 60, right: -70,
        background: '#fff', border: '1px solid #dce8e5', borderRadius: 14,
        padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,.1)',
        display: 'flex', alignItems: 'center', gap: 8, width: 175,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: 'rgba(26,140,135,.1)', border: '1px solid rgba(26,140,135,.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bell size={12} color="#1a8c87"/>
        </div>
        <div>
          <div style={{ fontSize: '.65rem', fontWeight: 700, color: '#0c1a18', fontFamily: 'var(--font-sans)' }}>Reminder set</div>
          <div style={{ fontSize: '.58rem', color: '#7a9490', fontFamily: 'var(--font-sans)' }}>BPC-157 · 8:00 AM</div>
        </div>
      </div>

      {/* Floating card – streak */}
      <div style={{
        position: 'absolute', bottom: 80, left: -65,
        background: '#fff', border: '1px solid #dce8e5', borderRadius: 14,
        padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,.1)',
        width: 148,
      }}>
        <div style={{ fontSize: '.58rem', color: '#7a9490', fontFamily: 'var(--font-sans)', marginBottom: 3 }}>Current Streak</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a8c87', fontFamily: 'var(--font-sans)', lineHeight: 1 }}>21d</div>
        <div style={{ fontSize: '.58rem', color: '#7a9490', fontFamily: 'var(--font-sans)', marginTop: 2 }}>Personal best 🎯</div>
      </div>
    </div>
  )
}

export default function Hero() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.querySelectorAll('.sr, .sr-fade').forEach((node, i) => {
      setTimeout(() => node.classList.add('in'), 80 + i * 90)
    })
  }, [])

  return (
    <section ref={ref} style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, #f0f5f4 0%, #e0eceb 40%, #f5f7f6 100%)',
      paddingTop: 80,
    }}>
      {/* Dot grid bg */}
      <div className="dot-grid" style={{
        position: 'absolute', inset: 0, opacity: .5, pointerEvents: 'none',
      }}/>

      {/* Teal glow top-right */}
      <div style={{
        position: 'absolute', top: -120, right: -80, width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(26,140,135,.12) 0%, transparent 65%)',
        pointerEvents: 'none',
      }}/>

      <div className="wrap" style={{ position: 'relative', zIndex: 1, width: '100%', paddingTop: '2rem', paddingBottom: '3rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', alignItems: 'center', textAlign: 'center' }} id="hero-grid">

          {/* Top / Center */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 800 }}>
            <div className="sr d1" style={{ marginBottom: '1.4rem' }}>
              <span className="pill pill-teal">
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block' }} className="pulse-dot"/>
                Seed Stage · Open Waitlist
              </span>
            </div>

            <h1 className="sr d2" style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(3.2rem, 7.5vw, 7.5rem)',
              lineHeight: .93, letterSpacing: '-.025em', color: 'var(--text)',
              marginBottom: '1.5rem',
            }}>
              Tired of tracking peptides in<br/>
              <span className="italic-serif teal-text">spreadsheets?</span>
            </h1>

            <p className="sr d3 lead" style={{ maxWidth: 680, marginBottom: '2.2rem' }}>
              Built by a biohacker who got tired of tracking peptides in spreadsheets. 420+ compounds. One app.
            </p>

            <div className="sr d4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a href="#waitlist" className="btn btn-teal">
                  Join the Waitlist <ArrowRight size={15}/>
                </a>
                <a href="#features" className="btn btn-outline">
                  See Features
                </a>
              </div>
              <div className="small" style={{ marginTop: '.85rem', fontWeight: 600, color: 'var(--teal-deep)', background: 'var(--teal-muted)', padding: '.25rem .85rem', borderRadius: 100 }}>
                🎁 Lock in Founding Member pricing: $9.99/mo forever + 6 months free
              </div>
            </div>

            <div className="sr d5" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.2rem' }}>
              {[
                '420+ compounds in our protocol library',
                'Built on clinical dosing data from peer-reviewed sources',
                'Designed by someone who actually uses these protocols daily',
                'Currently onboarding beta testers',
              ].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <CheckCircle2 size={15} color="var(--teal)" strokeWidth={2.5} style={{ flexShrink: 0 }}/>
                  <span className="small" style={{ fontWeight: 500 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — phone */}
          <div className="sr-right d2 float" style={{ display: 'flex', justifyContent: 'center', paddingTop: '1rem' }}>
            <PhoneMockup/>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="sr-fade d6" style={{ textAlign: 'center', marginTop: '4rem', opacity: 0 }}>
          <ChevronDown size={18} color="var(--text-3)" style={{ animation: 'floatY 2s ease-in-out infinite' }}/>
        </div>
      </div>

      {/* Backed-by strip */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,.6)',
        backdropFilter: 'blur(10px)', padding: '.9rem 1.5rem',
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ fontSize: '.75rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-3)', fontWeight: 600 }}>
            Currently reaching out for funding
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          #hero-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
        }
        @keyframes floatY {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
      `}</style>
    </section>
  )
}
