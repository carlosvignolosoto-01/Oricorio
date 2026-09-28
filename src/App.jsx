import { useState, useEffect, useCallback } from 'react';

// ─── STORAGE ────────────────────────────────────────────────────────────────
const DB = {
  get: (key) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) { console.error(e); } }
};

// ─── PALETA (del mockup) ─────────────────────────────────────────────────────
// Fondo crema claro, acentos verde oscuro, verde medio para tags
const C = {
  bg:        '#F8F5F0',   // crema claro (fondo principal)
  surface:   '#FFFFFF',   // blanco (cards)
  border:    '#E8E2D9',   // borde suave
  text:      '#1A1A1A',   // texto principal
  textSub:   '#6B6560',   // texto secundario
  textMuted: '#9E9890',   // texto muted
  green:     '#2D5016',   // verde oscuro (acento principal)
  greenMid:  '#4A7C2F',   // verde medio
  greenLight:'#EAF2E3',   // verde muy claro (bg tags)
  orange:    '#C4622D',   // naranja/coral (Shadow)
  yellow:    '#B8860B',   // dorado (Con follower)
  red:       '#B22222',   // rojo (Social)
  blue:      '#2563EB',   // azul (info)
};

// ─── ÍCONOS SVG inline ────────────────────────────────────────────────────────
const Icon = ({ name, size = 22, color = 'currentColor' }) => {
  const icons = {
    home: <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>,
    genres: <><path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z"/></>,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/>,
    sequences: <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/>,
    profile: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>,
    plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>,
    back: <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>,
    edit: <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"/>,
    trash: <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>,
    search: <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>,
    chevronRight: <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>,
    check: <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>,
    video: <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"/>,
    mic: <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"/>,
    link: <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/>,
    note: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/>,
    close: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>,
    more: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"/>,
    hand: <><path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 0 1 3.15 0v1.5m-3.15 0 .075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 0 1 3.15 0V15M6.9 7.575a1.575 1.575 0 1 0-3.15 0v8.175a6.75 6.75 0 0 0 6.75 6.75h2.018a5.25 5.25 0 0 0 3.712-1.538l1.732-1.732a5.25 5.25 0 0 0 1.538-3.712l.003-2.024a.668.668 0 0 1 .198-.471 1.575 1.575 0 1 0-2.228-2.228 3.818 3.818 0 0 0-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0 1 16.35 15m.002 0h-.002"/></>,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth="1.8">
      {icons[name]}
    </svg>
  );
};

// ─── NIVEL DE DOMINIO ────────────────────────────────────────────────────────
const DOMINIO_LEVELS = [
  { id: 'aprendido', label: 'Aprendido',    emoji: '🌱', color: C.green },
  { id: 'shadow',    label: 'Shadow',       emoji: '👤', color: C.orange },
  { id: 'follower',  label: 'Con follower', emoji: '🤝', color: C.yellow },
  { id: 'social',    label: 'Social',       emoji: '🎉', color: C.red },
];

const AGARRES = ['D-D','D-I','I-D','I-I','Dos manos','Libre'];
const ORIGENES = ['Arthur Murray','Timba School','Propio'];

// ─── SISTEMA DE NIVELES ───────────────────────────────────────────────────────
// Niveles genéricos para filtros y equivalencias cross-género
const NIVEL_TIERS = ['Básico','Intermedio','Avanzado','Pro'];

// Niveles específicos por sistema de enseñanza
const NIVEL_SYSTEMS = {
  'arthur-murray': [
    'Bronze 1','Bronze 2','Bronze 3','Bronze 4',
    'Silver 1','Silver 2','Silver 3','Silver 4',
    'Gold 1','Gold 2','Gold 3','Gold 4',
  ],
  'timba': ['Básico','All Levels Jr','All Levels Pro','Intermedio'],
  'default': ['Básico','Intermedio','Avanzado','Pro'],
};

// Mapeo de nivel específico → tier genérico
const nivelToTier = (nivel) => {
  if (!nivel) return 'Básico';
  if (['Bronze 1','Bronze 2'].includes(nivel))               return 'Básico';
  if (['Bronze 3','Bronze 4'].includes(nivel))               return 'Intermedio';
  if (['Silver 1','Silver 2','Silver 3','Silver 4'].includes(nivel)) return 'Avanzado';
  if (['Gold 1','Gold 2','Gold 3','Gold 4'].includes(nivel)) return 'Pro';
  // Para Timba y default: mapeo directo por posición
  if (nivel === 'Básico')          return 'Básico';
  if (nivel === 'All Levels Jr')   return 'Intermedio';
  if (nivel === 'All Levels Pro')  return 'Avanzado';
  if (nivel === 'Intermedio')      return 'Intermedio';
  if (nivel === 'Avanzado')        return 'Avanzado';
  if (nivel === 'Pro')             return 'Pro';
  return 'Básico';
};

// Devuelve los niveles específicos según el origen del movimiento
const getNivelesForOrigen = (origen) => {
  if (origen === 'Arthur Murray') return NIVEL_SYSTEMS['arthur-murray'];
  if (origen === 'Timba School')  return NIVEL_SYSTEMS['timba'];
  return NIVEL_SYSTEMS['default']; // 'Propio' u otro
};

// (Kept for genre-level fallback if needed)
const getNivelesForGenre = (genre) => {
  if (!genre) return NIVEL_SYSTEMS['default'];
  if (genre.nivelSystem) return NIVEL_SYSTEMS[genre.nivelSystem] || NIVEL_SYSTEMS['default'];
  return NIVEL_SYSTEMS['default'];
};

// Tooltips de equivalencia para los chips de filtro
const TIER_TOOLTIP = {
  'Básico':     'Arthur Murray: Bronze 1–2\nTimba: Básico',
  'Intermedio': 'Arthur Murray: Bronze 3–4\nTimba: All Levels Jr.',
  'Avanzado':   'Arthur Murray: Silver 1–4\nTimba: All Levels Pro',
  'Pro':        'Arthur Murray: Gold 1–4\nTimba: Intermedio',
};

// ─── COMPONENTES BASE ────────────────────────────────────────────────────────

const Badge = ({ label, color, bg }) => (
  <span style={{
    display:'inline-flex', alignItems:'center', padding:'2px 8px',
    borderRadius:99, fontSize:11, fontWeight:600, letterSpacing:'0.02em',
    color: color || C.green, background: bg || C.greenLight,
  }}>{label}</span>
);

const DominioTag = ({ level }) => {
  const d = DOMINIO_LEVELS.find(x => x.id === level) || DOMINIO_LEVELS[0];
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:600,
      color: d.color, background: d.color + '18',
    }}>{d.emoji} {d.label}</span>
  );
};

const Btn = ({ children, onClick, variant='primary', small, style={} }) => {
  const base = {
    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
    border:'none', borderRadius:10, cursor:'pointer', fontWeight:600,
    fontSize: small ? 13 : 14, padding: small ? '6px 12px' : '10px 18px',
    transition:'opacity .15s',
  };
  const variants = {
    primary: { background: C.green, color:'#fff' },
    ghost:   { background:'transparent', color: C.green, border:`1.5px solid ${C.border}` },
    danger:  { background:'transparent', color:'#B22222', border:`1.5px solid #B22222` },
  };
  return (
    <button onClick={onClick} style={{...base, ...variants[variant], ...style}}
      onMouseOver={e=>e.currentTarget.style.opacity='.8'}
      onMouseOut={e=>e.currentTarget.style.opacity='1'}>
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, placeholder, type='text', style={} }) => (
  <div style={{marginBottom:12}}>
    {label && <div style={{fontSize:12,fontWeight:600,color:C.textSub,marginBottom:4}}>{label}</div>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{
        width:'100%', padding:'10px 12px', borderRadius:8, fontSize:14,
        border:`1.5px solid ${C.border}`, background:C.bg, color:C.text,
        outline:'none', ...style,
      }}/>
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{marginBottom:12}}>
    {label && <div style={{fontSize:12,fontWeight:600,color:C.textSub,marginBottom:4}}>{label}</div>}
    <select value={value} onChange={e=>onChange(e.target.value)} style={{
      width:'100%', padding:'10px 12px', borderRadius:8, fontSize:14,
      border:`1.5px solid ${C.border}`, background:C.bg, color:C.text,
      outline:'none', cursor:'pointer',
    }}>
      {options.map(o => <option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
    </select>
  </div>
);

// Modal bottom sheet
const Modal = ({ title, onClose, children, wide }) => (
  <div style={{
    position:'fixed', inset:0, zIndex:100, display:'flex', flexDirection:'column',
    justifyContent:'flex-end', background:'rgba(0,0,0,0.4)', backdropFilter:'blur(2px)',
  }} onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div style={{
      background:C.surface, borderRadius:'20px 20px 0 0', padding:'0 20px 32px',
      maxHeight:'92vh', overflowY:'auto', maxWidth: wide?640:420,
      margin:'0 auto', width:'100%',
    }}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 0 12px'}}>
        <div style={{fontSize:17,fontWeight:700,color:C.text}}>{title}</div>
        <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:C.textSub}}>
          <Icon name="close" size={20}/>
        </button>
      </div>
      {children}
    </div>
  </div>
);

// ─── DATOS INICIALES ─────────────────────────────────────────────────────────
const INITIAL_GENRES = [
  { id:'salsa',    name:'Salsa',     color:'#C4622D', icon:'💃', nivelSystem:'arthur-murray' },
  { id:'bachata',  name:'Bachata',   color:'#7C3AED', icon:'🌹', nivelSystem:'arthur-murray' },
  { id:'merengue', name:'Merengue',  color:'#0891B2', icon:'🎺', nivelSystem:'arthur-murray' },
  { id:'chacha',   name:'Cha Cha',   color:'#D97706', icon:'🌟', nivelSystem:'arthur-murray' },
  { id:'hustle',   name:'Hustle',    color:'#DC2626', icon:'🕺', nivelSystem:'arthur-murray' },
];

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:'home',      label:'Inicio',    icon:'home' },
  { id:'genres',    label:'Géneros',   icon:'genres' },
  { id:'calendar',  label:'Calendario',icon:'calendar' },
  { id:'sequences', label:'Secuencias',icon:'sequences' },
  { id:'profile',   label:'Perfil',    icon:'profile' },
];

const BottomNav = ({ active, onNav }) => (
  <nav style={{
    position:'fixed', bottom:0, left:0, right:0, zIndex:50,
    background:C.surface, borderTop:`1px solid ${C.border}`,
    display:'flex', padding:'8px 0 max(8px, env(safe-area-inset-bottom))',
  }}>
    {NAV_ITEMS.map(n => {
      const isActive = active === n.id;
      return (
        <button key={n.id} onClick={() => onNav(n.id)} style={{
          flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3,
          background:'none', border:'none', cursor:'pointer', padding:'4px 0',
          color: isActive ? C.green : C.textMuted,
          transition:'color .15s',
        }}>
          <Icon name={n.icon} size={22} color={isActive ? C.green : C.textMuted}/>
          <span style={{fontSize:10, fontWeight: isActive ? 700 : 400}}>{n.label}</span>
        </button>
      );
    })}
  </nav>
);

// ─── SCREEN: HOME / DASHBOARD ────────────────────────────────────────────────
const HomeScreen = ({ moves, genres }) => {
  const allMoves = moves;
  const counts = { aprendido:0, shadow:0, follower:0, social:0 };
  allMoves.forEach(m => {
    m.variants?.forEach(v => { if(counts[v.dominio]!==undefined) counts[v.dominio]++; });
  });
  const total = allMoves.length;

  // Próximos pasos: moves sin nivel "social", ordenados por fecha de creación (más antiguos primero)
  const proximos = [...allMoves]
    .filter(m => {
      const baseVariant = m.variants?.[0];
      return baseVariant && baseVariant.dominio !== 'social';
    })
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
    .slice(0, 5)
    .map(m => {
      const v = m.variants?.[0];
      const d = DOMINIO_LEVELS.find(x => x.id === v?.dominio);
      const genre = genres.find(g => g.id === m.genreId);
      const nextLevel = DOMINIO_LEVELS[DOMINIO_LEVELS.findIndex(x => x.id === v?.dominio) + 1];
      return { move: m, variant: v, dominio: d, genre, nextLevel };
    });

  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <div style={{padding:'20px 16px 100px', background:C.bg, minHeight:'100vh'}}>
      {/* Header */}
      <div style={{marginBottom:24}}>
        <div style={{fontSize:12,fontWeight:600,color:C.textMuted,letterSpacing:'0.08em',marginBottom:4}}>ORICORIO</div>
        <div style={{fontSize:24,fontWeight:700,color:C.text}}>¡Seguimos bailando! 👋</div>
      </div>

      {/* Total repertorio */}
      <div style={{
        background:C.surface, borderRadius:16, padding:20, marginBottom:16,
        border:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:16,
      }}>
        <div>
          <div style={{fontSize:13,color:C.textSub,marginBottom:2}}>Tu repertorio</div>
          <div style={{fontSize:42,fontWeight:800,color:C.text,lineHeight:1}}>{total}</div>
          <div style={{fontSize:13,color:C.textSub}}>movimientos</div>
        </div>
        <div style={{marginLeft:'auto', fontSize:32}}>💃</div>
      </div>

      {/* Progreso por milestone */}
      <div style={{background:C.surface, borderRadius:16, padding:20, marginBottom:16, border:`1px solid ${C.border}`}}>
        <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:16}}>Progreso por nivel</div>
        {DOMINIO_LEVELS.map(d => (
          <div key={d.id} style={{marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
              <span style={{fontSize:13,color:C.text,display:'flex',alignItems:'center',gap:6}}>
                {d.emoji} {d.label}
              </span>
              <span style={{fontSize:13,fontWeight:700,color:C.text}}>{counts[d.id]}</span>
            </div>
            <div style={{height:6,background:C.border,borderRadius:99}}>
              <div style={{
                height:'100%', borderRadius:99,
                width:`${(counts[d.id]/maxCount)*100}%`,
                background: d.color, transition:'width .4s',
              }}/>
            </div>
          </div>
        ))}
      </div>

      {/* Próximos pasos */}
      {proximos.length > 0 && (
        <div style={{background:C.surface, borderRadius:16, padding:20, border:`1px solid ${C.border}`}}>
          <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:14}}>Próximos pasos</div>
          {proximos.map(({ move, variant, dominio, genre, nextLevel }) => (
            <div key={move.id} style={{
              display:'flex', alignItems:'center', gap:12, paddingBottom:12, marginBottom:12,
              borderBottom:`1px solid ${C.border}`,
            }}>
              <div style={{
                width:36, height:36, borderRadius:10, background: dominio?.color+'18',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0,
              }}>{dominio?.emoji}</div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:2}}>{move.name}</div>
                <div style={{fontSize:12,color:C.textSub}}>
                  {genre?.name} · {nextLevel ? `Subir a ${nextLevel.label}` : 'En social ✓'}
                </div>
              </div>
              <Icon name="chevronRight" size={16} color={C.textMuted}/>
            </div>
          )).reduce((acc, el, i) => {
            if(i === proximos.length-1) return [...acc, <div key={`last-${i}`} style={{display:'flex',alignItems:'center',gap:12}}>{el.props.children}</div>];
            return [...acc, el];
          }, [])}
        </div>
      )}

      {total === 0 && (
        <div style={{textAlign:'center',padding:'40px 20px',color:C.textSub}}>
          <div style={{fontSize:40,marginBottom:12}}>🕺</div>
          <div style={{fontSize:16,fontWeight:600,marginBottom:8}}>¡Agrega tu primer movimiento!</div>
          <div style={{fontSize:14}}>Ve a Géneros para empezar</div>
        </div>
      )}
    </div>
  );
};

// ─── SCREEN: GÉNEROS (lista) ─────────────────────────────────────────────────
const GenresScreen = ({ genres, setGenres, moves, onSelectGenre }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [form, setForm] = useState({ name:'', color:'#2D5016', icon:'💃', origen:'Arthur Murray', nivelSystem:'arthur-murray' });

  const filtered = genres.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const saveGenre = () => {
    if (!form.name.trim()) return;
    if (editingGenre) {
      setGenres(genres.map(g => g.id === editingGenre.id ? {...g, ...form} : g));
    } else {
      setGenres([...genres, { id: Date.now().toString(), ...form }]);
    }
    setShowModal(false);
    setEditingGenre(null);
    setForm({ name:'', color:'#2D5016', icon:'💃', origen:'Arthur Murray', nivelSystem:'arthur-murray' });
  };

  const deleteGenre = (id) => {
    if (!confirm('¿Borrar este género y todos sus movimientos?')) return;
    setGenres(genres.filter(g => g.id !== id));
  };

  const openEdit = (g) => {
    setEditingGenre(g);
    setForm({ name:g.name, color:g.color, icon:g.icon||'💃', origen:g.origen||'Arthur Murray', nivelSystem:g.nivelSystem||'arthur-murray' });
    setShowModal(true);
  };

  return (
    <div style={{padding:'20px 16px 100px', background:C.bg, minHeight:'100vh'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div style={{fontSize:24,fontWeight:700,color:C.text}}>Géneros</div>
        <button onClick={()=>{setEditingGenre(null);setForm({name:'',color:'#2D5016',icon:'💃',nivelSystem:'arthur-murray'});setShowModal(true);}}
          style={{background:C.green,border:'none',borderRadius:10,width:36,height:36,
            display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <Icon name="plus" size={18} color="#fff"/>
        </button>
      </div>

      {/* Buscador */}
      <div style={{position:'relative',marginBottom:16}}>
        <div style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:C.textMuted}}>
          <Icon name="search" size={16}/>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Buscar género..."
          style={{width:'100%',padding:'10px 12px 10px 34px',borderRadius:10,fontSize:14,
            border:`1.5px solid ${C.border}`,background:C.surface,color:C.text,outline:'none'}}/>
      </div>

      {/* Lista de géneros */}
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {filtered.map(g => {
          const genreMoves = moves.filter(m => m.genreId === g.id);
          const totalMoves = genreMoves.length;
          return (
            <div key={g.id} style={{
              background:C.surface, borderRadius:14, padding:'14px 16px',
              border:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12,
            }}>
              {/* Avatar */}
              <div onClick={() => onSelectGenre(g)} style={{
                width:48, height:48, borderRadius:12, background: g.color+'20',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:22, cursor:'pointer', flexShrink:0,
              }}>{g.icon || '💃'}</div>

              {/* Info */}
              <div style={{flex:1, minWidth:0, cursor:'pointer'}} onClick={() => onSelectGenre(g)}>
                <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:4}}>{g.name}</div>
                <div style={{fontSize:12,color:C.textSub,marginBottom:6}}>
                  {totalMoves} movimiento{totalMoves!==1?'s':''}
                </div>
                {/* Progress bar */}
                <div style={{height:4,background:C.border,borderRadius:99,maxWidth:160}}>
                  <div style={{
                    height:'100%',borderRadius:99,
                    width: totalMoves > 0 ? '60%' : '0%',
                    background: g.color,
                  }}/>
                </div>
              </div>

              {/* Acciones */}
              <div style={{display:'flex',gap:4,flexShrink:0}}>
                <button onClick={() => openEdit(g)} style={{
                  background:'none',border:`1px solid ${C.border}`,borderRadius:8,
                  width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
                }}><Icon name="edit" size={14} color={C.textSub}/></button>
                <button onClick={() => deleteGenre(g.id)} style={{
                  background:'none',border:`1px solid ${C.border}`,borderRadius:8,
                  width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
                }}><Icon name="trash" size={14} color={C.red}/></button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{textAlign:'center',padding:'40px 20px',color:C.textSub}}>
            <div style={{fontSize:32,marginBottom:8}}>🎵</div>
            <div>No hay géneros aún</div>
          </div>
        )}
      </div>

      {/* Modal crear/editar género */}
      {showModal && (
        <Modal title={editingGenre ? 'Editar género' : 'Nuevo género'} onClose={()=>{setShowModal(false);setEditingGenre(null);}}>
          <Input label="Nombre" value={form.name} onChange={v=>setForm({...form,name:v})} placeholder="ej. Salsa"/>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:600,color:C.textSub,marginBottom:4}}>Ícono (emoji)</div>
            <input value={form.icon} onChange={e=>setForm({...form,icon:e.target.value})}
              style={{width:'100%',padding:'10px 12px',borderRadius:8,fontSize:20,
                border:`1.5px solid ${C.border}`,background:C.bg,outline:'none'}}/>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:600,color:C.textSub,marginBottom:4}}>Color</div>
            <input type="color" value={form.color} onChange={e=>setForm({...form,color:e.target.value})}
              style={{width:'100%',height:44,borderRadius:8,border:`1.5px solid ${C.border}`,
                background:C.bg,cursor:'pointer',padding:4}}/>
          </div>
          <Select label="Sistema de niveles" value={form.nivelSystem} onChange={v=>setForm({...form,nivelSystem:v})}
            options={[
              {value:'arthur-murray', label:'Arthur Murray (Bronze/Silver/Gold)'},
              {value:'timba',         label:'Timba (Básico / All Levels / Intermedio)'},
              {value:'default',       label:'Genérico (Básico / Intermedio / Avanzado / Pro)'},
            ]}/>
          <div style={{display:'flex',gap:8}}>
            <Btn variant="ghost" onClick={()=>{setShowModal(false);setEditingGenre(null);}}>Cancelar</Btn>
            <Btn onClick={saveGenre} style={{flex:1}}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── SCREEN: DENTRO DE UN GÉNERO ─────────────────────────────────────────────
const GenreDetailScreen = ({ genre, moves, setMoves, onBack, onSelectMove, sequences, setSequences }) => {
  const [tab, setTab] = useState('moves'); // 'moves' | 'sequences'
  const [nivelFilter, setNivelFilter] = useState('Todos');
  const [showAddMove, setShowAddMove] = useState(false);
  const defaultOrigen = 'Arthur Murray';
  const [moveForm, setMoveForm] = useState({ name:'', origen: defaultOrigen, nivel: getNivelesForOrigen(defaultOrigen)[0] });

  // Cuando cambia el origen, reseteamos el nivel al primero de ese sistema
  const handleOrigenChange = (newOrigen) => {
    setMoveForm(f => ({ ...f, origen: newOrigen, nivel: getNivelesForOrigen(newOrigen)[0] }));
  };

  const formNiveles = getNivelesForOrigen(moveForm.origen);

  const genreMoves = moves.filter(m => m.genreId === genre.id);
  const filteredMoves = nivelFilter === 'Todos'
    ? genreMoves
    : genreMoves.filter(m => nivelToTier(m.nivel) === nivelFilter);

  const genreSeqs = sequences.filter(s => s.genreId === genre.id);

  const addMove = () => {
    if (!moveForm.name.trim()) return;
    const newMove = {
      id: Date.now().toString(),
      genreId: genre.id,
      name: moveForm.name,
      origen: moveForm.origen,
      nivel: moveForm.nivel,
      createdAt: Date.now(),
      variants: [{
        id: Date.now().toString() + '_v',
        name: 'Clásica',
        videoUrl: '',
        agarreInicial: 'D-D',
        agarre_final: 'D-D',
        descripcion: '',
        dominio: 'aprendido',
        cuentas: [],
        notas: '',
        isBase: true,
      }]
    };
    setMoves([...moves, newMove]);
    setShowAddMove(false);
    setMoveForm({ name:'', origen: defaultOrigen, nivel: getNivelesForOrigen(defaultOrigen)[0] });
  };

  const deleteMove = (moveId) => {
    if (!confirm('¿Eliminar este movimiento y todas sus variantes?')) return;
    setMoves(moves.filter(m => m.id !== moveId));
  };

  return (
    <div style={{background:C.bg, minHeight:'100vh', paddingBottom:100}}>
      {/* Header */}
      <div style={{
        background:C.surface, borderBottom:`1px solid ${C.border}`,
        padding:'16px 16px 0',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
          <button onClick={onBack} style={{background:'none',border:'none',cursor:'pointer',color:C.text}}>
            <Icon name="back" size={20}/>
          </button>
          <div style={{
            width:40,height:40,borderRadius:10,background:genre.color+'20',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,
          }}>{genre.icon}</div>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:C.text}}>{genre.name}</div>
            <div style={{fontSize:12,color:C.textSub}}>{genreMoves.length} movimientos</div>
          </div>
          <button onClick={()=>setShowAddMove(true)} style={{
            marginLeft:'auto',background:C.green,border:'none',borderRadius:10,
            width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
          }}>
            <Icon name="plus" size={18} color="#fff"/>
          </button>
        </div>

        {/* Tabs Movimientos / Secuencias */}
        <div style={{display:'flex',gap:0,borderBottom:`2px solid ${C.border}`}}>
          {[{id:'moves',label:`Movimientos (${genreMoves.length})`},{id:'sequences',label:`Secuencias (${genreSeqs.length})`}].map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:'8px 16px',background:'none',border:'none',cursor:'pointer',
              fontSize:14,fontWeight:600,
              color: tab===t.id ? C.green : C.textSub,
              borderBottom: tab===t.id ? `2px solid ${C.green}` : '2px solid transparent',
              marginBottom:-2,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Submenu nivel */}
      {tab === 'moves' && (
        <div style={{padding:'12px 16px 0',display:'flex',gap:8,overflowX:'auto'}}>
          {['Todos', ...NIVEL_TIERS].map(n => (
            <button key={n} onClick={()=>setNivelFilter(n)} style={{
              padding:'5px 12px',borderRadius:99,border:'none',cursor:'pointer',
              fontSize:12,fontWeight:600,whiteSpace:'nowrap',
              background: nivelFilter===n ? C.green : C.surface,
              color: nivelFilter===n ? '#fff' : C.textSub,
              border: nivelFilter===n ? 'none' : `1px solid ${C.border}`,
            }}>{n}</button>
          ))}
        </div>
      )}

      {/* Lista movimientos */}
      {tab === 'moves' && (
        <div style={{padding:'12px 16px',display:'flex',flexDirection:'column',gap:8}}>
          {filteredMoves.map(m => {
            const baseVariant = m.variants?.[0];
            const d = DOMINIO_LEVELS.find(x => x.id === baseVariant?.dominio) || DOMINIO_LEVELS[0];
            return (
              <div key={m.id}
                style={{
                  background:C.surface, borderRadius:12, padding:'12px 16px',
                  border:`1px solid ${C.border}`, display:'flex', alignItems:'center',
                  gap:12,
                }}>
                <div onClick={() => onSelectMove(m)} style={{
                  width:40, height:40, borderRadius:10, background:d.color+'18',
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0,
                  cursor:'pointer',
                }}>{d.emoji}</div>
                <div style={{flex:1,minWidth:0,cursor:'pointer'}} onClick={() => onSelectMove(m)}>
                  <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:2}}>{m.name}</div>
                  <div style={{fontSize:12,color:C.textSub}}>
                    {m.nivel} · {m.origen}
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <DominioTag level={baseVariant?.dominio || 'aprendido'}/>
                  <button onClick={e=>{e.stopPropagation();deleteMove(m.id);}} style={{
                    background:'none',border:`1px solid ${C.border}`,borderRadius:8,
                    width:30,height:30,display:'flex',alignItems:'center',justifyContent:'center',
                    cursor:'pointer',flexShrink:0,
                  }}>
                    <Icon name="trash" size={13} color={C.red}/>
                  </button>
                  <Icon name="chevronRight" size={14} color={C.textMuted} style={{cursor:'pointer'}} onClick={() => onSelectMove(m)}/>
                </div>
              </div>
            );
          })}
          {filteredMoves.length === 0 && (
            <div style={{textAlign:'center',padding:'32px',color:C.textSub}}>
              <div style={{fontSize:28,marginBottom:8}}>🕺</div>
              <div>No hay movimientos aquí aún</div>
            </div>
          )}
        </div>
      )}

      {/* Lista secuencias */}
      {tab === 'sequences' && (
        <SequencesList genre={genre} sequences={genreSeqs} setSequences={setSequences} moves={genreMoves} allSequences={sequences}/>
      )}

      {/* Modal agregar movimiento */}
      {showAddMove && (
        <Modal title="Nuevo movimiento" onClose={()=>setShowAddMove(false)}>
          <Input label="Nombre" value={moveForm.name} onChange={v=>setMoveForm({...moveForm,name:v})} placeholder="ej. Enchufle doble"/>
          <Select label="Origen" value={moveForm.origen} onChange={handleOrigenChange}
            options={ORIGENES}/>
          <Select label="Nivel" value={moveForm.nivel} onChange={v=>setMoveForm({...moveForm,nivel:v})}
            options={formNiveles}/>
          <div style={{display:'flex',gap:8}}>
            <Btn variant="ghost" onClick={()=>setShowAddMove(false)}>Cancelar</Btn>
            <Btn onClick={addMove} style={{flex:1}}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── SCREEN: DETALLE DE MOVIMIENTO ───────────────────────────────────────────
const MoveDetailScreen = ({ move, setMove, genre, onBack, genres }) => {
  const [tab, setTab] = useState('general'); // general | variants | transitions
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [showEditMove, setShowEditMove] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [moveForm, setMoveForm] = useState({ name: move.name, origen: move.origen, nivel: move.nivel });

  const editNiveles = getNivelesForOrigen(moveForm.origen);
  const handleEditOrigenChange = (newOrigen) => {
    setMoveForm(f => ({ ...f, origen: newOrigen, nivel: getNivelesForOrigen(newOrigen)[0] }));
  };

  const variantInitial = { name:'', videoUrl:'', agarreInicial:'D-D', agarre_final:'D-D', dominio:'aprendido', nivel: getNivelesForOrigen(move.origen||'Arthur Murray')[0] };
  const [variantForm, setVariantForm] = useState(variantInitial);

  const variants = move.variants || [];
  const baseVariant = variants.find(v => v.isBase) || variants[0];

  const addVariant = () => {
    if (!variantForm.name.trim()) return;
    const newVar = {
      id: Date.now().toString(),
      ...variantForm,
      cuentas: [],
      notas: '',
      descripcion: '',
      isBase: false,
    };
    setMove({ ...move, variants: [...variants, newVar] });
    setShowAddVariant(false);
    setVariantForm(variantInitial);
  };

  const saveEditMove = () => {
    setMove({ ...move, ...moveForm });
    setShowEditMove(false);
  };

  if (selectedVariant) {
    return (
      <VariantDetailScreen
        variant={selectedVariant}
        move={move}
        genre={genre}
        onBack={() => setSelectedVariant(null)}
        onUpdateVariant={(updatedVar) => {
          setMove({ ...move, variants: variants.map(v => v.id === updatedVar.id ? updatedVar : v) });
          setSelectedVariant(updatedVar);
        }}
        onDeleteVariant={(varId) => {
          setMove({ ...move, variants: variants.filter(v => v.id !== varId) });
          setSelectedVariant(null);
        }}
      />
    );
  }

  return (
    <div style={{background:C.bg, minHeight:'100vh', paddingBottom:100}}>
      {/* Header */}
      <div style={{background:C.surface, borderBottom:`1px solid ${C.border}`, padding:'16px 16px 0'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
          <button onClick={onBack} style={{background:'none',border:'none',cursor:'pointer',color:C.text}}>
            <Icon name="back" size={20}/>
          </button>
          <div style={{flex:1}}>
            <div style={{fontSize:20,fontWeight:700,color:C.text}}>{move.name}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:4}}>
              {genre && <Badge label={genre.name} color={genre.color} bg={genre.color+'18'}/>}
              <Badge label={move.origen}/>
              <Badge label={`Nivel: ${move.nivel}`}/>
            </div>
          </div>
          <button onClick={()=>setShowEditMove(true)} style={{background:'none',border:'none',cursor:'pointer',color:C.textSub}}>
            <Icon name="edit" size={18}/>
          </button>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',borderBottom:`2px solid ${C.border}`}}>
          {[{id:'general',label:'General'},{id:'variants',label:`Variantes (${variants.length})`},{id:'transitions',label:'Transiciones'}].map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:'8px 16px',background:'none',border:'none',cursor:'pointer',
              fontSize:13,fontWeight:600,
              color: tab===t.id ? C.green : C.textSub,
              borderBottom: tab===t.id ? `2px solid ${C.green}` : '2px solid transparent',
              marginBottom:-2,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Tab: General */}
      {tab === 'general' && (
        <div style={{padding:16}}>
          {/* Video variante base */}
          {baseVariant?.videoUrl ? (
            <VideoPlayer url={baseVariant.videoUrl}/>
          ) : (
            <div style={{
              background:C.surface, borderRadius:12, height:180, marginBottom:16,
              display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
              border:`2px dashed ${C.border}`, gap:8, cursor:'pointer',
            }} onClick={() => baseVariant && setSelectedVariant(baseVariant)}>
              <Icon name="video" size={28} color={C.textMuted}/>
              <div style={{fontSize:13,color:C.textMuted}}>Agregar video a variante base</div>
            </div>
          )}

          {/* Variante base info */}
          {baseVariant && (
            <div style={{background:C.surface,borderRadius:12,padding:16,border:`1px solid ${C.border}`,marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <div style={{fontSize:14,fontWeight:700,color:C.text}}>Variante base</div>
                <DominioTag level={baseVariant.dominio}/>
              </div>
              {baseVariant.agarreInicial && (
                <div style={{display:'flex',gap:12,marginBottom:8}}>
                  <div style={{background:C.bg,borderRadius:8,padding:'6px 10px',fontSize:12,color:C.textSub}}>
                    <span style={{fontWeight:600}}>Inicial:</span> {baseVariant.agarreInicial}
                  </div>
                  <div style={{background:C.bg,borderRadius:8,padding:'6px 10px',fontSize:12,color:C.textSub}}>
                    <span style={{fontWeight:600}}>Final:</span> {baseVariant.agarre_final}
                  </div>
                </div>
              )}
              <Btn small variant="ghost" onClick={()=>setSelectedVariant(baseVariant)}>
                Ver detalle completo
              </Btn>
            </div>
          )}
        </div>
      )}

      {/* Tab: Variantes */}
      {tab === 'variants' && (
        <div style={{padding:16}}>
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
            <Btn small onClick={()=>setShowAddVariant(true)}>
              <Icon name="plus" size={14} color="#fff"/> Añadir variante
            </Btn>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {variants.map(v => (
              <div key={v.id} onClick={()=>setSelectedVariant(v)} style={{
                background:C.surface,borderRadius:12,padding:'12px 16px',
                border:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:12,cursor:'pointer',
              }}>
                {/* Miniatura o placeholder */}
                <div style={{
                  width:52,height:52,borderRadius:8,background:C.border,
                  display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                  overflow:'hidden',
                }}>
                  {v.videoUrl ? <Icon name="video" size={20} color={C.textSub}/> : <span style={{fontSize:20}}>🎬</span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:4}}>
                    {v.name} {v.isBase && <span style={{fontSize:11,color:C.textMuted}}>(base)</span>}
                  </div>
                  {v.videoUrl && <div style={{fontSize:11,color:C.textMuted,marginBottom:4}}>Video añadido</div>}
                  <DominioTag level={v.dominio}/>
                </div>
                <Icon name="chevronRight" size={16} color={C.textMuted}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Transiciones */}
      {tab === 'transitions' && (
        <TransitionsView move={move} baseVariant={baseVariant}/>
      )}

      {/* Modal agregar variante */}
      {showAddVariant && (
        <Modal title="Nueva variante" onClose={()=>setShowAddVariant(false)}>
          <Input label="Nombre" value={variantForm.name} onChange={v=>setVariantForm({...variantForm,name:v})} placeholder="ej. Con cambio de mano"/>
          <VideoInput value={variantForm.videoUrl} onChange={v=>setVariantForm({...variantForm,videoUrl:v})}/>
          <Select label="Agarre inicial" value={variantForm.agarreInicial} onChange={v=>setVariantForm({...variantForm,agarreInicial:v})} options={AGARRES}/>
          <Select label="Agarre final" value={variantForm.agarre_final} onChange={v=>setVariantForm({...variantForm,agarre_final:v})} options={AGARRES}/>
          <Select label="Nivel de dominio" value={variantForm.dominio} onChange={v=>setVariantForm({...variantForm,dominio:v})}
            options={DOMINIO_LEVELS.map(d=>({value:d.id,label:`${d.emoji} ${d.label}`}))}/>
          <div style={{display:'flex',gap:8}}>
            <Btn variant="ghost" onClick={()=>setShowAddVariant(false)}>Cancelar</Btn>
            <Btn onClick={addVariant} style={{flex:1}}>Guardar</Btn>
          </div>
        </Modal>
      )}

      {/* Modal editar movimiento */}
      {showEditMove && (
        <Modal title="Editar movimiento" onClose={()=>setShowEditMove(false)}>
          <Input label="Nombre" value={moveForm.name} onChange={v=>setMoveForm({...moveForm,name:v})}/>
          <Select label="Origen" value={moveForm.origen} onChange={handleEditOrigenChange} options={ORIGENES}/>
          <Select label="Nivel" value={moveForm.nivel} onChange={v=>setMoveForm({...moveForm,nivel:v})} options={editNiveles}/>
          <div style={{display:'flex',gap:8}}>
            <Btn variant="ghost" onClick={()=>setShowEditMove(false)}>Cancelar</Btn>
            <Btn onClick={saveEditMove} style={{flex:1}}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── VIDEO PLAYER ─────────────────────────────────────────────────────────────
const VideoPlayer = ({ url }) => {
  if (!url) return null;
  const getYoutubeId = (u) => {
    const match = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&\n?#]+)/);
    return match ? match[1] : null;
  };
  const ytId = getYoutubeId(url);
  if (ytId) {
    return (
      <div style={{borderRadius:12,overflow:'hidden',marginBottom:16,aspectRatio:'16/9',background:'#000'}}>
        <iframe width="100%" height="100%" style={{border:'none'}}
          src={`https://www.youtube.com/embed/${ytId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen/>
      </div>
    );
  }
  // Video local (blob URL) u otro
  if (url.startsWith('blob:') || url.startsWith('data:') || /\.(mp4|mov|webm|m4v)(\?|$)/i.test(url)) {
    return (
      <div style={{borderRadius:12,overflow:'hidden',marginBottom:16,background:'#000'}}>
        <video src={url} controls style={{width:'100%',borderRadius:12,maxHeight:300,display:'block'}}/>
      </div>
    );
  }
  return (
    <div style={{
      background:C.surface,borderRadius:12,height:120,marginBottom:16,
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      border:`1px solid ${C.border}`,gap:6,
    }}>
      <Icon name="link" size={24} color={C.textMuted}/>
      <a href={url} target="_blank" rel="noopener noreferrer" style={{fontSize:13,color:C.green}}>
        Ver video
      </a>
    </div>
  );
};

// Input de video: URL + subir desde galería/cámara
const VideoInput = ({ value, onChange, label='Video' }) => {
  const fileRef = React.useRef();
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    onChange(blobUrl);
  };
  return (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:12,fontWeight:600,color:C.textSub,marginBottom:4}}>{label}</div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <input
          type="text" value={value||''} onChange={e=>onChange(e.target.value)}
          placeholder="Pegar URL de YouTube..."
          style={{flex:1,padding:'10px 12px',borderRadius:8,fontSize:13,
            border:`1.5px solid ${C.border}`,background:C.bg,color:C.text,outline:'none'}}/>
        <button onClick={()=>fileRef.current?.click()} title="Subir video del celular" style={{
          background:C.green,border:'none',borderRadius:8,width:40,height:40,
          display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,
        }}>
          <Icon name="video" size={18} color="#fff"/>
        </button>
      </div>
      <input ref={fileRef} type="file" accept="video/*" style={{display:'none'}} onChange={handleFile}/>
      {value && value.startsWith('blob:') && (
        <div style={{fontSize:11,color:C.textMuted,marginTop:4}}>
          📎 Video guardado localmente (solo en este dispositivo)
        </div>
      )}
    </div>
  );
};

// ─── SCREEN: DETALLE DE VARIANTE ──────────────────────────────────────────────
const VariantDetailScreen = ({ variant, move, genre, onBack, onUpdateVariant, onDeleteVariant }) => {
  const [tab, setTab] = useState('tecnica'); // tecnica | cuentas | notas | transiciones
  const [form, setForm] = useState({ ...variant });
  const [editingCuenta, setEditingCuenta] = useState(null);
  const [nuevaCuenta, setNuevaCuenta] = useState('');
  const [nuevaCuentaBeat, setNuevaCuentaBeat] = useState('1');

  const save = useCallback(() => {
    onUpdateVariant(form);
  }, [form, onUpdateVariant]);

  const addCuenta = () => {
    if (!nuevaCuenta.trim()) return;
    const cuentas = [...(form.cuentas || []), { id: Date.now().toString(), beat: parseInt(nuevaCuentaBeat)||1, texto: nuevaCuenta }];
    // Ordenar por beat
    cuentas.sort((a,b) => a.beat - b.beat);
    setForm({ ...form, cuentas });
    setNuevaCuenta('');
    // No reseteamos el beat para que sea cómodo agregar el siguiente
  };

  const deleteCuenta = (id) => {
    setForm({ ...form, cuentas: form.cuentas.filter(c => c.id !== id) });
  };

  return (
    <div style={{background:C.bg, minHeight:'100vh', paddingBottom:100}}>
      {/* Header */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:'16px 16px 0'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
          <button onClick={() => { save(); onBack(); }} style={{background:'none',border:'none',cursor:'pointer',color:C.text}}>
            <Icon name="back" size={20}/>
          </button>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text}}>{move.name}</div>
            <div style={{fontSize:14,color:C.textSub}}>{form.name} {form.isBase && '(base)'}</div>
          </div>
          <button onClick={()=>onDeleteVariant(variant.id)} style={{background:'none',border:'none',cursor:'pointer',color:C.red}}>
            <Icon name="trash" size={18}/>
          </button>
        </div>
        <div style={{display:'flex',borderBottom:`2px solid ${C.border}`}}>
          {[{id:'tecnica',label:'Técnica'},{id:'cuentas',label:'Cuentas'},{id:'notas',label:'Notas'},{id:'transiciones',label:'Transiciones'}].map(t=>(
            <button key={t.id} onClick={()=>{save();setTab(t.id);}} style={{
              padding:'8px 12px',background:'none',border:'none',cursor:'pointer',
              fontSize:12,fontWeight:600,
              color: tab===t.id ? C.green : C.textSub,
              borderBottom: tab===t.id ? `2px solid ${C.green}` : '2px solid transparent',
              marginBottom:-2,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Tab: Técnica */}
      {tab === 'tecnica' && (
        <div style={{padding:16}}>
          {/* Video */}
          {form.videoUrl ? <VideoPlayer url={form.videoUrl}/> : null}
          <VideoInput label="Video" value={form.videoUrl||''} onChange={v=>setForm({...form,videoUrl:v})}/>

          {/* Agarres */}
          <div style={{display:'flex',gap:12,marginBottom:12}}>
            <div style={{flex:1}}>
              <Select label="Agarre inicial" value={form.agarreInicial||'D-D'}
                onChange={v=>setForm({...form,agarreInicial:v})} options={AGARRES}/>
            </div>
            <div style={{flex:1}}>
              <Select label="Agarre final" value={form.agarre_final||'D-D'}
                onChange={v=>setForm({...form,agarre_final:v})} options={AGARRES}/>
            </div>
          </div>

          {/* Nivel de dominio */}
          <Select label="Nivel de dominio" value={form.dominio||'aprendido'}
            onChange={v=>setForm({...form,dominio:v})}
            options={DOMINIO_LEVELS.map(d=>({value:d.id,label:`${d.emoji} ${d.label}`}))}/>

          {/* Descripción */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:600,color:C.textSub,marginBottom:4}}>Descripción</div>
            <textarea value={form.descripcion||''} onChange={e=>setForm({...form,descripcion:e.target.value})}
              placeholder="Describe la variante..." rows={3}
              style={{width:'100%',padding:'10px 12px',borderRadius:8,fontSize:14,
                border:`1.5px solid ${C.border}`,background:C.bg,color:C.text,
                outline:'none',resize:'vertical',fontFamily:'inherit'}}/>
          </div>

          <Btn onClick={save} style={{width:'100%'}}>Guardar cambios</Btn>
        </div>
      )}

      {/* Tab: Cuentas */}
      {tab === 'cuentas' && (
        <div style={{padding:16}}>
          <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>Notas por cuenta</div>
          <div style={{fontSize:12,color:C.textSub,marginBottom:16}}>Qué pasa en cada tiempo del baile</div>

          {(form.cuentas||[]).map((c,i) => (
            <div key={c.id} style={{
              background:C.surface,borderRadius:10,padding:'10px 12px',marginBottom:8,
              border:`1px solid ${C.border}`,display:'flex',alignItems:'flex-start',gap:10,
            }}>
              <div style={{
                width:28,height:28,borderRadius:99,background:C.green,flexShrink:0,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:12,fontWeight:700,color:'#fff',
              }}>{c.beat}</div>
              <div style={{flex:1}}>
                {editingCuenta === c.id ? (
                  <input autoFocus value={c.texto}
                    onChange={e=>setForm({...form,cuentas:form.cuentas.map(x=>x.id===c.id?{...x,texto:e.target.value}:x)})}
                    onBlur={()=>setEditingCuenta(null)}
                    onKeyDown={e=>e.key==='Enter'&&setEditingCuenta(null)}
                    style={{width:'100%',border:'none',background:'transparent',fontSize:13,color:C.text,outline:'none'}}/>
                ) : (
                  <div onClick={()=>setEditingCuenta(c.id)} style={{fontSize:13,color:C.text,cursor:'text',minHeight:20}}>{c.texto}</div>
                )}
              </div>
              <button onClick={()=>deleteCuenta(c.id)} style={{background:'none',border:'none',cursor:'pointer',color:C.textMuted,flexShrink:0}}>
                <Icon name="close" size={14}/>
              </button>
            </div>
          ))}

          <div style={{display:'flex',gap:8,marginTop:8,alignItems:'center'}}>
            <select value={nuevaCuentaBeat} onChange={e=>setNuevaCuentaBeat(e.target.value)}
              style={{
                width:52,padding:'10px 6px',borderRadius:8,fontSize:14,fontWeight:700,
                border:`1.5px solid ${C.border}`,background:C.bg,color:C.green,
                outline:'none',cursor:'pointer',textAlign:'center',flexShrink:0,
              }}>
              {[1,2,3,4,5,6,7,8].map(n=>(
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <input value={nuevaCuenta} onChange={e=>setNuevaCuenta(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&addCuenta()}
              placeholder="¿Qué pasa en este tiempo?"
              style={{flex:1,padding:'10px 12px',borderRadius:8,fontSize:13,
                border:`1.5px solid ${C.border}`,background:C.bg,color:C.text,outline:'none'}}/>
            <Btn onClick={addCuenta} small><Icon name="plus" size={14} color="#fff"/></Btn>
          </div>
        </div>
      )}

      {/* Tab: Notas */}
      {tab === 'notas' && (
        <div style={{padding:16}}>
          <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>Notas libres</div>
          <div style={{fontSize:12,color:C.textSub,marginBottom:12}}>Observaciones, errores, tips... al estilo Severus Snape 🧪</div>
          <textarea value={form.notas||''} onChange={e=>setForm({...form,notas:e.target.value})}
            placeholder="Anota todo lo que no quieres olvidar sobre este movimiento..." rows={12}
            style={{width:'100%',padding:'12px',borderRadius:10,fontSize:14,
              border:`1.5px solid ${C.border}`,background:C.bg,color:C.text,
              outline:'none',resize:'vertical',fontFamily:'inherit',lineHeight:1.6}}/>
          <Btn onClick={save} style={{width:'100%',marginTop:12}}>Guardar notas</Btn>
        </div>
      )}

      {/* Tab: Transiciones */}
      {tab === 'transiciones' && (
        <TransitionsView move={move} baseVariant={form} fromVariant/>
      )}
    </div>
  );
};

// ─── TRANSICIONES ─────────────────────────────────────────────────────────────
const TransitionsView = ({ move, baseVariant, fromVariant }) => {
  // Esta vista mostraría movimientos compatibles por agarre
  // Por ahora muestra el agarre final y explica el concepto
  const finalAgarre = baseVariant?.agarre_final || baseVariant?.agarreInicial || 'D-D';

  return (
    <div style={{padding:16}}>
      <div style={{background:C.surface,borderRadius:12,padding:16,border:`1px solid ${C.border}`,marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:600,color:C.textSub,marginBottom:6}}>Agarre final de salida</div>
        <div style={{fontSize:20,fontWeight:700,color:C.green}}>{finalAgarre}</div>
        <div style={{fontSize:12,color:C.textMuted,marginTop:4}}>
          Movimientos con agarre inicial {finalAgarre} pueden conectar a continuación
        </div>
      </div>
      <div style={{
        background:C.greenLight,borderRadius:12,padding:16,border:`1px solid ${C.green}22`,
        textAlign:'center',color:C.textSub,fontSize:13,
      }}>
        <div style={{fontSize:24,marginBottom:8}}>🔗</div>
        Las sugerencias de transición aparecerán aquí automáticamente cuando tengas más movimientos registrados con sus agarres.
      </div>
    </div>
  );
};

// ─── SECUENCIAS ───────────────────────────────────────────────────────────────
const SequencesList = ({ genre, sequences, setSequences, moves, allSequences }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:'', tipo:'literal', moveIds:[], notas:'', cuentas:[] });

  const addSequence = () => {
    if (!form.name.trim()) return;
    const newSeq = {
      id: Date.now().toString(),
      genreId: genre.id,
      ...form,
      createdAt: Date.now(),
    };
    setSequences([...allSequences, newSeq]);
    setShowModal(false);
    setForm({ name:'', tipo:'literal', moveIds:[], notas:'', cuentas:[] });
  };

  return (
    <div style={{padding:'12px 16px'}}>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
        <Btn small onClick={()=>setShowModal(true)}>
          <Icon name="plus" size={14} color="#fff"/> Nueva secuencia
        </Btn>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {sequences.map(s => (
          <div key={s.id} style={{
            background:C.surface,borderRadius:12,padding:'12px 16px',
            border:`1px solid ${C.border}`,
          }}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
              <div style={{fontSize:14,fontWeight:600,color:C.text}}>{s.name}</div>
              <Badge label={s.tipo==='literal'?'Literal':'Avanzada'}
                color={s.tipo==='literal'?C.green:C.orange}
                bg={s.tipo==='literal'?C.greenLight:C.orange+'18'}/>
            </div>
            {s.moveIds?.length > 0 && (
              <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                {s.moveIds.map(mid => {
                  const m = moves.find(x=>x.id===mid);
                  return m ? <Badge key={mid} label={m.name} color={C.textSub} bg={C.border}/> : null;
                })}
              </div>
            )}
          </div>
        ))}
        {sequences.length === 0 && (
          <div style={{textAlign:'center',padding:'32px',color:C.textSub}}>
            <div style={{fontSize:28,marginBottom:8}}>🔗</div>
            <div>No hay secuencias aún</div>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Nueva secuencia" onClose={()=>setShowModal(false)} wide>
          <Input label="Nombre" value={form.name} onChange={v=>setForm({...form,name:v})} placeholder="ej. Timba Pro 27/09"/>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:600,color:C.textSub,marginBottom:8}}>Tipo</div>
            <div style={{display:'flex',gap:8}}>
              {[{id:'literal',label:'Literal',desc:'Moves tal cual'},{id:'avanzada',label:'Avanzada',desc:'Con deformaciones'}].map(t=>(
                <button key={t.id} onClick={()=>setForm({...form,tipo:t.id})} style={{
                  flex:1,padding:'10px',borderRadius:8,cursor:'pointer',
                  border:`2px solid ${form.tipo===t.id?C.green:C.border}`,
                  background: form.tipo===t.id?C.greenLight:C.surface,
                }}>
                  <div style={{fontSize:13,fontWeight:600,color:form.tipo===t.id?C.green:C.text}}>{t.label}</div>
                  <div style={{fontSize:11,color:C.textSub,marginTop:2}}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
          {/* Selección de moves */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:600,color:C.textSub,marginBottom:8}}>Movimientos</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {moves.map(m=>{
                const sel = form.moveIds.includes(m.id);
                return (
                  <button key={m.id} onClick={()=>setForm({...form,moveIds:sel?form.moveIds.filter(x=>x!==m.id):[...form.moveIds,m.id]})} style={{
                    padding:'4px 10px',borderRadius:99,border:'none',cursor:'pointer',fontSize:12,
                    background:sel?C.green:C.border, color:sel?'#fff':C.text,
                  }}>{m.name}</button>
                );
              })}
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <Btn variant="ghost" onClick={()=>setShowModal(false)}>Cancelar</Btn>
            <Btn onClick={addSequence} style={{flex:1}}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── SCREEN: SECUENCIAS (top-level) ──────────────────────────────────────────
const SequencesScreen = ({ sequences, genres, moves }) => {
  const [genreFilter, setGenreFilter] = useState('all');

  const filtered = genreFilter === 'all'
    ? sequences
    : sequences.filter(s => s.genreId === genreFilter);

  return (
    <div style={{padding:'20px 16px 100px', background:C.bg, minHeight:'100vh'}}>
      <div style={{fontSize:24,fontWeight:700,color:C.text,marginBottom:16}}>Secuencias</div>

      {/* Filtro por género */}
      <div style={{display:'flex',gap:8,overflowX:'auto',marginBottom:16,paddingBottom:4}}>
        <button onClick={()=>setGenreFilter('all')} style={{
          padding:'5px 12px',borderRadius:99,border:'none',cursor:'pointer',
          fontSize:12,fontWeight:600,whiteSpace:'nowrap',
          background:genreFilter==='all'?C.green:C.surface,
          color:genreFilter==='all'?'#fff':C.textSub,
          border:`1px solid ${genreFilter==='all'?'transparent':C.border}`,
        }}>Todos</button>
        {genres.map(g=>(
          <button key={g.id} onClick={()=>setGenreFilter(g.id)} style={{
            padding:'5px 12px',borderRadius:99,border:'none',cursor:'pointer',
            fontSize:12,fontWeight:600,whiteSpace:'nowrap',
            background:genreFilter===g.id?g.color:C.surface,
            color:genreFilter===g.id?'#fff':C.textSub,
            border:`1px solid ${genreFilter===g.id?'transparent':C.border}`,
          }}>{g.icon} {g.name}</button>
        ))}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {filtered.map(s => {
          const genre = genres.find(g=>g.id===s.genreId);
          const seqMoves = (s.moveIds||[]).map(id=>moves.find(m=>m.id===id)).filter(Boolean);
          return (
            <div key={s.id} style={{background:C.surface,borderRadius:14,padding:'14px 16px',border:`1px solid ${C.border}`}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:4}}>{s.name}</div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {genre && <Badge label={genre.name} color={genre.color} bg={genre.color+'18'}/>}
                    <Badge label={s.tipo==='literal'?'Literal':'Avanzada'}
                      color={s.tipo==='literal'?C.green:C.orange}
                      bg={s.tipo==='literal'?C.greenLight:C.orange+'18'}/>
                  </div>
                </div>
              </div>
              {seqMoves.length > 0 && (
                <div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:4}}>
                  {seqMoves.map((m,i)=>(
                    <span key={m.id} style={{display:'flex',alignItems:'center',gap:4}}>
                      <Badge label={m.name} color={C.textSub} bg={C.border}/>
                      {i<seqMoves.length-1 && <span style={{color:C.textMuted,fontSize:12}}>→</span>}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{textAlign:'center',padding:'40px',color:C.textSub}}>
            <div style={{fontSize:36,marginBottom:8}}>🔗</div>
            <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>No hay secuencias aún</div>
            <div style={{fontSize:13}}>Crea secuencias dentro de cada género</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── SCREEN: CALENDARIO ───────────────────────────────────────────────────────
const CalendarScreen = ({ sessions, setSessions, genres, moves }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    tipo:'Clase', hora:'', genreIds:[], moveIds:[], notas:'',
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();

  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DAYS = ['D','L','M','M','J','V','S'];

  const getDaySessions = (day) => {
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return sessions.filter(s => s.date === key);
  };

  const saveSession = () => {
    if (!selectedDay) return;
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`;
    const newSession = {
      id: Date.now().toString(),
      date: key,
      ...sessionForm,
      createdAt: Date.now(),
    };
    setSessions([...sessions, newSession]);
    setShowSessionModal(false);
    setSessionForm({ tipo:'Clase', hora:'', genreIds:[], moveIds:[], notas:'' });
  };

  return (
    <div style={{padding:'20px 16px 100px', background:C.bg, minHeight:'100vh'}}>
      {/* Header mes */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <button onClick={()=>setCurrentDate(new Date(year,month-1,1))} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:C.text}}>‹</button>
        <div style={{fontSize:18,fontWeight:700,color:C.text}}>{MONTHS[month]} {year}</div>
        <button onClick={()=>setCurrentDate(new Date(year,month+1,1))} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:C.text}}>›</button>
      </div>

      {/* Días semana */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',marginBottom:8}}>
        {DAYS.map((d,i)=>(
          <div key={i} style={{textAlign:'center',fontSize:11,fontWeight:600,color:C.textMuted,padding:'4px 0'}}>{d}</div>
        ))}
      </div>

      {/* Grilla días */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:20}}>
        {Array(firstDay).fill(null).map((_,i)=><div key={'e'+i}/>)}
        {Array(daysInMonth).fill(null).map((_,i)=>{
          const day = i+1;
          const daySessions = getDaySessions(day);
          const isToday = new Date().getDate()===day && new Date().getMonth()===month && new Date().getFullYear()===year;
          const isSelected = selectedDay === day;
          return (
            <div key={day} onClick={()=>setSelectedDay(isSelected?null:day)} style={{
              aspectRatio:'1', display:'flex',flexDirection:'column',
              alignItems:'center',justifyContent:'center',gap:2,
              borderRadius:10, cursor:'pointer',
              background: isSelected ? C.green : isToday ? C.greenLight : 'transparent',
              border: isToday && !isSelected ? `1.5px solid ${C.green}` : '1.5px solid transparent',
            }}>
              <span style={{fontSize:13,fontWeight:isToday?700:400,color:isSelected?'#fff':C.text}}>{day}</span>
              {daySessions.length > 0 && (
                <div style={{width:5,height:5,borderRadius:99,background:isSelected?'#fff':C.green}}/>
              )}
            </div>
          );
        })}
      </div>

      {/* Sesiones del día seleccionado */}
      {selectedDay && (
        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <div style={{fontSize:15,fontWeight:700,color:C.text}}>
              {selectedDay} de {MONTHS[month]}
            </div>
            <Btn small onClick={()=>setShowSessionModal(true)}>
              <Icon name="plus" size={14} color="#fff"/> Sesión
            </Btn>
          </div>

          {getDaySessions(selectedDay).map(s=>(
            <div key={s.id} style={{background:C.surface,borderRadius:12,padding:'12px 16px',marginBottom:8,border:`1px solid ${C.border}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <div style={{fontSize:14,fontWeight:600,color:C.text}}>{s.tipo}</div>
                <div style={{fontSize:12,color:C.textMuted}}>{s.hora}</div>
              </div>
              {s.genreIds?.length>0 && (
                <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:6}}>
                  {s.genreIds.map(gid=>{
                    const g=genres.find(x=>x.id===gid);
                    return g?<Badge key={gid} label={g.name} color={g.color} bg={g.color+'18'}/>:null;
                  })}
                </div>
              )}
              {s.moveIds?.length>0 && (
                <div style={{fontSize:12,color:C.textSub,marginBottom:4}}>
                  {s.moveIds.length} movimiento{s.moveIds.length!==1?'s':''} trabajado{s.moveIds.length!==1?'s':''}
                </div>
              )}
              {s.notas && <div style={{fontSize:12,color:C.textSub,fontStyle:'italic'}}>"{s.notas}"</div>}
            </div>
          ))}

          {getDaySessions(selectedDay).length===0 && (
            <div style={{textAlign:'center',padding:'20px',color:C.textSub,fontSize:13}}>Sin sesiones este día</div>
          )}
        </div>
      )}

      {/* Modal nueva sesión */}
      {showSessionModal && (
        <Modal title="Nueva sesión" onClose={()=>setShowSessionModal(false)} wide>
          <Select label="Tipo" value={sessionForm.tipo} onChange={v=>setSessionForm({...sessionForm,tipo:v})}
            options={['Clase','Práctica privada','Social','Showcase','Otra']}/>
          <Input label="Hora" value={sessionForm.hora} onChange={v=>setSessionForm({...sessionForm,hora:v})} type="time"/>

          {/* Géneros trabajados */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:600,color:C.textSub,marginBottom:6}}>Géneros trabajados</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {genres.map(g=>{
                const sel=sessionForm.genreIds.includes(g.id);
                return (
                  <button key={g.id} onClick={()=>setSessionForm({...sessionForm,genreIds:sel?sessionForm.genreIds.filter(x=>x!==g.id):[...sessionForm.genreIds,g.id]})} style={{
                    padding:'4px 10px',borderRadius:99,border:'none',cursor:'pointer',fontSize:12,
                    background:sel?g.color:C.border, color:sel?'#fff':C.text,
                  }}>{g.icon} {g.name}</button>
                );
              })}
            </div>
          </div>

          {/* Moves aprendidos */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:600,color:C.textSub,marginBottom:6}}>Movimientos trabajados</div>
            <div style={{display:'flex',gap:4,flexWrap:'wrap',maxHeight:100,overflowY:'auto'}}>
              {moves.filter(m=>sessionForm.genreIds.length===0||sessionForm.genreIds.includes(m.genreId)).map(m=>{
                const sel=sessionForm.moveIds.includes(m.id);
                return (
                  <button key={m.id} onClick={()=>setSessionForm({...sessionForm,moveIds:sel?sessionForm.moveIds.filter(x=>x!==m.id):[...sessionForm.moveIds,m.id]})} style={{
                    padding:'3px 8px',borderRadius:99,border:'none',cursor:'pointer',fontSize:11,
                    background:sel?C.green:C.border, color:sel?'#fff':C.text,
                  }}>{m.name}</button>
                );
              })}
            </div>
          </div>

          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:600,color:C.textSub,marginBottom:4}}>Notas</div>
            <textarea value={sessionForm.notas} onChange={e=>setSessionForm({...sessionForm,notas:e.target.value})}
              placeholder="¿Cómo fue la clase?" rows={3}
              style={{width:'100%',padding:'10px 12px',borderRadius:8,fontSize:13,
                border:`1.5px solid ${C.border}`,background:C.bg,color:C.text,
                outline:'none',resize:'vertical',fontFamily:'inherit'}}/>
          </div>
          <div style={{display:'flex',gap:8}}>
            <Btn variant="ghost" onClick={()=>setShowSessionModal(false)}>Cancelar</Btn>
            <Btn onClick={saveSession} style={{flex:1}}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── SCREEN: PERFIL ───────────────────────────────────────────────────────────
const ProfileScreen = ({ profile, setProfile }) => {
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setForm(profile); }, [profile]);

  const save = () => {
    setProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const calcMes = () => {
    if (!form.ingresoAM) return null;
    const diff = new Date() - new Date(form.ingresoAM);
    const meses = Math.floor(diff / (1000*60*60*24*30.44));
    return meses;
  };

  const meses = calcMes();

  return (
    <div style={{padding:'20px 16px 100px', background:C.bg, minHeight:'100vh'}}>
      <div style={{fontSize:24,fontWeight:700,color:C.text,marginBottom:20}}>Perfil</div>

      {/* Card resumen */}
      {form.nombre && (
        <div style={{
          background:C.green,borderRadius:16,padding:20,marginBottom:20,
          display:'flex',alignItems:'center',gap:16,
        }}>
          <div style={{
            width:56,height:56,borderRadius:99,background:'rgba(255,255,255,0.2)',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,
          }}>🕺</div>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:'#fff'}}>{form.nombre}</div>
            {meses !== null && <div style={{fontSize:13,color:'rgba(255,255,255,0.8)'}}>Mes {meses} en Arthur Murray</div>}
            {form.academia && <div style={{fontSize:12,color:'rgba(255,255,255,0.6)'}}>{form.academia}</div>}
          </div>
        </div>
      )}

      {/* Formulario */}
      <div style={{background:C.surface,borderRadius:16,padding:20,border:`1px solid ${C.border}`}}>
        <Input label="Nombre" value={form.nombre||''} onChange={v=>setForm({...form,nombre:v})} placeholder="Tu nombre"/>
        <Input label="Fecha de nacimiento" value={form.nacimiento||''} onChange={v=>setForm({...form,nacimiento:v})} type="date"/>
        <Input label="Inicio en Arthur Murray" value={form.ingresoAM||''} onChange={v=>setForm({...form,ingresoAM:v})} type="date"/>
        <Input label="Profesor principal" value={form.profesor||''} onChange={v=>setForm({...form,profesor:v})} placeholder="ej. Ani"/>
        <Input label="Academia secundaria" value={form.academia||''} onChange={v=>setForm({...form,academia:v})} placeholder="ej. Timba School"/>

        <div style={{marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:600,color:C.textSub,marginBottom:4}}>Notas y objetivos</div>
          <textarea value={form.notas||''} onChange={e=>setForm({...form,notas:e.target.value})}
            placeholder="¿Qué quieres lograr? Objetivos, reflexiones..." rows={4}
            style={{width:'100%',padding:'10px 12px',borderRadius:8,fontSize:14,
              border:`1.5px solid ${C.border}`,background:C.bg,color:C.text,
              outline:'none',resize:'vertical',fontFamily:'inherit'}}/>
        </div>

        <Btn onClick={save} style={{width:'100%'}}>
          {saved ? '✓ Guardado' : 'Guardar perfil'}
        </Btn>
      </div>
    </div>
  );
};

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function Oricorio() {
  const [activeTab, setActiveTab] = useState('home');
  const [genres, setGenres] = useState(null);
  const [moves, setMoves] = useState(null);
  const [sequences, setSequences] = useState(null);
  const [sessions, setSessions] = useState(null);
  const [profile, setProfile] = useState(null);

  // Navegación interna
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedMove, setSelectedMove] = useState(null);

  // ── Carga inicial desde localStorage ──
  useEffect(() => {
    setGenres(DB.get('ov2-genres') || INITIAL_GENRES);
    setMoves(DB.get('ov2-moves') || []);
    setSequences(DB.get('ov2-sequences') || []);
    setSessions(DB.get('ov2-sessions') || []);
    setProfile(DB.get('ov2-profile') || { nombre:'', nacimiento:'', ingresoAM:'', profesor:'', academia:'', notas:'' });
  }, []);

  // ── Auto-save ──
  useEffect(() => { if(genres) DB.set('ov2-genres', genres); }, [genres]);
  useEffect(() => { if(moves) DB.set('ov2-moves', moves); }, [moves]);
  useEffect(() => { if(sequences) DB.set('ov2-sequences', sequences); }, [sequences]);
  useEffect(() => { if(sessions) DB.set('ov2-sessions', sessions); }, [sessions]);
  useEffect(() => { if(profile) DB.set('ov2-profile', profile); }, [profile]);

  // Loading state
  if (!genres || !moves || !sequences || !sessions || !profile) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:C.bg}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:40,marginBottom:8}}>💃</div>
          <div style={{fontSize:14,color:C.textSub}}>Cargando Oricorio...</div>
        </div>
      </div>
    );
  }

  // Helpers para actualizar un move específico
  const updateMove = (updatedMove) => {
    setMoves(moves.map(m => m.id === updatedMove.id ? updatedMove : m));
    setSelectedMove(updatedMove);
  };

  const handleNavigation = (tab) => {
    setActiveTab(tab);
    setSelectedGenre(null);
    setSelectedMove(null);
  };

  // ── Renderizado de pantallas ──
  const renderContent = () => {
    // Detalle de variante (dentro de move) — manejado dentro de MoveDetailScreen
    // Detalle de movimiento
    if (selectedMove) {
      return (
        <MoveDetailScreen
          move={selectedMove}
          setMove={updateMove}
          genre={genres.find(g => g.id === selectedMove.genreId)}
          genres={genres}
          onBack={() => setSelectedMove(null)}
        />
      );
    }

    // Detalle de género
    if (selectedGenre && activeTab === 'genres') {
      return (
        <GenreDetailScreen
          genre={selectedGenre}
          moves={moves}
          setMoves={setMoves}
          sequences={sequences}
          setSequences={setSequences}
          onBack={() => setSelectedGenre(null)}
          onSelectMove={setSelectedMove}
        />
      );
    }

    switch(activeTab) {
      case 'home':
        return <HomeScreen moves={moves} genres={genres}/>;
      case 'genres':
        return <GenresScreen genres={genres} setGenres={setGenres} moves={moves} onSelectGenre={(g)=>{setSelectedGenre(g);}}/>;
      case 'calendar':
        return <CalendarScreen sessions={sessions} setSessions={setSessions} genres={genres} moves={moves}/>;
      case 'sequences':
        return <SequencesScreen sequences={sequences} genres={genres} moves={moves}/>;
      case 'profile':
        return <ProfileScreen profile={profile} setProfile={setProfile}/>;
      default:
        return <HomeScreen moves={moves} genres={genres}/>;
    }
  };

  return (
    <div style={{background:C.bg, maxWidth:480, margin:'0 auto', minHeight:'100vh', position:'relative'}}>
      {renderContent()}
      <BottomNav active={activeTab} onNav={handleNavigation}/>
    </div>
  );
}
