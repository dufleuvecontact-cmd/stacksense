import { useState, useEffect, useRef } from 'react'
import { Mail, User, ArrowRight, Copy, Check, Share2, Trophy, ChevronRight, Hash } from 'lucide-react'
import { supabase } from '../supabaseClient'

function gen() {
  const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return 'SS-'+Array.from({length:6},()=>c[Math.floor(Math.random()*c.length)]).join('')
}

export default function Waitlist() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [consent, setConsent] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [code, setCode] = useState('')
  const [refCode, setRefCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [refs, setRefs] = useState(1)
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target) } })
    }, { threshold: 0.08 })
    ref.current.querySelectorAll('.sr,.sr-fade,.sr-left,.sr-right').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  async function submit(e) {
    e.preventDefault()
    if (!email || !consent) return
    setIsSubmitting(true)
    const newCode = gen()
    try {
      await supabase.from('waitlist').insert([{ 
        email, 
        name: name || null, 
        referred_by: refCode || null, 
        referral_code: newCode 
      }])
    } catch (err) {
      console.error(err)
    }
    setIsSubmitting(false)
    setCode(newCode); setSubmitted(true)
  }
  function copy() {
    navigator.clipboard.writeText(`https://stacksense.io/join?ref=${code}`).catch(()=>{})
    setCopied(true); setTimeout(()=>setCopied(false),2500)
  }

  const tiers = [
    { n:1, label:'Early Access',   reward:'Priority queue position',              done: refs>=1, color:'#1a8c87' },
    { n:3, label:'Power User',     reward:'Free first month + priority requests', done: refs>=3, color:'#0d6b67' },
    { n:5, label:'Founding Member',reward:'Lifetime discount + beta status',      done: refs>=5, color:'#25b5af' },
  ]

  return (
    <section id="waitlist" ref={ref} className="section" style={{ background: '#fff' }}>
      <div className="wrap">
        <div className="sr" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p className="eyebrow" style={{ marginBottom: '.75rem' }}>Early Access</p>
          <h2 className="display-md" style={{ marginBottom: '1rem' }}>
            Be first.<span className="italic-serif teal-text"> Shape the product.</span>
          </h2>
          <p className="lead" style={{ maxWidth: 480, margin: '0 auto' }}>
            Early access members help shape StackSense — and get rewarded for it.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }} id="waitlist-grid">
          {/* Form */}
          <div className="card-flat sr-left" style={{ padding: '2rem' }}>
            {!submitted ? (
              <>
                <h3 style={{ fontFamily:'var(--font-sans)', fontSize:'1.1rem', fontWeight:700, marginBottom:'.4rem', color:'var(--text)' }}>Become a Founding Member</h3>
                <p className="body" style={{ marginBottom:'1.5rem', color:'var(--teal-deep)', fontWeight:500 }}>
                  Join now and get the app locked at <strong>$9.99/mo forever</strong> plus <strong>6 months for free</strong>.
                </p>
                <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'.45rem', marginBottom:'1.75rem' }}>
                  {['First access when we launch','Priority onboarding support','Lock in your founding-user rate','Influence the roadmap directly'].map(p=>(
                    <li key={p} style={{ display:'flex', alignItems:'center', gap:'.45rem' }}>
                      <Check size={13} color="var(--teal)" strokeWidth={2.5}/>
                      <span className="body">{p}</span>
                    </li>
                  ))}
                </ul>
                <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'.7rem' }}>
                  <div>
                    <label htmlFor="wl-name" style={{ display:'block', fontSize:'.76rem', fontWeight:600, color:'var(--text-2)', marginBottom:'.3rem' }}>
                      Name <span style={{ color:'var(--text-3)', fontWeight:400 }}>(optional)</span>
                    </label>
                    <div style={{ position:'relative' }}>
                      <User size={13} color="var(--text-3)" style={{ position:'absolute', left:'.8rem', top:'50%', transform:'translateY(-50%)' }}/>
                      <input id="wl-name" type="text" value={name} onChange={e=>setName(e.target.value)}
                        placeholder="Your name" className="input" style={{ paddingLeft:'2.1rem' }}/>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="wl-email" style={{ display:'block', fontSize:'.76rem', fontWeight:600, color:'var(--text-2)', marginBottom:'.3rem' }}>
                      Email <span style={{ color:'#e53e3e' }}>*</span>
                    </label>
                    <div style={{ position:'relative' }}>
                      <Mail size={13} color="var(--text-3)" style={{ position:'absolute', left:'.8rem', top:'50%', transform:'translateY(-50%)' }}/>
                      <input id="wl-email" type="email" value={email} onChange={e=>setEmail(e.target.value)}
                        required placeholder="you@example.com" className="input" style={{ paddingLeft:'2.1rem' }}/>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="wl-ref" style={{ display:'block', fontSize:'.76rem', fontWeight:600, color:'var(--text-2)', marginBottom:'.3rem' }}>
                      Referral Code <span style={{ color:'var(--text-3)', fontWeight:400 }}>(optional)</span>
                    </label>
                    <div style={{ position:'relative' }}>
                      <Hash size={13} color="var(--text-3)" style={{ position:'absolute', left:'.8rem', top:'50%', transform:'translateY(-50%)' }}/>
                      <input id="wl-ref" type="text" value={refCode} onChange={e=>setRefCode(e.target.value)}
                        placeholder="Enter code if you have one" className="input" style={{ paddingLeft:'2.1rem' }}/>
                    </div>
                  </div>
                  <label style={{ display:'flex', alignItems:'flex-start', gap:'.55rem', cursor:'pointer', marginTop: '.4rem' }}>
                    <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required
                      style={{ marginTop:2, accentColor:'var(--teal)', width:14, height:14, flexShrink:0 }}/>
                    <span className="small">
                      I agree to StackSense collecting my email for waitlist purposes. See our{' '}
                      <a href="#privacy" style={{ color:'var(--teal)', textDecoration:'none' }}>Privacy Policy</a>.
                    </span>
                  </label>
                  <button type="submit" className="btn btn-teal" disabled={!email||!consent||isSubmitting}
                    style={{ width:'100%', justifyContent:'center', marginTop:'.2rem', opacity:(!email||!consent||isSubmitting)?.5:1 }}>
                    {isSubmitting ? 'Joining...' : <>Join the Waitlist <ArrowRight size={14}/></>}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign:'center' }}>
                <div style={{ width:52,height:52,background:'rgba(26,140,135,.1)',border:'1px solid rgba(26,140,135,.2)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.2rem' }}>
                  <Check size={20} color="var(--teal)"/>
                </div>
                <h3 style={{ fontFamily:'var(--font-sans)',fontSize:'1.15rem',fontWeight:700,marginBottom:'.5rem',color:'var(--text)' }}>You're on the list</h3>
                <p className="body" style={{ marginBottom:'1.5rem' }}>We'll be in touch as we approach launch. Refer friends below to move up.</p>
                <div style={{ background:'var(--bg)',border:'1px solid var(--border)',borderRadius:9,padding:'.7rem 1rem',display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'.75rem' }}>
                  <span className="small" style={{ flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>stacksense.io/join?ref={code}</span>
                  <button onClick={copy} style={{ background:copied?'rgba(26,140,135,.1)':'rgba(26,140,135,.08)',border:`1px solid ${copied?'rgba(26,140,135,.25)':'rgba(26,140,135,.18)'}`,color:'var(--teal)',borderRadius:7,padding:'.28rem .65rem',cursor:'pointer',fontSize:'.7rem',fontWeight:600,display:'flex',alignItems:'center',gap:3,fontFamily:'var(--font-sans)',transition:'all .2s' }}>
                    {copied?<Check size={11}/>:<Copy size={11}/>} {copied?'Copied!':'Copy'}
                  </button>
                </div>
                <button className="btn btn-outline" onClick={copy} style={{ width:'100%',justifyContent:'center',fontSize:'.82rem' }}>
                  <Share2 size={13}/> Share your link
                </button>
              </div>
            )}
          </div>

          {/* Referral */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div className="card-flat sr-right d1" style={{ padding:'1.5rem' }}>
              <div style={{ display:'flex',alignItems:'center',gap:'.6rem',marginBottom:'1rem' }}>
                <div style={{ width:36,height:36,background:'rgba(26,140,135,.1)',border:'1px solid rgba(26,140,135,.18)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <Trophy size={15} color="var(--teal)"/>
                </div>
                <div>
                  <h4 style={{ fontFamily:'var(--font-sans)',fontSize:'.93rem',fontWeight:700,color:'var(--text)' }}>Referral Rewards</h4>
                  <p className="small">Refer friends, move up the list</p>
                </div>
              </div>
              <div style={{ display:'flex',flexDirection:'column',gap:'.6rem' }}>
                {tiers.map(t=>(
                  <div key={t.n} style={{ background:t.done?`${t.color}0d`:'var(--bg)',border:`1px solid ${t.done?`${t.color}28`:'var(--border)'}`,borderRadius:10,padding:'.7rem .9rem',display:'flex',alignItems:'center',gap:'.7rem',transition:'all .2s' }}>
                    <div style={{ width:26,height:26,borderRadius:'50%',background:t.done?`${t.color}18`:'var(--bg-card)',border:`1.5px solid ${t.done?t.color:'var(--border)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.68rem',fontWeight:700,color:t.done?t.color:'var(--text-3)',flexShrink:0 }}>
                      {t.done?<Check size={11}/>:t.n}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'.8rem',fontWeight:600,color:t.done?'var(--text)':'var(--text-2)',fontFamily:'var(--font-sans)' }}>{t.label}</div>
                      <div className="small">{t.reward}</div>
                    </div>
                    <span className={`pill ${t.done?'pill-teal':'pill-gray'}`}>{t.done?'Unlocked':`${t.n} refs`}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-flat sr-right d2" style={{ padding:'1.25rem' }}>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'.6rem' }}>
                <span style={{ fontSize:'.8rem',fontWeight:600,fontFamily:'var(--font-sans)',color:'var(--text)' }}>Your progress</span>
                <span className="small">{refs} / 3 to Power User</span>
              </div>
              <div style={{ height:6,background:'var(--bg)',borderRadius:3,overflow:'hidden',marginBottom:'.7rem' }}>
                <div style={{ height:'100%',width:`${Math.min(refs/3*100,100)}%`,background:'linear-gradient(90deg,#1a8c87,#25b5af)',borderRadius:3,transition:'width .4s ease' }}/>
              </div>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                <span className="small">{Math.max(3-refs,0)} more to next reward</span>
                <button className="btn btn-outline" onClick={()=>setRefs(r=>Math.min(r+1,5))} style={{ fontSize:'.7rem',padding:'.22rem .7rem' }}>
                  Demo +1 <ChevronRight size={10}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:760px){#waitlist-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  )
}
