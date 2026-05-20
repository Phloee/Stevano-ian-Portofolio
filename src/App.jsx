import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import tervistImg from './assets/tervist.jpeg';
import atomyImg from './assets/1777393612993 (1).jpg';
import scentfixImg from './assets/scentfix_4k.png';
import {
  SiDjango, SiNextdotjs, SiReact, SiPostgresql, SiMongodb,
  SiJavascript, SiHtml5, SiPython, SiFlutter, SiDart
} from 'react-icons/si';
import {
  FaCode, FaServer, FaUsers, FaLaptopCode,
  FaGlobe, FaEnvelope, FaWhatsapp, FaLinkedinIn, FaGithub, FaBrain, FaCss3Alt
} from 'react-icons/fa';

/* ── Typewriter ── */
const Typewriter = ({ words }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    if (index === words.length) return;
    if (subIndex === words[index].length + 1 && !isDeleting) { setTimeout(() => setIsDeleting(true), 2000); return; }
    if (subIndex === 0 && isDeleting) { setIsDeleting(false); setIndex(p => (p + 1) % words.length); return; }
    const t = setTimeout(() => setSubIndex(p => p + (isDeleting ? -1 : 1)), Math.max(isDeleting ? 45 : 90, Math.random() * 80));
    return () => clearTimeout(t);
  }, [subIndex, index, isDeleting, words]);
  return <span className="typewriter-text">{words[index]?.substring(0, subIndex)}</span>;
};

/* ══════════════════════════════════════════════
   BUBBLE PHYSICS — elastic collision + wall bounce
══════════════════════════════════════════════ */
const BubblePhysics = ({ labels }) => {
  const containerRef = useRef(null);
  const stateRef    = useRef([]);
  const animRef     = useRef(null);
  const [positions, setPositions] = useState([]);

  const radius = (label) => Math.max(46, label.length * 5.2 + 24);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const W = el.offsetWidth || 760;
    const H = el.offsetHeight || 230;

    stateRef.current = labels.map((label, i) => {
      const r = radius(label);
      const cols = 4;
      const x = r + (i % cols) * (W / cols) + (Math.random() - 0.5) * 18;
      const y = r + Math.floor(i / cols) * 105 + 18 + (Math.random() - 0.5) * 18;
      const speed = 0.55 + Math.random() * 0.45;
      const angle = Math.random() * Math.PI * 2;
      return { x: Math.max(r, Math.min(W - r, x)), y: Math.max(r, Math.min(H - r, y)),
               vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r };
    });

    const tick = () => {
      const cEl = containerRef.current;
      if (!cEl) return;
      const W2 = cEl.offsetWidth;
      const H2 = cEl.offsetHeight;
      const bs = stateRef.current;

      bs.forEach(b => { b.x += b.vx; b.y += b.vy; });

      bs.forEach(b => {
        if (b.x - b.r < 0)   { b.x = b.r;      b.vx =  Math.abs(b.vx); }
        if (b.x + b.r > W2)  { b.x = W2 - b.r; b.vx = -Math.abs(b.vx); }
        if (b.y - b.r < 0)   { b.y = b.r;      b.vy =  Math.abs(b.vy); }
        if (b.y + b.r > H2)  { b.y = H2 - b.r; b.vy = -Math.abs(b.vy); }
      });

      for (let i = 0; i < bs.length; i++) {
        for (let j = i + 1; j < bs.length; j++) {
          const a = bs[i], b = bs[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx*dx + dy*dy) || 0.001;
          const minD = a.r + b.r;
          if (dist < minD) {
            const nx = dx / dist, ny = dy / dist;
            const overlap = (minD - dist) / 2;
            a.x -= nx * overlap; a.y -= ny * overlap;
            b.x += nx * overlap; b.y += ny * overlap;
            const dvx = a.vx - b.vx, dvy = a.vy - b.vy;
            const dot = dvx * nx + dvy * ny;
            if (dot > 0) {
              a.vx -= dot * nx; a.vy -= dot * ny;
              b.vx += dot * nx; b.vy += dot * ny;
            }
          }
        }
      }

      setPositions(bs.map(b => ({ x: b.x, y: b.y, r: b.r })));
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []); // eslint-disable-line

  return (
    <div ref={containerRef} className="bubble-field">
      {labels.map((label, i) => (
        <span key={label} className="b-chip" style={positions[i] ? {
          left: positions[i].x - positions[i].r,
          top:  positions[i].y - positions[i].r,
          width: positions[i].r * 2,
          textAlign: 'center',
          padding: '0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: positions[i].r * 2,
          borderRadius: '50%',
        } : { opacity: 0 }}>
          {label}
        </span>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════
   SCROLL-DRIVEN char reveal
   — characters light up proportional to scroll
══════════════════════════════════════════════ */
const ScrollRevealText = ({ text, tag: Tag = 'p' }) => {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(0);
  const chars = text.split('');
  const total = chars.length;

  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const vh = window.innerHeight;
      // start revealing when bottom of element hits 90% vh, finish at 20% vh
      const start = vh * 0.88;
      const end   = vh * 0.20;
      const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
      setRevealed(Math.round(progress * total));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on mount
    return () => window.removeEventListener('scroll', onScroll);
  }, [total]);

  // split into words, tracking global char index
  const words = text.split(' ');
  let ci = 0;

  return (
    <Tag ref={ref} className="scroll-text">
      {words.map((word, wi) => (
        <span key={wi} className="sw-word">
          {word.split('').map(ch => {
            const idx = ci++;
            const lit = idx < revealed;
            return (
              <span
                key={idx}
                className="sw-char"
                style={{
                  opacity: lit ? 1 : 0.18,
                  color:   lit ? 'var(--p)' : 'var(--m)',
                  transition: 'opacity 0.08s ease-out, color 0.08s ease-out',
                }}
              >{ch}</span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
};

/* ── Background ── */
const makeParticles = n => Array.from({ length: n }, (_, i) => ({
  id: i, left: `${Math.random()*100}%`,
  size: `${Math.random()*8+5}px`,
  delay: `${Math.random()*12}s`, duration: `${Math.random()*10+8}s`,
}));
const makeRings = n => Array.from({ length: n }, (_, i) => ({
  id: i, left: `${10+Math.random()*80}%`, top: `${10+Math.random()*80}%`,
  size: `${Math.random()*100+50}px`,
  delay: `${Math.random()*6}s`, duration: `${Math.random()*4+4}s`,
}));

const techStack = [
  { Icon: SiDjango,     label: 'Django'     },
  { Icon: SiNextdotjs,  label: 'Next.js'    },
  { Icon: SiReact,      label: 'React'      },
  { Icon: SiPostgresql, label: 'PostgreSQL' },
  { Icon: SiMongodb,    label: 'MongoDB'    },
  { Icon: SiJavascript, label: 'JavaScript' },
  { Icon: SiHtml5,      label: 'HTML & CSS' },
  { Icon: SiPython,     label: 'Python'     },
  { Icon: SiFlutter,    label: 'Flutter'    },
  { Icon: SiDart,       label: 'Dart'       },
];

const bio = "I am a Software Engineering undergraduate with a strong interest in frontend web development, experienced in building user-facing interfaces using HTML, CSS, JavaScript, and React. I am also familiar with Django, Flutter, MongoDB, and PostgreSQL, with a solid understanding of system workflows and SQL. I have strong leadership, am eager to learn, and communicate well in team environments thriving in collaborative settings where consistent attention to detail drives meaningful results.";

function App() {
  const titles = ['Web Dev (Front End & Back End)', 'Data Analysis', 'Usability Testing', 'AI Engineering'];
  const particles = useRef(makeParticles(35)).current;
  const rings     = useRef(makeRings(10)).current;

  return (
    <>
      {/* BG */}
      <div className="bg-canvas">
        <div className="blob blob-1"/><div className="blob blob-2"/><div className="blob blob-3"/>
        {rings.map(r => (
          <div key={r.id} className="ring" style={{
            left:r.left,top:r.top,width:r.size,height:r.size,
            marginLeft:`-${parseInt(r.size)/2}px`,marginTop:`-${parseInt(r.size)/2}px`,
            animationDelay:r.delay,animationDuration:r.duration,
          }}/>
        ))}
        <div className="particles">
          {particles.map(p => (
            <div key={p.id} className="particle" style={{
              left:p.left,bottom:'-20px',width:p.size,height:p.size,
              animationDelay:p.delay,animationDuration:p.duration,
            }}/>
          ))}
        </div>
      </div>


 
      <div className="app-container">

        {/* ── HERO ── */}
        <section className="hero">
          {/* Bubbles absolutely fill hero, left & right of name */}
          <div className="bubble-field">
            {/* LEFT side */}
            <span className="b-chip b1">Web Dev</span>
            <span className="b-chip b2">Data Analysis</span>
            <span className="b-chip b3">Mobile App Dev</span>
            <span className="b-chip b4">Data Engineering</span>
            {/* RIGHT side */}
            <span className="b-chip b5">AI Engineering</span>
            <span className="b-chip b6">Usability Testing</span>
            <span className="b-chip b7">Full Stack</span>
            <span className="b-chip b8">System Design</span>
          </div>

          {/* Centered text on top */}
          <p className="hero-eyebrow">Universitas Prasetiya Mulya</p>
          <h1 className="title">Stevano Ian Fernandy</h1>
          <div className="major-badge">✦ Software Engineering Major 2023</div>
        </section>

        {/* ── ABOUT ME ── */}
        <section className="section-wrap" id="about">
          <h2 className="section-title">About Me</h2>
          <div className="bio-block">
            <ScrollRevealText text={bio} />
            <div className="about-tags">
              <span className="about-tag">Leadership</span>
              <span className="about-tag">Discipline</span>
              <span className="about-tag">Team Player</span>
            </div>
          </div>
        </section>

        {/* ── HERE WHAT I DO BEST + SKILLS (merged) ── */}
        <section className="section-wrap" id="skills">
          <h2 className="section-title">Here's What I Do Best</h2>
          <div className="combo-wrap">

            {/* Tech logos */}
            <div className="tech-panel-inner">
              {techStack.map(({ Icon, label }) => (
                <div className="tech-item" key={label} title={label}>
                  <div className="tech-icon-box"><Icon className="tech-icon"/></div>
                  <span className="tech-label">{label}</span>
                </div>
              ))}
            </div>

            <div className="combo-divider" />

            {/* Skills grid inside same card */}
            <h3 className="combo-subtitle">Skills & Expertise</h3>
            <div className="skills-grid">

              <div className="skill-card">
                <div className="skill-card-header"><FaLaptopCode className="skill-card-icon"/><h3>Hard Skills</h3></div>
                <ul className="tag-list">
                  {['Web Development','Mobile Development','Data Engineering',
                    'Usability Testing','User Acceptance Testing',
                    'RICE Prioritization','SQL Querying','API Integration',
                    'Data Analysis','ETL Pipeline','UI/UX Design',
                    'System Design','REST API','Version Control (Git)',
                    'Agile / Scrum','Database Management']
                    .map(s => <li key={s} className="tag">{s}</li>)}
                </ul>
              </div>

              <div className="skill-card">
                <div className="skill-card-header"><FaCode className="skill-card-icon"/><h3>Programming Languages</h3></div>
                <ul className="tag-list">
                  {['JavaScript','TypeScript','Python','Dart','HTML5','CSS3','SQL','Bash / Shell','React']
                    .map(s => <li key={s} className="tag">{s}</li>)}
                </ul>
              </div>

              <div className="skill-card">
                <div className="skill-card-header"><FaServer className="skill-card-icon"/><h3>Software & Tools</h3></div>
                <ul className="tag-list">
                  {['Next.js','Django','Flutter','MongoDB','PostgreSQL',
                    'n8n','AWS (VPC)','Hostinger','GitHub','Android Studio',
                    'Notion','Jira','Postman','OpenClaw']
                    .map(s => <li key={s} className="tag">{s}</li>)}
                </ul>
              </div>

              <div className="skill-card">
                <div className="skill-card-header"><FaUsers className="skill-card-icon"/><h3>Soft Skills</h3></div>
                <ul className="tag-list">
                  {['Analytical Thinking','Problem Solving','Team Collaboration',
                    'Time Management','Leadership','Working Under Pressure',
                    'Attention to Detail','Communication','Adaptability','Critical Thinking']
                    .map(s => <li key={s} className="tag">{s}</li>)}
                </ul>
              </div>

              <div className="skill-card skill-card--wide">
                <div className="skill-card-header"><FaBrain className="skill-card-icon"/><h3>Spoken Languages</h3></div>
                <div className="lang-list">
                  <div className="lang-row">
                    <span className="lang-name">Indonesian</span>
                    <div className="lang-bar-wrap"><div className="lang-bar" style={{width:'100%'}}/></div>
                    <span className="lang-badge native">Native</span>
                  </div>
                  <div className="lang-row">
                    <span className="lang-name">English</span>
                    <div className="lang-bar-wrap"><div className="lang-bar" style={{width:'88%'}}/></div>
                    <span className="lang-badge advanced">Advanced</span>
                  </div>
                  <div className="lang-row">
                    <span className="lang-name">Mandarin</span>
                    <div className="lang-bar-wrap"><div className="lang-bar" style={{width:'55%'}}/></div>
                    <span className="lang-badge intermediate">Intermediate</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── PROJECTS ── */}
        <section className="section-wrap" id="projects">
          <h2 className="section-title">Featured Projects</h2>

          {/* TERVIST: Featured Project Card */}
          <div className="showcase-card">
            <div className="sc-deco sc-deco-1"/>
            <div className="sc-deco sc-deco-2"/>

            <div className="sc-topbar">
              <div className="sc-topbar-badge">
                <span className="sc-badge-dot"/>
                Mobile App Development
              </div>
              <div className="sc-logo">tervist.</div>
            </div>

            <div className="sc-headline">
              <p className="sc-eyebrow">Featured Project</p>
              <h3 className="sc-heading">
                Tervist: Your <span className="sc-accent">All-In-One</span><br/>Health Companion.
              </h3>
              <p className="sc-subhead">
                Designed and built Tervist as the lead developer. This Flutter-based mobile app integrates Google Maps for route tracking and fl_chart for data visualization. Tervist empowers users to easily monitor their daily fitness goals through a modern, interactive, and personalized interface.
              </p>
            </div>

            <div className="sc-visual">
              <div className="sc-laptop">
                <div className="sc-laptop-bar">
                  <div className="sc-tl-wrap">
                    <span className="sc-tl sc-tl-r"/>
                    <span className="sc-tl sc-tl-y"/>
                    <span className="sc-tl sc-tl-g"/>
                  </div>
                  <div className="sc-urlbar">tervist-app.preview</div>
                </div>
                <img src={tervistImg} alt="Tervist App" className="sc-screen"/>
              </div>

              <div className="sc-info-panel">
                <div className="sc-info-card">
                  <p className="sc-info-label">Tech Stack</p>
                  <div className="sc-stack-tags">
                    <span className="project-tag"><SiFlutter/> Flutter</span>
                    <span className="project-tag"><SiDjango/> Django</span>
                    <span className="project-tag"><SiPostgresql/> PostgreSQL</span>
                  </div>
                </div>
                <div className="sc-info-card">
                  <p className="sc-info-label">Key Features</p>
                  <ul className="sc-feature-list">
                    <li><span className="sc-fdot"/><span>Multi-sport activity and route tracking</span></li>
                    <li><span className="sc-fdot"/><span>Interactive fitness data visualization</span></li>
                    <li><span className="sc-fdot"/><span>User profile and nutrition management</span></li>
                    <li><span className="sc-fdot"/><span>Location integration and smart notifications</span></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="sc-bottom">
              <div className="sc-author">
                <div className="sc-author-info">
                  <span className="sc-author-name">Stevano Ian Fernandy</span>
                  <span className="sc-author-title">Fullstack Developer</span>
                </div>
              </div>
              <a href="https://github.com/Doffannoel/Tervist-App" target="_blank" rel="noreferrer" className="sc-cta">
                View Source Code →
              </a>
            </div>
          </div>

          {/* ATOMY KUMALA: Featured Project Card */}
          <div className="showcase-card">
            <div className="sc-deco sc-deco-1"/>
            <div className="sc-deco sc-deco-2"/>

            <div className="sc-topbar">
              <div className="sc-topbar-badge">
                <span className="sc-badge-dot"/>
                Full-Stack Web Dev
              </div>
              <div className="sc-logo">atomykumala.</div>
            </div>

            <div className="sc-headline">
              <p className="sc-eyebrow">Featured Project</p>
              <h3 className="sc-heading">
                Official <span className="sc-accent">Company Profile</span><br/>and Membership Platform.
              </h3>
              <p className="sc-subhead">
                Developed a comprehensive network marketing platform for the Atomy Indonesia team. As the lead developer, I designed the site to highlight the team's core values, success system, and compensation plan. This project significantly accelerates member onboarding and strengthens centralized team collaboration.
              </p>
            </div>

            <div className="sc-visual">
              <div className="sc-laptop">
                <div className="sc-laptop-bar">
                  <div className="sc-tl-wrap">
                    <span className="sc-tl sc-tl-r"/>
                    <span className="sc-tl sc-tl-y"/>
                    <span className="sc-tl sc-tl-g"/>
                  </div>
                  <div className="sc-urlbar">atomykumala.com</div>
                </div>
                <img src={atomyImg} alt="Atomy Kumala Website" className="sc-screen"/>
              </div>

              <div className="sc-info-panel">
                <div className="sc-info-card">
                  <p className="sc-info-label">Tech Stack</p>
                  <div className="sc-stack-tags">
                    <span className="project-tag"><SiReact/> React</span>
                    <span className="project-tag"><SiHtml5/> HTML5</span>
                    <span className="project-tag"><FaCss3Alt/> CSS3</span>
                  </div>
                </div>
                <div className="sc-info-card">
                  <p className="sc-info-label">Key Features</p>
                  <ul className="sc-feature-list">
                    <li><span className="sc-fdot"/><span>Team mission, vision, and core values</span></li>
                    <li><span className="sc-fdot"/><span>Success system and compensation structure</span></li>
                    <li><span className="sc-fdot"/><span>Free training and leadership program info</span></li>
                    <li><span className="sc-fdot"/><span>Seamless member onboarding and registration flow</span></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="sc-bottom">
              <div className="sc-author">
                <div className="sc-author-info">
                  <span className="sc-author-name">Stevano Ian Fernandy</span>
                  <span className="sc-author-title">Project Manager & Product Manager</span>
                </div>
              </div>
              <a href="https://atomykumala.com/" target="_blank" rel="noreferrer" className="sc-cta">
                Visit Website →
              </a>
            </div>
          </div>

          {/* SCENTFIX: Featured Project Card */}
          <div className="showcase-card">
            <div className="sc-deco sc-deco-1"/>
            <div className="sc-deco sc-deco-2"/>

            <div className="sc-topbar">
              <div className="sc-topbar-badge">
                <span className="sc-badge-dot"/>
                Full-Stack E-Commerce
              </div>
              <div className="sc-logo">scentfix.</div>
            </div>

            <div className="sc-headline">
              <p className="sc-eyebrow">Featured Project</p>
              <h3 className="sc-heading">
                Full-Stack <span className="sc-accent">E-Commerce</span><br/>Shoe Deodorant Platform.
              </h3>
              <p className="sc-subhead">
                Acted as the lead developer for a premium shoe deodorant patch e-commerce platform. This full-stack website (Next.js, Node.js, Express) delivers a fast, secure, and intuitive shopping experience. ScentFix successfully optimizes online sales through seamless Midtrans payment integration and automated WhatsApp notifications.
              </p>
            </div>

            <div className="sc-visual">
              <div className="sc-laptop">
                <div className="sc-laptop-bar">
                  <div className="sc-tl-wrap">
                    <span className="sc-tl sc-tl-r"/>
                    <span className="sc-tl sc-tl-y"/>
                    <span className="sc-tl sc-tl-g"/>
                  </div>
                  <div className="sc-urlbar">scentfix.app</div>
                </div>
                <img src={scentfixImg} alt="ScentFix App" className="sc-screen"/>
              </div>

              <div className="sc-info-panel">
                <div className="sc-info-card">
                  <p className="sc-info-label">Tech Stack</p>
                  <div className="sc-stack-tags">
                    <span className="project-tag"><SiNextdotjs/> Next.js</span>
                    <span className="project-tag"><SiJavascript/> Node.js</span>
                    <span className="project-tag"><SiJavascript/> Express</span>
                    <span className="project-tag"><SiMongodb/> MongoDB</span>
                  </div>
                </div>
                <div className="sc-info-card">
                  <p className="sc-info-label">Key Features</p>
                  <ul className="sc-feature-list">
                    <li><span className="sc-fdot"/><span>Premium shoe deodorant product showcase</span></li>
                    <li><span className="sc-fdot"/><span>Detailed product benefits and natural ingredients</span></li>
                    <li><span className="sc-fdot"/><span>Secure shopping cart and payment gateway (Midtrans)</span></li>
                    <li><span className="sc-fdot"/><span>Automated order notifications via WhatsApp (Fonnte)</span></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="sc-bottom">
              <div className="sc-author">
                <div className="sc-author-info">
                  <span className="sc-author-name">Stevano Ian Fernandy</span>
                  <span className="sc-author-title">Project Manager & Product Manager</span>
                </div>
              </div>
              <a href="https://www.scentfix.store/" target="_blank" rel="noreferrer" className="sc-cta">
                Visit Website →
              </a>
            </div>
          </div>

        </section>


        <footer className="footer" id="contact">
          <h2 className="footer-title">Let's Get in Touch</h2>
          <p className="footer-subtitle">Feel free to reach out, I'm always open to new opportunities and collaborations.</p>
          <div className="footer-links">
            <a className="footer-link" href="mailto:vano.yap@gmail.com" title="Gmail">
              <FaEnvelope/><span>Gmail</span>
            </a>
            <a className="footer-link" href="https://wa.me/6287733443435" target="_blank" rel="noreferrer" title="WhatsApp">
              <FaWhatsapp/><span>WhatsApp</span>
            </a>
            <a className="footer-link" href="https://www.linkedin.com/in/stevano-ian-fernandy-8618bb288/" target="_blank" rel="noreferrer" title="LinkedIn">
              <FaLinkedinIn/><span>LinkedIn</span>
            </a>
            <a className="footer-link" href="https://github.com/Phloee" target="_blank" rel="noreferrer" title="GitHub">
              <FaGithub/><span>GitHub</span>
            </a>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} Stevano Ian Fernandy | Software Engineering, Universitas Prasetiya Mulya</p>
        </footer>
      </div>
    </>
  );
}

export default App;
