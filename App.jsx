import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowLeft, ArrowRight, CalendarDays, Check, ChevronRight,
  CircleHelp, Clock3, Dumbbell, HeartPulse, House, LogIn, LogOut,
  Menu, MessageCircle, Plus, Search, Settings, ShieldCheck, Sparkles,
  Target, TrendingUp, UserRound, X, Youtube
} from "lucide-react";
import { auth, db, firebaseConfigured } from "./firebase";
import {
  createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword,
  signOut, updateProfile
} from "firebase/auth";
import {
  addDoc, collection, doc, getDoc, getDocs, orderBy, query, setDoc, where
} from "firebase/firestore";

const green = "#188747";
const groups = [
  { id: "pecho", name: "Pecho", description: "Pectorales y empuje", icon: "P" },
  { id: "espalda", name: "Espalda", description: "Espalda y tirón", icon: "E" },
  { id: "piernas", name: "Piernas", description: "Fuerza y estabilidad", icon: "P" },
  { id: "abdominales", name: "Abdominales", description: "Zona media y control", icon: "A" }
];
const goals = ["Ganar músculo y fuerza", "Mejorar resistencia", "Mantenerme en forma", "Comenzar desde cero"];
const experienceOptions = ["Principiante", "Intermedio", "Avanzado"];
const equipmentOptions = ["Gimnasio completo", "Mancuernas y bandas", "Peso corporal, sin equipo", "Equipamiento básico en casa"];

const sampleRoutines = {
  pecho: [
    { name: "Flexiones de brazos", equipment: "Suelo o esterilla", sets: 3, reps: "6–12", rest: 90, technique: "Coloca las manos un poco más abiertas que los hombros. Mantén el cuerpo alineado, baja controladamente y empuja sin bloquear bruscamente los codos.", video: "https://www.youtube.com/results?search_query=como+hacer+flexiones+correctamente" },
    { name: "Press de pecho", equipment: "Mancuernas y banco; alternativa: flexiones inclinadas", sets: 3, reps: "8–12", rest: 90, technique: "Mantén los pies apoyados y las muñecas alineadas. Baja las mancuernas con control y evita arquear excesivamente la espalda.", video: "https://www.youtube.com/results?search_query=tecnica+press+de+pecho+mancuernas" },
    { name: "Aperturas con mancuernas", equipment: "Mancuernas y banco; sustituible por flexiones", sets: 2, reps: "10–15", rest: 60, technique: "Usa poco peso, codos ligeramente flexionados y un recorrido cómodo. No fuerces el estiramiento del hombro.", video: "https://www.youtube.com/results?search_query=tecnica+aperturas+mancuernas" }
  ],
  espalda: [
    { name: "Remo con mancuerna", equipment: "Mancuerna y apoyo estable", sets: 3, reps: "8–12 por lado", rest: 90, technique: "Inclina el torso manteniendo la espalda neutra. Lleva el codo hacia la cadera sin girar el tronco.", video: "https://www.youtube.com/results?search_query=remo+mancuerna+tecnica+correcta" },
    { name: "Jalón al pecho", equipment: "Máquina de polea; alternativa: banda elástica", sets: 3, reps: "8–12", rest: 90, technique: "Sujeta la barra algo más abierta que los hombros. Tira hacia la parte alta del pecho sin balancearte ni tirar detrás de la nuca.", video: "https://www.youtube.com/results?search_query=jalon+al+pecho+tecnica+correcta" },
    { name: "Bird-dog", equipment: "Suelo o esterilla", sets: 2, reps: "8–10 por lado", rest: 45, technique: "A cuatro apoyos, extiende brazo y pierna contrarios. Mantén la pelvis estable y evita arquear la zona lumbar.", video: "https://www.youtube.com/results?search_query=bird+dog+ejercicio+tecnica" }
  ],
  piernas: [
    { name: "Sentadilla al peso corporal", equipment: "Peso corporal; silla opcional", sets: 3, reps: "8–15", rest: 90, technique: "Apoya todo el pie, dirige las rodillas en la línea de los dedos y baja solo hasta donde mantengas control y comodidad.", video: "https://www.youtube.com/results?search_query=sentadilla+peso+corporal+tecnica+correcta" },
    { name: "Puente de glúteos", equipment: "Suelo o esterilla", sets: 3, reps: "10–15", rest: 60, technique: "Tumbado boca arriba, apoya los pies y eleva la cadera apretando los glúteos. Evita hiperextender la espalda.", video: "https://www.youtube.com/results?search_query=puente+gluteos+tecnica+correcta" },
    { name: "Zancada asistida", equipment: "Peso corporal y apoyo estable", sets: 2, reps: "8–10 por lado", rest: 75, technique: "Da un paso cómodo, baja controladamente y utiliza un apoyo si lo necesitas para mantener el equilibrio.", video: "https://www.youtube.com/results?search_query=zancadas+tecnica+correcta" }
  ],
  abdominales: [
    { name: "Plancha", equipment: "Suelo o esterilla", sets: 3, reps: "15–30 segundos", rest: 45, technique: "Apoya antebrazos y puntas de los pies. Mantén el cuerpo alineado, respira y termina la serie antes de perder la postura.", video: "https://www.youtube.com/results?search_query=plancha+abdominal+tecnica+correcta" },
    { name: "Dead bug", equipment: "Suelo o esterilla", sets: 3, reps: "8–10 por lado", rest: 45, technique: "Boca arriba, extiende lentamente brazo y pierna contrarios. Mantén la zona lumbar controlada y respira con normalidad.", video: "https://www.youtube.com/results?search_query=dead+bug+ejercicio+tecnica" },
    { name: "Plancha lateral modificada", equipment: "Suelo o esterilla", sets: 2, reps: "15–25 segundos por lado", rest: 45, technique: "Apoya el antebrazo y las rodillas si lo necesitas. Eleva la cadera sin rotar el tronco y mantén una respiración regular.", video: "https://www.youtube.com/results?search_query=plancha+lateral+tecnica+correcta" }
  ]
};

function HeartOrbit({ size = 42 }) {
  return <svg width={size} height={size} viewBox="0 0 100 100" aria-label="Logotipo Astral Fit" role="img">
    <defs><linearGradient id="heartGreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#39C66B"/><stop offset="100%" stopColor="#08733B"/></linearGradient></defs>
    <path d="M50 83 C41 75 13 55 13 34 C13 13 39 8 50 28 C61 8 87 13 87 34 C87 55 59 75 50 83Z" fill="url(#heartGreen)"/>
    <ellipse cx="50" cy="49" rx="47" ry="17" fill="none" stroke="#20A957" strokeWidth="5" transform="rotate(-18 50 49)" strokeDasharray="272 24"/>
  </svg>;
}

function Brand({ small = false }) {
  return <div className="brand"><HeartOrbit size={small ? 34 : 44}/><span className="brand-word">ASTRAL <b>FIT</b></span></div>;
}

function Button({ children, variant = "primary", className = "", ...props }) {
  return <button className={`button ${variant} ${className}`} {...props}>{children}</button>;
}
function Field({ label, ...props }) {
  return <label className="field"><span>{label}</span><input {...props}/></label>;
}
function SelectField({ label, children, ...props }) {
  return <label className="field"><span>{label}</span><select {...props}>{children}</select></label>;
}
function Empty({ title, detail }) {
  return <div className="empty"><Activity size={25}/><strong>{title}</strong><p>{detail}</p></div>;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(firebaseConfigured);
  const [page, setPage] = useState("welcome");
  const [authMode, setAuthMode] = useState("register");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [notice, setNotice] = useState("");
  const [profile, setProfile] = useState({ age: "", weight: "", height: "", goal: goals[0], experience: experienceOptions[0], equipment: equipmentOptions[0], place: "Gimnasio" });
  const [selectedGroup, setSelectedGroup] = useState("pecho");
  const [lastDate, setLastDate] = useState("");
  const [lastNotes, setLastNotes] = useState("");
  const [routine, setRoutine] = useState([]);
  const [routineLoading, setRoutineLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [logForm, setLogForm] = useState({ exercise: "", weight: "", sets: "3", reps: "10", notes: "" });
  const [activeNav, setActiveNav] = useState("inicio");
  const [showProfile, setShowProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!firebaseConfigured) { setAuthLoading(false); return; }
    return onAuthStateChanged(auth, async current => {
      setUser(current);
      setAuthLoading(false);
      if (current) {
        await loadUserData(current);
        setPage("app");
      } else {
        setPage("welcome");
      }
    });
  }, []);

  async function loadUserData(current) {
    if (!db || !current) return;
    try {
      const snap = await getDoc(doc(db, "users", current.uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfile(p => ({ ...p, ...(data.profile || {}) }));
      }
      const q = query(collection(db, "workouts"), where("uid", "==", current.uid));
      const all = await getDocs(q);
      setLogs(all.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0)));
    } catch (e) {
      setNotice("No se pudieron cargar los datos. Revisa las reglas de acceso de Firebase.");
    }
  }

  async function submitAuth(e) {
    e.preventDefault(); setAuthError("");
    if (!firebaseConfigured) {
      setAuthError("Primero conecta Firebase. Consulta README.md para configurarlo.");
      return;
    }
    try {
      let credential;
      if (authMode === "register") {
        credential = await createUserWithEmailAndPassword(auth, authForm.email.trim(), authForm.password);
        if (authForm.name.trim()) await updateProfile(credential.user, { displayName: authForm.name.trim() });
        await setDoc(doc(db, "users", credential.user.uid), { displayName: authForm.name.trim(), createdAt: Date.now(), profile });
      } else {
        credential = await signInWithEmailAndPassword(auth, authForm.email.trim(), authForm.password);
      }
      setUser(credential.user);
      setPage("profile");
    } catch (err) {
      setAuthError(authMessage(err.code));
    }
  }

  function authMessage(code) {
    const messages = {
      "auth/email-already-in-use": "Este correo ya tiene una cuenta.",
      "auth/invalid-email": "El correo no parece válido.",
      "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
      "auth/invalid-credential": "Correo o contraseña incorrectos.",
      "auth/too-many-requests": "Demasiados intentos. Espera un momento y prueba de nuevo."
    };
    return messages[code] || "No se pudo completar el acceso. Revisa los datos e inténtalo de nuevo.";
  }

  async function saveProfile(e) {
    e.preventDefault();
    if (!profile.age || Number(profile.age) < 13 || Number(profile.age) > 100) {
      setNotice("Introduce una edad válida entre 13 y 100 años."); return;
    }
    if (!profile.weight || Number(profile.weight) <= 0 || !profile.height || Number(profile.height) <= 0) {
      setNotice("Introduce un peso y una estatura válidos."); return;
    }
    if (user && db) {
      setProfileLoading(true);
      try {
        await setDoc(doc(db, "users", user.uid), { displayName: user.displayName || "", profile, updatedAt: Date.now() }, { merge: true });
      } catch {
        setNotice("No se pudo guardar el perfil. Comprueba Firebase.");
        setProfileLoading(false); return;
      }
      setProfileLoading(false);
    } else {
      setNotice("Modo de demostración: el perfil no se sincronizará hasta conectar Firebase.");
    }
    setPage("app"); setActiveNav("inicio"); setShowProfile(false);
  }

  async function makeRoutine() {
    setRoutineLoading(true); setNotice("");
    const endpoint = import.meta.env.VITE_AI_ENDPOINT;
    if (endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(user ? { "Authorization": `Bearer ${await user.getIdToken()}` } : {}) },
          body: JSON.stringify({ action: "routine", group: selectedGroup, profile, lastDate, lastNotes })
        });
        if (!response.ok) throw new Error("La IA no pudo generar la rutina.");
        const data = await response.json();
        if (!Array.isArray(data.exercises) || !data.exercises.length) throw new Error("La respuesta de la IA no tiene el formato esperado.");
        setRoutine(data.exercises);
      } catch (e) {
        setNotice(`${e.message || "Error al contactar con la IA"} Se muestra una rutina de ejemplo.`);
        setRoutine(sampleRoutines[selectedGroup]);
      }
    } else {
      setRoutine(sampleRoutines[selectedGroup]);
      setNotice("Rutina de demostración cargada. Conecta el backend de IA para generar rutinas individualizadas.");
    }
    setRoutineLoading(false);
    setActiveNav("rutina");
    setPage("app");
  }

  async function sendChat(e) {
    e.preventDefault();
    const message = chatInput.trim();
    if (!message || chatLoading) return;
    setChat(prev => [...prev, { role: "user", text: message }]);
    setChatInput(""); setChatLoading(true);
    const endpoint = import.meta.env.VITE_AI_ENDPOINT;
    if (endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(user ? { "Authorization": `Bearer ${await user.getIdToken()}` } : {}) },
          body: JSON.stringify({ action: "chat", message, profile, group: selectedGroup })
        });
        if (!response.ok) throw new Error("No se recibió respuesta de la IA.");
        const data = await response.json();
        setChat(prev => [...prev, { role: "assistant", text: data.reply || "No tengo una respuesta ahora. Inténtalo de nuevo." }]);
      } catch {
        setChat(prev => [...prev, { role: "assistant", text: "No se pudo conectar con el asistente. Comprueba la configuración del backend de IA." }]);
      }
    } else {
      setChat(prev => [...prev, { role: "assistant", text: "El asistente de IA aún no está conectado. Cuando configures el backend de Gemini, podré responder preguntas sobre técnica, alternativas de ejercicios y planificación. Si tienes dolor o síntomas preocupantes, detén el ejercicio y consulta a un profesional sanitario." }]);
    }
    setChatLoading(false);
  }

  async function saveWorkoutLog(e) {
    e.preventDefault();
    if (!logForm.exercise.trim()) { setNotice("Escribe el nombre del ejercicio."); return; }
    const entry = { uid: user?.uid || "demo", group: selectedGroup, exercise: logForm.exercise.trim(), weight: Number(logForm.weight || 0), sets: Number(logForm.sets || 0), reps: logForm.reps, notes: logForm.notes.trim(), createdAt: Date.now(), date: new Date().toISOString().slice(0,10) };
    try {
      if (user && db) {
        const ref = await addDoc(collection(db, "workouts"), entry);
        setLogs(prev => [{ id: ref.id, ...entry }, ...prev]);
      } else {
        setLogs(prev => [{ id: String(Date.now()), ...entry }, ...prev]);
        setNotice("Registro guardado solo en esta sesión de demostración. Conecta Firebase para conservarlo.");
      }
      setLogForm({ exercise: "", weight: "", sets: "3", reps: "10", notes: "" });
    } catch {
      setNotice("No se pudo guardar el entrenamiento. Comprueba la conexión.");
    }
  }

  async function saveProfileChanges(e) {
    await saveProfile(e);
  }

  const sessionsCount = useMemo(() => new Set(logs.map(l => l.date)).size, [logs]);
  const recentLog = logs[0];
  const navItems = [
    { id: "inicio", label: "Inicio", icon: House },
    { id: "rutina", label: "Rutina", icon: Dumbbell },
    { id: "progreso", label: "Progreso", icon: TrendingUp },
    { id: "asistente", label: "Asistente", icon: MessageCircle }
  ];

  if (authLoading) return <div className="loading-screen"><Brand/><p>Preparando tu espacio personal...</p></div>;

  if (page === "welcome") return <main className="welcome-page">
    <div className="welcome-brand"><Brand/><span className="eyebrow">ENTRENAMIENTO PERSONAL INTELIGENTE</span></div>
    <div className="welcome-copy">
      <p className="eyebrow">TU PROGRESO COMIENZA AQUÍ</p>
      <h1>¿Listo para el<br/><span>entrenamiento</span> de hoy?</h1>
      <p className="muted welcome-description">Rutinas adaptadas a tus objetivos, seguimiento de tu progreso y ayuda cuando la necesites.</p>
      <Button onClick={() => { setAuthMode("register"); setPage("auth"); }}>Comenzar <ArrowRight size={18}/></Button>
      <button className="text-button" onClick={() => { setAuthMode("login"); setPage("auth"); }}>Ya tengo una cuenta</button>
    </div>
    <div className="welcome-bottom"><ShieldCheck size={16}/> Entrena a tu ritmo. Progresa con criterio.</div>
  </main>;

  if (page === "auth") return <main className="auth-page">
    <button className="back-button" onClick={() => setPage("welcome")}><ArrowLeft size={18}/> Volver</button>
    <div className="auth-card">
      <Brand/>
      <h1>{authMode === "register" ? "Crea tu cuenta" : "Bienvenido de nuevo"}</h1>
      <p className="muted">{authMode === "register" ? "Guarda tus rutinas y sigue tu progreso." : "Inicia sesión para continuar con tu entrenamiento."}</p>
      {!firebaseConfigured && <div className="notice warning">Modo de demostración. Para crear cuentas reales, configura Firebase siguiendo README.md.</div>}
      <form onSubmit={submitAuth} className="stack-form">
        {authMode === "register" && <Field label="Nombre" autoComplete="name" value={authForm.name} onChange={e => setAuthForm({...authForm, name:e.target.value})} placeholder="Cómo te llamas"/>}
        <Field label="Correo electrónico" type="email" autoComplete="email" required value={authForm.email} onChange={e => setAuthForm({...authForm, email:e.target.value})} placeholder="tu@correo.com"/>
        <Field label="Contraseña" type="password" autoComplete={authMode === "register" ? "new-password" : "current-password"} minLength="6" required value={authForm.password} onChange={e => setAuthForm({...authForm, password:e.target.value})} placeholder="Mínimo 6 caracteres"/>
        {authError && <p className="error-text">{authError}</p>}
        <Button type="submit">{authMode === "register" ? "Crear cuenta" : "Iniciar sesión"} <ArrowRight size={18}/></Button>
      </form>
      <p className="switch-auth">{authMode === "register" ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?"} <button className="inline-link" onClick={() => { setAuthMode(authMode === "register" ? "login" : "register"); setAuthError(""); }}>{authMode === "register" ? "Inicia sesión" : "Regístrate"}</button></p>
    </div>
  </main>;

  if (page === "profile" || showProfile) return <main className="profile-page">
    <button className="back-button" onClick={() => { if (showProfile) setShowProfile(false); else setPage("app"); }}><ArrowLeft size={18}/> Volver</button>
    <div className="profile-card">
      <Brand/>
      <p className="eyebrow">CONFIGURA TU EXPERIENCIA</p>
      <h1>Cuéntanos sobre ti</h1>
      <p className="muted">Usaremos estos datos para orientar las recomendaciones. Puedes cambiarlos después.</p>
      <form className="stack-form" onSubmit={saveProfileChanges}>
        <div className="form-grid">
          <Field label="Edad (obligatoria)" type="number" min="13" max="100" required value={profile.age} onChange={e => setProfile({...profile, age:e.target.value})} placeholder="Años"/>
          <Field label="Peso (kg)" type="number" min="1" max="500" step="0.1" required value={profile.weight} onChange={e => setProfile({...profile, weight:e.target.value})} placeholder="Ej. 65"/>
          <Field label="Estatura (cm)" type="number" min="50" max="260" required value={profile.height} onChange={e => setProfile({...profile, height:e.target.value})} placeholder="Ej. 170"/>
          <SelectField label="Experiencia" value={profile.experience} onChange={e => setProfile({...profile, experience:e.target.value})}>{experienceOptions.map(x => <option key={x}>{x}</option>)}</SelectField>
        </div>
        <SelectField label="Tu objetivo" value={profile.goal} onChange={e => setProfile({...profile, goal:e.target.value})}>{goals.map(x => <option key={x}>{x}</option>)}</SelectField>
        <SelectField label="Material disponible" value={profile.equipment} onChange={e => setProfile({...profile, equipment:e.target.value})}>{equipmentOptions.map(x => <option key={x}>{x}</option>)}</SelectField>
        <SelectField label="Dónde entrenas" value={profile.place} onChange={e => setProfile({...profile, place:e.target.value})}><option>Gimnasio</option><option>Casa</option><option>Exterior</option></SelectField>
        <Button type="submit" disabled={profileLoading}>{profileLoading ? "Guardando..." : "Guardar y continuar"} <ArrowRight size={18}/></Button>
      </form>
    </div>
  </main>;

  function setNav(id) { setActiveNav(id); setNotice(""); }
  return <div className="app-shell">
    <aside className="sidebar">
      <Brand/>
      <div className="sidebar-label">MENÚ</div>
      <nav className="side-nav">{navItems.map(item => <button key={item.id} className={activeNav===item.id ? "nav-item active" : "nav-item"} onClick={() => setNav(item.id)}><item.icon size={19}/>{item.label}</button>)}</nav>
      <div className="sidebar-spacer"/>
      <button className="nav-item" onClick={() => setShowProfile(true)}><Settings size={19}/> Mi perfil</button>
      {user && <button className="nav-item" onClick={() => signOut(auth)}><LogOut size={19}/> Cerrar sesión</button>}
      <div className="sidebar-user"><div className="avatar"><UserRound size={18}/></div><div><strong>{user?.displayName || "Mi espacio"}</strong><span>{user?.email || "Modo demostración"}</span></div></div>
    </aside>

    <main className="main-content">
      <header className="topbar">
        <div className="mobile-brand"><Brand small/></div>
        <span className="topbar-greeting">{user?.displayName ? `Hola, ${user.displayName}` : "Tu espacio de entrenamiento"}</span>
        <button className="icon-button" aria-label="Editar perfil" onClick={() => setShowProfile(true)}><UserRound size={19}/></button>
      </header>
      {notice && <div className="notice"><span>{notice}</span><button aria-label="Cerrar aviso" onClick={() => setNotice("")}><X size={16}/></button></div>}

      {activeNav === "inicio" && <section className="content-section">
        <div className="welcome-heading"><p className="eyebrow">TU PROGRESO COMIENZA AQUÍ</p><h1>¿Entrenamos hoy?</h1><p className="muted">Una sesión cada vez. A tu ritmo.</p></div>
        <div className="hero-card">
          <div className="hero-copy"><span className="hero-kicker"><Sparkles size={15}/> TU PRÓXIMA SESIÓN</span><h2>Un entrenamiento<br/>hecho para ti.</h2><p>Adaptado a tus objetivos, tu experiencia y tu historial.</p><Button onClick={() => { setNav("rutina"); setRoutine([]); }}>Comenzar entrenamiento <ArrowRight size={18}/></Button></div>
          <div className="hero-mark"><HeartOrbit size={160}/></div>
        </div>
        <div className="section-heading"><div><h2>Tu actividad</h2><p className="muted">Resumen de tus entrenamientos</p></div><button className="inline-link" onClick={() => setNav("progreso")}>Ver progreso <ChevronRight size={16}/></button></div>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon"><CalendarDays size={19}/></div><span>Sesiones registradas</span><strong>{sessionsCount}</strong><small>Días con actividad registrada</small></div>
          <div className="stat-card"><div className="stat-icon"><Dumbbell size={19}/></div><span>Registros de ejercicios</span><strong>{logs.length}</strong><small>Ejercicios guardados</small></div>
          <div className="stat-card"><div className="stat-icon"><Target size={19}/></div><span>Tu objetivo</span><strong className="stat-goal">{profile.goal || "Por configurar"}</strong><small>{profile.experience || "Experiencia pendiente"}</small></div>
        </div>
        <div className="section-heading"><div><h2>Última actividad</h2><p className="muted">Tu registro más reciente</p></div></div>
        {recentLog ? <div className="recent-card"><div className="recent-icon"><Dumbbell size={20}/></div><div className="recent-info"><strong>{recentLog.exercise}</strong><span>{recentLog.group} · {recentLog.date}</span></div><div className="recent-result">{recentLog.sets} series · {recentLog.reps} reps</div></div> : <Empty title="Todavía no hay registros" detail="Cuando guardes tu primer ejercicio, aparecerá aquí."/>}
      </section>}

      {activeNav === "rutina" && <section className="content-section">
        <div className="welcome-heading"><p className="eyebrow">PLAN PERSONALIZADO</p><h1>¿Qué haremos hoy?</h1><p className="muted">Elige un grupo muscular para preparar tu sesión.</p></div>
        <div className="group-grid">{groups.map(g => <button key={g.id} className={`group-card ${selectedGroup===g.id ? "selected" : ""}`} onClick={() => { setSelectedGroup(g.id); setRoutine([]); }}><span className="group-symbol">{g.icon}</span><span className="group-title">{g.name}</span><span className="group-description">{g.description}</span><span className="group-select">{selectedGroup===g.id ? <Check size={17}/> : <ChevronRight size={17}/>}</span></button>)}</div>
        <div className="panel">
          <div className="panel-title"><div><h2>Tu último entrenamiento</h2><p className="muted">Nos ayuda a adaptar la sesión.</p></div><CalendarDays size={21}/></div>
          <div className="form-grid">
            <Field label="Fecha de la última sesión" type="date" value={lastDate} onChange={e => setLastDate(e.target.value)}/>
            <Field label="Qué hiciste y qué peso usaste" value={lastNotes} onChange={e => setLastNotes(e.target.value)} placeholder="Ej. press, 10 kg, 3 × 10"/>
          </div>
          <p className="helper-text">Si es tu primera vez, puedes dejar estos campos vacíos.</p>
          <Button onClick={makeRoutine} disabled={routineLoading}>{routineLoading ? "Preparando rutina..." : "Generar mi rutina"} <ArrowRight size={18}/></Button>
        </div>
        {routine.length > 0 && <div className="routine-results"><div className="section-heading"><div><p className="eyebrow">TU SESIÓN</p><h2>Rutina de {selectedGroup}</h2><p className="muted">Ajusta las cargas a tu nivel y prioriza la técnica.</p></div><Button variant="secondary" onClick={() => { setLogForm({...logForm, exercise:routine[0]?.name || ""}); document.getElementById("manual-log")?.scrollIntoView({behavior:"smooth"}); }}>Registrar sesión</Button></div>
          {routine.map((ex,i) => <article className="exercise-card" key={`${ex.name}-${i}`}><div className="exercise-number">{String(i+1).padStart(2,"0")}</div><div className="exercise-body"><div className="exercise-top"><h3>{ex.name}</h3><span className="exercise-badge">{ex.sets} series · {ex.reps}</span></div><p>{ex.technique}</p><div className="exercise-meta"><span><Dumbbell size={15}/>{ex.equipment}</span><span><Clock3 size={15}/>{ex.rest} s de descanso</span></div><a className="video-link" href={ex.video} target="_blank" rel="noreferrer"><Youtube size={17}/> Ver tutorial en YouTube <ArrowRight size={14}/></a><button className="inline-link exercise-log-link" onClick={() => {setLogForm({...logForm, exercise:ex.name, sets:String(ex.sets), reps:String(ex.reps)}); document.getElementById("manual-log")?.scrollIntoView({behavior:"smooth"});}}>Registrar este ejercicio <ChevronRight size={15}/></button></div></article>)}
          <form id="manual-log" className="panel stack-form" onSubmit={saveWorkoutLog}><div className="panel-title"><div><h2>Registrar ejercicio</h2><p className="muted">Introduce lo que realmente has hecho.</p></div><Plus size={20}/></div><Field label="Ejercicio" required value={logForm.exercise} onChange={e => setLogForm({...logForm, exercise:e.target.value})} placeholder="Nombre del ejercicio"/><div className="form-grid"><Field label="Peso utilizado (kg)" type="number" min="0" step="0.25" value={logForm.weight} onChange={e => setLogForm({...logForm, weight:e.target.value})} placeholder="0 si no aplica"/><Field label="Series" type="number" min="1" max="30" value={logForm.sets} onChange={e => setLogForm({...logForm, sets:e.target.value})}/><Field label="Repeticiones o duración" value={logForm.reps} onChange={e => setLogForm({...logForm, reps:e.target.value})}/></div><Field label="Notas (opcional)" value={logForm.notes} onChange={e => setLogForm({...logForm, notes:e.target.value})} placeholder="Cómo te sentiste, dificultad..."/><Button type="submit">Guardar registro <Check size={17}/></Button></form>
        </div>}
      </section>}

      {activeNav === "progreso" && <section className="content-section">
        <div className="welcome-heading"><p className="eyebrow">CONSTANCIA SOBRE PERFECCIÓN</p><h1>Tu progreso</h1><p className="muted">Consulta tus sesiones y los ejercicios que has registrado.</p></div>
        <div className="stats-grid two-stats"><div className="stat-card"><div className="stat-icon"><CalendarDays size={19}/></div><span>Sesiones registradas</span><strong>{sessionsCount}</strong></div><div className="stat-card"><div className="stat-icon"><Activity size={19}/></div><span>Ejercicios registrados</span><strong>{logs.length}</strong></div></div>
        <div className="section-heading"><div><h2>Historial</h2><p className="muted">Ordenado desde el registro más reciente</p></div></div>
        {logs.length ? <div className="history-list">{logs.map(log => <article className="history-item" key={log.id}><div className="history-icon"><Dumbbell size={19}/></div><div className="history-main"><strong>{log.exercise}</strong><span>{log.group} · {log.date}</span>{log.notes && <p>{log.notes}</p>}</div><div className="history-values"><strong>{log.sets} × {log.reps}</strong><span>{log.weight ? `${log.weight} kg` : "Peso corporal"}</span></div></article>)}</div> : <Empty title="Tu progreso aparecerá aquí" detail="Registra ejercicios después de entrenar para empezar a construir tu historial."/>}
      </section>}

      {activeNav === "asistente" && <section className="content-section assistant-section">
        <div className="welcome-heading"><p className="eyebrow">ASISTENCIA PERSONAL</p><h1>¿En qué te ayudo?</h1><p className="muted">Pregunta sobre técnica, ejercicios, descanso o alternativas.</p></div>
        <div className="chat-card">
          <div className="chat-header"><div className="assistant-avatar"><HeartOrbit size={32}/></div><div><strong>Asistente Astral</strong><span><span className="status-dot"/> Orientación de entrenamiento</span></div></div>
          <div className="chat-messages">
            {chat.length === 0 && <div className="chat-empty"><CircleHelp size={26}/><strong>Empieza con una pregunta</strong><p>Por ejemplo: ¿cómo puedo sustituir las mancuernas en una rutina de pecho?</p><div className="suggestion-chips">{["Técnica de un ejercicio","Alternativas sin material","Cómo organizar el descanso"].map(q => <button key={q} onClick={() => setChatInput(q)}>{q}</button>)}</div></div>}
            {chat.map((m,i) => <div className={`chat-bubble ${m.role}`} key={i}><span>{m.role === "assistant" ? "Astral Fit" : "Tú"}</span><p>{m.text}</p></div>)}
            {chatLoading && <div className="chat-bubble assistant"><span>Astral Fit</span><p>Preparando respuesta...</p></div>}
          </div>
          <form className="chat-input-row" onSubmit={sendChat}><input aria-label="Escribe tu pregunta" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Escribe tu pregunta..." disabled={chatLoading}/><button className="send-button" type="submit" aria-label="Enviar pregunta" disabled={chatLoading || !chatInput.trim()}><ArrowRight size={19}/></button></form>
          <p className="chat-disclaimer">La IA ofrece información general y no sustituye a un profesional sanitario. Detén el ejercicio si sientes dolor.</p>
        </div>
      </section>}

      <footer className="app-footer"><span>ASTRAL FIT</span><span>Tu cuerpo. Tu progreso. Tu universo.</span></footer>
    </main>

    <nav className="mobile-nav">{navItems.map(item => <button key={item.id} className={activeNav===item.id ? "mobile-nav-item active" : "mobile-nav-item"} onClick={() => setNav(item.id)}><item.icon size={20}/><span>{item.label}</span></button>)}</nav>
  </div>;
}