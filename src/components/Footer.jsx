import { Mail, X } from 'lucide-react'

const GitHubIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
)
const LinkedinIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const navCols = {
  Product:  [['Features','#features'],['Product Preview','#product'],['Roadmap','#roadmap'],['Join Waitlist','#waitlist']],
  Company:  [['Our Journey','#timeline'],['Investors','#funding'],['FAQ','#faq'],['Contact','mailto:hello@stacksense.io']],
  Legal:    [['Privacy Policy','#privacy'],['Terms of Use','#terms'],['Cookie Policy','#privacy'],['Data Requests','mailto:privacy@stacksense.io']],
}

const socials = [
  { Icon: X,          href:'#' },
  { Icon: GitHubIcon, href:'#' },
  { Icon: LinkedinIcon,href:'#' },
  { Icon: Mail,       href:'mailto:hello@stacksense.io' },
]

export default function Footer() {
  return (
    <footer style={{ background:'var(--bg-dark)', color:'var(--text-inv)' }}>
      {/* Privacy Policy */}
      <section id="privacy" style={{ maxWidth:940,margin:'0 auto',padding:'4.5rem 1.5rem 0' }}>
        <div style={{ background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:18,padding:'2rem',marginBottom:'3.5rem' }}>
          <h3 style={{ fontFamily:'var(--font-sans)',fontSize:'1rem',fontWeight:700,marginBottom:'1.25rem',color:'var(--text-inv)' }}>Privacy Policy</h3>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:'1.25rem',fontSize:'.82rem',color:'rgba(255,255,255,.5)',lineHeight:1.72 }}>
            {[
              ['What we collect','When you join the waitlist, we collect your email address and optionally your name. If you use the referral system, we also collect referral activity data. We use standard analytics tools to understand how visitors use the site.'],
              ['How we use it','Your email is used solely to communicate about StackSense — launch updates, early access invitations, and product news. We do not sell or share your personal data with third parties. Referral data is used only to manage waitlist queue position.'],
              ['Cookies & tracking','We use standard cookies for session management and analytics to measure site usage. You can opt out or disable cookies in your browser settings at any time.'],
              ['Data storage & security','All data is stored securely using industry-standard encryption at rest and in transit. We retain waitlist data until launch or until you request deletion.'],
              ['Your rights','You can request access to, correction of, or deletion of your data at any time. Contact us at privacy@stacksense.io and we will respond within 5 business days.'],
              ['Consent','By submitting the waitlist form, you explicitly consent to us storing your email for waitlist communications. You can withdraw consent at any time by emailing us.'],
            ].map(([title, body]) => (
              <div key={title}>
                <p style={{ fontWeight:600,color:'rgba(255,255,255,.78)',marginBottom:'.3rem' }}>{title}</p>
                <p>{body}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop:'1.25rem',fontSize:'.73rem',color:'rgba(255,255,255,.3)',borderTop:'1px solid rgba(255,255,255,.07)',paddingTop:'.75rem' }}>
            Last updated: April 2026. Questions? <a href="mailto:privacy@stacksense.io" style={{ color:'var(--teal-light)',textDecoration:'none' }}>privacy@stacksense.io</a>
          </p>
        </div>
      </section>

      {/* Main footer */}
      <div style={{ maxWidth:1160,margin:'0 auto',padding:'3rem 1.5rem 0' }}>
        {/* Regulatory disclaimer */}
        <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)', borderRadius:14, padding:'1.5rem', marginBottom:'3rem' }}>
          <h4 style={{ fontSize:'.75rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'rgba(255,255,255,.6)', marginBottom:'.4rem', fontFamily:'var(--font-sans)' }}>Regulatory Disclaimer</h4>
          <p style={{ fontSize:'.8rem', color:'rgba(255,255,255,.45)', lineHeight:1.65, fontFamily:'var(--font-sans)' }}>
            StackSense is a personal tracking and logging tool. We do not sell, recommend, or prescribe any compounds. Always consult a healthcare provider.
          </p>
        </div>

        <div style={{ display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:'2.5rem',marginBottom:'3rem' }} id="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:'.55rem',marginBottom:'1rem' }}>
              <img src="/logo.png" width="26" height="26" alt="StackSense Logo" style={{ borderRadius: 6, objectFit: 'contain' }} />
              <span style={{ fontFamily:'var(--font-sans)',fontWeight:700,fontSize:'.95rem',letterSpacing:'-.02em' }}>StackSense</span>
            </div>
            <p style={{ fontSize:'.82rem',color:'rgba(255,255,255,.45)',lineHeight:1.7,maxWidth:265,marginBottom:'1.25rem' }}>
              A structured platform for tracking, managing, and analysing peptide workflows. Built for precision. Designed for clarity.
            </p>
            <div style={{ display:'flex',gap:'.45rem' }}>
              {socials.map(({ Icon, href }, i) => (
                <a key={i} href={href} style={{ width:32,height:32,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,.45)',transition:'all .2s',textDecoration:'none' }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(26,140,135,.5)'; e.currentTarget.style.color='#25b5af'; e.currentTarget.style.background='rgba(26,140,135,.1)' }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,.08)'; e.currentTarget.style.color='rgba(255,255,255,.45)'; e.currentTarget.style.background='rgba(255,255,255,.06)' }}>
                  <Icon size={14}/>
                </a>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {Object.entries(navCols).map(([cat, links]) => (
            <div key={cat}>
              <h4 style={{ fontSize:'.68rem',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:'.9rem',fontFamily:'var(--font-sans)' }}>{cat}</h4>
              <ul style={{ listStyle:'none',display:'flex',flexDirection:'column',gap:'.5rem' }}>
                {links.map(([label,href]) => (
                  <li key={label}>
                    <a href={href} style={{ color:'rgba(255,255,255,.5)',textDecoration:'none',fontSize:'.83rem',transition:'color .15s',fontFamily:'var(--font-sans)' }}
                      onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,.85)'}
                      onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.5)'}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,.07)',padding:'1.5rem 0',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'.75rem' }}>
          <p style={{ fontSize:'.76rem',color:'rgba(255,255,255,.3)',fontFamily:'var(--font-sans)' }}>© 2026 StackSense Inc. All rights reserved.</p>
          <div style={{ display:'flex',gap:'1.25rem',flexWrap:'wrap' }}>
            {[['Privacy Policy','#privacy'],['Terms of Use','#terms'],['Contact','mailto:hello@stacksense.io']].map(([l,h]) => (
              <a key={l} href={h} style={{ color:'rgba(255,255,255,.3)',textDecoration:'none',fontSize:'.75rem',fontFamily:'var(--font-sans)',transition:'color .15s' }}
                onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,.6)'}
                onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.3)'}>{l}</a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:700px){ #footer-grid{grid-template-columns:1fr 1fr!important} }
        @media(max-width:440px){ #footer-grid{grid-template-columns:1fr!important} }
      `}</style>
    </footer>
  )
}
