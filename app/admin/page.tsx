'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { Toaster, toast } from 'sonner'
import { 
  Search, Users, FileText, Download, Calendar, Eye, 
  LayoutDashboard, Building, Inbox, User, Mail, Phone, 
  ChevronDown, Sparkles, Link as LinkIcon, ExternalLink, X, MapPin, Briefcase, GraduationCap, FileBadge, Filter, Save, Lock, Loader2
} from 'lucide-react'

// --- LIBRERÍAS PARA EL PDF ---
import { Document, Page, Text, View, StyleSheet, Image as PdfImage, pdf } from '@react-pdf/renderer'

// --- INTERFAZ DE DATOS ---
interface Postulante {
  id: string
  dni: string
  nombres: string
  apellidos: string
  correo: string
  telefono: string
  direccion: string
  foto_url: string
  perfil_profesional: string
  estado: string
  notas_internas?: string
  created_at: string
  experiencias?: any[]
  educacion?: any[]
  certificados?: any[]
}

// --- ESTILOS DEL PDF ---
const pdfStyles = StyleSheet.create({
  page: { flexDirection: 'row', backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  leftColumn: { width: '35%', backgroundColor: '#0f172a', padding: 30, color: '#f8fafc' },
  photoContainer: { alignItems: 'center', marginBottom: 20 },
  photo: { width: 110, height: 110, borderRadius: 55, objectFit: 'cover', border: '3px solid #334155' },
  nameLeft: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginTop: 10, color: '#ffffff', textTransform: 'uppercase' },
  roleLeft: { fontSize: 10, textAlign: 'center', color: '#94a3b8', marginTop: 4, letterSpacing: 1 },
  sectionLeft: { marginTop: 30 },
  titleLeft: { fontSize: 12, fontWeight: 'bold', color: '#38bdf8', borderBottom: '1px solid #334155', paddingBottom: 5, marginBottom: 10, letterSpacing: 1 },
  textLeft: { fontSize: 10, color: '#cbd5e1', marginBottom: 8, lineHeight: 1.4 },
  rightColumn: { width: '65%', padding: 40, paddingTop: 45 },
  sectionRight: { marginBottom: 25 },
  titleRight: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: 5, marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  textBodyRight: { fontSize: 10, color: '#475569', lineHeight: 1.6, textAlign: 'justify' },
  itemBlock: { marginBottom: 15 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 },
  itemTitle: { fontSize: 12, fontWeight: 'bold', color: '#1e293b', width: '70%' },
  itemDate: { fontSize: 9, color: '#2563eb', fontWeight: 'bold', width: '30%', textAlign: 'right' },
  itemSubtitle: { fontSize: 10, color: '#64748b', marginBottom: 5, fontStyle: 'italic' },
})

const CVPdfDocument = ({ data }: { data: Postulante }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.leftColumn}>
        <View style={pdfStyles.photoContainer}>
          {data.foto_url ? <PdfImage src={data.foto_url} style={pdfStyles.photo} /> : null}
          <Text style={pdfStyles.nameLeft}>{data.nombres}</Text>
          <Text style={pdfStyles.nameLeft}>{data.apellidos}</Text>
          <Text style={pdfStyles.roleLeft}>DNI: {data.dni}</Text>
        </View>
        <View style={pdfStyles.sectionLeft}>
          <Text style={pdfStyles.titleLeft}>CONTACTO</Text>
          <Text style={pdfStyles.textLeft}>📞 {data.telefono || 'No registrado'}</Text>
          <Text style={pdfStyles.textLeft}>✉️ {data.correo || 'No registrado'}</Text>
          <Text style={pdfStyles.textLeft}>📍 {data.direccion || 'No registrado'}</Text>
        </View>
        <View style={pdfStyles.sectionLeft}>
          <Text style={pdfStyles.titleLeft}>PERFIL PROFESIONAL</Text>
          <Text style={pdfStyles.textLeft}>{data.perfil_profesional || 'Sin descripción registrada.'}</Text>
        </View>
      </View>
      <View style={pdfStyles.rightColumn}>
        <View style={pdfStyles.sectionRight}>
          <Text style={pdfStyles.titleRight}>Experiencia Laboral</Text>
          {data.experiencias && data.experiencias.length > 0 ? (
            data.experiencias.map((exp: any, i: number) => (
              <View key={i} style={pdfStyles.itemBlock}>
                <View style={pdfStyles.itemHeader}>
                  <Text style={pdfStyles.itemTitle}>{exp.cargo}</Text>
                  <Text style={pdfStyles.itemDate}>{exp.fecha_inicio} - {exp.fecha_fin || 'Actual'}</Text>
                </View>
                <Text style={pdfStyles.itemSubtitle}>{exp.empresa}</Text>
                <Text style={pdfStyles.textBodyRight}>{exp.descripcion}</Text>
              </View>
            ))
          ) : <Text style={pdfStyles.textBodyRight}>No registra experiencia laboral.</Text>}
        </View>
        <View style={pdfStyles.sectionRight}>
          <Text style={pdfStyles.titleRight}>Educación y Formación</Text>
          {data.educacion && data.educacion.length > 0 ? (
            data.educacion.map((edu: any, i: number) => (
              <View key={i} style={pdfStyles.itemBlock}>
                <View style={pdfStyles.itemHeader}>
                  <Text style={pdfStyles.itemTitle}>{edu.titulo}</Text>
                  <Text style={pdfStyles.itemDate}>{edu.anio_inicio} - {edu.anio_fin}</Text>
                </View>
                <Text style={pdfStyles.itemSubtitle}>{edu.institucion} ({edu.nivel})</Text>
              </View>
            ))
          ) : <Text style={pdfStyles.textBodyRight}>No registra educación previa.</Text>}
        </View>
      </View>
    </Page>
  </Document>
)

const containerVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } } }
const itemVariants: Variants = { hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } }

const SplashLoader = () => (
  <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: "easeInOut" }} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
    <style>{`.svg-text-draw { fill: transparent; stroke-width: 2px; stroke-linejoin: round; stroke-dasharray: 400; stroke-dashoffset: 400; animation: drawText 2s ease-in-out forwards, fillText 0.8s 1.5s forwards; } @keyframes drawText { 100% { stroke-dashoffset: 0; } } @keyframes fillText { 100% { fill: #0f172a; stroke: transparent; } }`}</style>
    <div className="relative flex items-center justify-center mb-4">
      <svg width="350" height="120" viewBox="0 0 350 120">
        <defs><linearGradient id="ruag-gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#2563eb" /><stop offset="50%" stopColor="#4f46e5" /><stop offset="100%" stopColor="#0ea5e9" /></linearGradient></defs>
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="svg-text-draw" stroke="url(#ruag-gradient)" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="56" letterSpacing="2">RUAG CV</text>
      </svg>
    </div>
    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }} className="text-slate-400 text-sm font-medium tracking-tight animate-pulse">Iniciando entorno seguro...</motion.p>
  </motion.div>
)

const StatCard = ({ icon: Icon, label, value, iconColor }: any) => (
  <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between group cursor-default transition-all duration-300 hover:shadow-md hover:border-blue-100">
    <div className="flex items-center justify-between mb-8">
      <p className="text-slate-500 text-sm font-semibold tracking-tight uppercase">{label}</p>
      <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 transition-colors group-hover:bg-blue-50 group-hover:border-blue-100`}><Icon size={24} className={iconColor} /></div>
    </div>
    <h3 className="text-6xl font-extrabold text-slate-950 leading-none tracking-tighter">{value}</h3>
  </div>
)

const EstadoDropdown = ({ postulanteId, estadoActual, supabase }: { postulanteId: string, estadoActual: string, supabase: any }) => {
  const [estado, setEstado] = useState(estadoActual || 'Nuevo')
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const opciones = ['Nuevo', 'En Proceso', 'Contratado', 'Descartado']

  const theme: Record<string, string> = {
    'Nuevo': 'border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100',
    'En Proceso': 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100',
    'Contratado': 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100',
    'Descartado': 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100'
  }

  const dotTheme: Record<string, string> = {
    'Nuevo': 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]',
    'En Proceso': 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
    'Contratado': 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
    'Descartado': 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
  }

  const handleChange = async (nuevoEstado: string) => {
    setIsOpen(false)
    if (nuevoEstado === estado) return
    setEstado(nuevoEstado)
    setIsUpdating(true)
    try {
      await supabase.from('cv_postulantes').update({ estado: nuevoEstado }).eq('id', postulanteId)
      toast.success(`Estado actualizado a ${nuevoEstado}`)
    } catch (error) {
      toast.error('Error al actualizar el estado')
      setEstado(estadoActual)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="relative inline-block w-[140px]">
      <button onClick={() => setIsOpen(!isOpen)} disabled={isUpdating} className={`flex items-center justify-between w-full px-3 py-2 rounded-xl border text-[11px] font-extrabold uppercase tracking-wider transition-all duration-300 ${theme[estado]} ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${dotTheme[estado]}`}></div>{estado}</div>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute left-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
              {opciones.map((opt) => (
                <button key={opt} onClick={() => handleChange(opt)} className={`w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors text-left ${estado === opt ? 'bg-gray-50 text-slate-900' : 'text-slate-500 hover:bg-gray-50 hover:text-slate-800'}`}>
                  <div className={`w-2 h-2 rounded-full ${dotTheme[opt]}`}></div>{opt}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AdminDashboard() {
  const supabase = createClient()
  
  // --- ESTADOS DE SEGURIDAD (LOGIN) ---
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [passInput, setPassInput] = useState('')
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  // --- ESTADOS DEL DASHBOARD ---
  const [loading, setLoading] = useState(true)
  const [postulantes, setPostulantes] = useState<Postulante[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [activeView, setActiveView] = useState<'dashboard' | 'talentos'>('dashboard')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [previewData, setPreviewData] = useState<Postulante | null>(null)
  const [notaLocal, setNotaLocal] = useState('')
  const [guardandoNota, setGuardandoNota] = useState(false)

  // VERIFICAR SESIÓN AL INICIAR
  useEffect(() => {
    const isAuthed = sessionStorage.getItem('ruag_admin_auth')
    if (isAuthed === 'true') {
      setIsAuthenticated(true)
    }
    setAuthChecking(false)
  }, [])

  // CARGAR DATOS SOLO SI ESTÁ AUTENTICADO
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchData()
    const channel = supabase
      .channel('cv_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cv_postulantes' }, () => {
        fetchData()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [isAuthenticated])

  // FUNCIÓN PARA LOGIN
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthenticating(true)
    
    // Simulamos un pequeño tiempo de carga para el efecto moderno
    setTimeout(() => {
      if (passInput === 'RUAG2026') { // Contraseña maestra
        sessionStorage.setItem('ruag_admin_auth', 'true')
        setIsAuthenticated(true)
        toast.success('Acceso autorizado. Bienvenido.')
      } else {
        toast.error('Contraseña incorrecta. Acceso denegado.')
        setPassInput('')
      }
      setIsAuthenticating(false)
    }, 1500)
  }

  const fetchData = async () => {
    const startTime = Date.now()
    const { data, error } = await supabase.from('cv_postulantes').select('*').order('created_at', { ascending: false })
    if (!error && data) setPostulantes(data)
    const elapsedTime = Date.now() - startTime
    setTimeout(() => setLoading(false), Math.max(0, 2000 - elapsedTime))
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://cv.ruag.pe') 
    toast.success('¡Enlace copiado!', { description: 'Listo para enviar por WhatsApp al equipo.' })
    setIsMenuOpen(false)
  }

  const handleDownloadPDF = async (postulante: Postulante) => {
    const toastId = toast.loading('Generando diseño del PDF...')
    try {
      const blob = await pdf(<CVPdfDocument data={postulante} />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `CV_RUAG_${postulante.apellidos}_${postulante.dni}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('PDF Premium descargado correctamente', { id: toastId })
    } catch (error) {
      toast.error('Error al generar el PDF', { id: toastId })
    }
  }

  const guardarNotaInterna = async () => {
    if (!previewData) return
    setGuardandoNota(true)
    try {
      await supabase.from('cv_postulantes').update({ notas_internas: notaLocal }).eq('id', previewData.id)
      setPreviewData({...previewData, notas_internas: notaLocal})
      toast.success('Nota interna guardada con éxito')
    } catch (error) {
      toast.error('Hubo un error al guardar la nota')
    } finally {
      setGuardandoNota(false)
    }
  }

  const abrirModal = (p: Postulante) => {
    setPreviewData(p)
    setNotaLocal(p.notas_internas || '')
  }

  const filteredData = postulantes.filter(p => {
    const matchesSearch = p.nombres.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.dni.includes(searchTerm) ||
                          (p.perfil_profesional && p.perfil_profesional.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesEstado = filtroEstado === 'Todos' || (p.estado || 'Nuevo') === filtroEstado;
    return matchesSearch && matchesEstado;
  })

  const abrirWhatsApp = (telefono: string, nombre: string) => {
    if (!telefono) { toast.error('Este candidato no registró su celular.'); return; }
    const numLimpio = telefono.replace(/\D/g, '')
    const numFinal = numLimpio.length === 9 ? `51${numLimpio}` : numLimpio
    const mensaje = `Hola ${nombre}, te escribimos de *RUAG*. Hemos revisado tu perfil en nuestro Portal de Empleo y nos gustaría conversar contigo...`
    window.open(`https://wa.me/${numFinal}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  // --- RENDER DE CARGA INICIAL ---
  if (authChecking) return <div className="h-screen bg-slate-950"></div>

  // --- PANTALLA DE LOGIN SEGURA ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <Toaster position="top-center" richColors />
        
        {/* Fondo animado estilo matrix/neón */}
        <div className="absolute w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full bottom-0 right-0 pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-800 w-full max-w-md relative z-10"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Lock size={36} />
            </div>
          </div>
          
          <h2 className="text-2xl font-black text-center text-white mb-2 tracking-tight">Acceso Restringido</h2>
          <p className="text-center text-slate-400 text-sm mb-8 font-medium">Panel exclusivo para Recursos Humanos de RUAG.</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input 
                type="password" 
                placeholder="CONTRASEÑA..." 
                value={passInput} 
                onChange={e => setPassInput(e.target.value)} 
                className="w-full text-center tracking-[0.5em] font-black text-xl px-4 py-4 bg-slate-950/50 border-2 border-slate-800 rounded-2xl text-white focus:border-blue-500 focus:bg-slate-900 transition-all outline-none placeholder:text-slate-600 placeholder:tracking-widest placeholder:text-sm placeholder:font-bold"
                autoFocus
              />
            </div>
            <button 
              type="submit" 
              disabled={isAuthenticating || passInput.length < 4} 
              className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-blue-900/50 hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAuthenticating ? <Loader2 size={24} className="animate-spin"/> : 'Desbloquear Sistema'}
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  // --- DASHBOARD PRINCIPAL (Si está autenticado) ---
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-900 overflow-hidden relative">
      <Toaster position="bottom-right" richColors />
      <AnimatePresence>{loading && <SplashLoader />}</AnimatePresence>

      {/* --- MODAL DE VISTA PREVIA --- */}
      <AnimatePresence>
        {previewData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
              
              <div className="px-8 py-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-gray-50/50 gap-4 relative z-10">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><User size={20}/></div>
                  <div><h2 className="text-lg font-bold text-slate-900">Vista Previa del Postulante</h2><p className="text-xs text-slate-500 font-mono">DNI: {previewData.dni}</p></div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto overflow-visible">
                  <EstadoDropdown postulanteId={previewData.id} estadoActual={previewData.estado} supabase={supabase} />
                  <button onClick={() => setPreviewData(null)} className="p-2 text-slate-400 hover:bg-gray-200 hover:text-slate-800 rounded-full transition-colors ml-auto"><X size={24} /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-200">
                <div className="flex flex-col sm:flex-row gap-8 items-start mb-8">
                  {previewData.foto_url ? ( <img src={previewData.foto_url} alt="Foto" className="w-32 h-32 rounded-2xl object-cover border-4 border-gray-50 shadow-md shrink-0" /> ) : ( <div className="w-32 h-32 rounded-2xl bg-gray-100 border-4 border-gray-50 flex items-center justify-center text-gray-400 shrink-0"><User size={40}/></div> )}
                  <div className="space-y-3 w-full">
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">{previewData.nombres} {previewData.apellidos}</h1>
                    <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
                      <span className="flex items-center gap-1.5"><Phone size={16} className="text-blue-500"/> {previewData.telefono || 'Sin celular'}</span>
                      <span className="flex items-center gap-1.5"><Mail size={16} className="text-blue-500"/> {previewData.correo || 'Sin correo'}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={16} className="text-blue-500"/> {previewData.direccion || 'Sin dirección'}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm text-slate-600 mt-2">
                      <p className="font-bold text-slate-800 mb-1 text-xs uppercase tracking-widest">Resumen Profesional</p>
                      {previewData.perfil_profesional || 'El candidato no escribió un resumen.'}
                    </div>
                  </div>
                </div>

                <div className="mb-8 bg-amber-50/50 border border-amber-100 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
                  <h3 className="text-sm font-bold text-amber-800 uppercase tracking-widest mb-3 flex items-center gap-2"><FileText size={16} className="text-amber-500"/> Notas Internas (Solo RRHH)</h3>
                  <textarea value={notaLocal} onChange={(e) => setNotaLocal(e.target.value)} placeholder="Escribe aquí observaciones sobre la entrevista, expectativas salariales o comentarios confidenciales..." className="w-full bg-white border border-amber-200 rounded-xl p-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-amber-400 resize-none min-h-[80px]"/>
                  <div className="flex justify-end mt-3">
                    <button onClick={guardarNotaInterna} disabled={guardandoNota || notaLocal === previewData.notas_internas} className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50">
                      <Save size={14} /> {guardandoNota ? 'Guardando...' : 'Guardar Nota'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2"><Briefcase size={18} className="text-blue-500"/> Experiencia Laboral</h3>
                    <div className="space-y-4">
                      {previewData.experiencias && previewData.experiencias.length > 0 ? previewData.experiencias.map((exp, i) => (
                        <div key={i} className="relative pl-4 border-l-2 border-blue-100"><div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[5px] top-1.5"></div><h4 className="font-bold text-slate-900 text-sm">{exp.cargo}</h4><p className="text-xs text-blue-600 font-semibold mb-1">{exp.empresa} <span className="text-slate-400 font-normal">| {exp.fecha_inicio} - {exp.fecha_fin || 'Actual'}</span></p><p className="text-xs text-slate-600 leading-relaxed">{exp.descripcion}</p></div>
                      )) : <p className="text-sm text-slate-400 italic">No registra experiencia.</p>}
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2"><GraduationCap size={18} className="text-emerald-500"/> Educación</h3>
                      <div className="space-y-4">
                        {previewData.educacion && previewData.educacion.length > 0 ? previewData.educacion.map((edu, i) => (
                          <div key={i} className="relative pl-4 border-l-2 border-emerald-100"><div className="absolute w-2 h-2 bg-emerald-500 rounded-full -left-[5px] top-1.5"></div><h4 className="font-bold text-slate-900 text-sm">{edu.titulo}</h4><p className="text-xs text-slate-500">{edu.institucion} ({edu.nivel})</p><p className="text-[10px] font-bold text-slate-400 mt-0.5">{edu.anio_inicio} - {edu.anio_fin}</p></div>
                        )) : <p className="text-sm text-slate-400 italic">No registra educación.</p>}
                      </div>
                    </div>
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2"><FileBadge size={18} className="text-purple-500"/> Documentos Adjuntos</h3>
                      <div className="flex flex-col gap-2">
                        {previewData.certificados && previewData.certificados.length > 0 ? previewData.certificados.map((cert, i) => (
                          <a key={i} href={cert.url_archivo} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-gray-50 hover:bg-purple-50 rounded-xl border border-gray-100 hover:border-purple-200 transition-colors group"><div><p className="font-bold text-sm text-slate-800 group-hover:text-purple-700">{cert.nombre}</p><p className="text-xs text-slate-500">{cert.institucion}</p></div><ExternalLink size={16} className="text-slate-400 group-hover:text-purple-500" /></a>
                        )) : <p className="text-sm text-slate-400 italic">Sin documentos adjuntos.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center gap-3">
                <button onClick={() => abrirWhatsApp(previewData.telefono, previewData.nombres)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-green-500 hover:bg-green-600 shadow-md shadow-green-200 transition-all flex items-center gap-2"><Phone size={16} className="fill-current"/> Contactar WhatsApp</button>
                <div className="flex gap-3">
                  <button onClick={() => setPreviewData(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-gray-200 transition-colors">Cerrar</button>
                  <button onClick={() => handleDownloadPDF(previewData)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all flex items-center gap-2"><Download size={16}/> Descargar PDF</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="w-20 lg:w-64 bg-white text-slate-900 flex flex-col h-full border-r border-gray-100 transition-all z-20">
        <div className="h-24 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-100"><Building size={24} className="text-blue-600" /><h1 className="hidden lg:block font-bold text-xl ml-3 tracking-tighter text-slate-950">RUAG <span className="font-light text-slate-500">CV</span></h1></div>
        <nav className="flex-1 py-8 flex flex-col gap-2 px-3">
          <button onClick={() => setActiveView('dashboard')} className={`flex items-center justify-center lg:justify-start gap-4 w-full p-4 rounded-2xl transition-all font-semibold text-sm ${activeView === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-950 hover:bg-gray-50'}`}><LayoutDashboard size={20} /><span className="hidden lg:block tracking-tight">Dashboard</span></button>
          <button onClick={() => setActiveView('talentos')} className={`flex items-center justify-center lg:justify-start gap-4 w-full p-4 rounded-2xl transition-all font-semibold text-sm ${activeView === 'talentos' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-950 hover:bg-gray-50'}`}><Users size={20} /><span className="hidden lg:block tracking-tight">Base de Talentos</span></button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100/80 px-10 flex items-center justify-between sticky top-0 z-10">
          <div><p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Gestión de Talento Humano</p><h2 className="text-3xl font-extrabold text-slate-950 tracking-tighter">{activeView === 'dashboard' ? 'Panel Principal' : 'Directorio de Talentos'}</h2></div>
          <div className="flex items-center gap-4 relative">
            <div className="relative group hidden md:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3"><Filter size={16} className="text-slate-400" /><select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer appearance-none pr-4"><option value="Todos">Todos los Estados</option><option value="Nuevo">Nuevos</option><option value="En Proceso">En Proceso</option><option value="Contratado">Contratados</option><option value="Descartado">Descartados</option></select></div>
            <div className="relative group hidden md:block w-72"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18}/><input type="text" placeholder="Buscar DNI o perfil..." className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-1 focus:ring-blue-200 focus:border-blue-300 outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-inner" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/></div>
            <div onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-3 bg-gray-50 p-1.5 px-4 rounded-full border border-gray-100 shadow-sm cursor-pointer hover:bg-gray-100 transition-colors ml-2">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs"><Lock size={12}/></div>
              <p className="text-xs font-bold text-slate-800 select-none">Admin</p>
              <motion.div animate={{ rotate: isMenuOpen ? 180 : 0 }}><ChevronDown size={14} className="text-slate-400"/></motion.div>
            </div>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute right-0 top-16 mt-2 w-56 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50 py-2">
                  <button onClick={handleCopyLink} className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors text-left"><LinkIcon size={16} /> Copiar enlace web</button>
                  <div className="h-px bg-gray-100 my-1 mx-4"></div>
                  <button onClick={() => { sessionStorage.removeItem('ruag_admin_auth'); window.location.reload(); }} className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left"><Lock size={16} /> Cerrar Sesión</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent scroll-smooth relative z-0">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-[1600px] mx-auto space-y-10 pb-20">
            <div className={`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 ${activeView === 'dashboard' ? 'grid' : 'hidden'}`}>
              <StatCard icon={FileText} label="Total CVs Recibidos" value={postulantes.length} iconColor="text-blue-600" />
              <StatCard icon={Sparkles} label="Nuevos (Esta semana)" value={postulantes.filter(p => new Date(p.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} iconColor="text-emerald-600" />
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group flex flex-col justify-between"><div><h3 className="text-slate-950 font-bold text-xl mb-1 tracking-tight">Portal de Empleo Activo</h3><p className="text-slate-500 text-sm max-w-sm">El sistema está sincronizado. Las nuevas postulaciones aparecen aquí instantáneamente.</p></div><div className="flex items-center gap-2.5 mt-6 bg-emerald-50 p-2.5 px-4 rounded-full border border-emerald-100 inline-flex self-start"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-200"></div><p className="text-xs font-semibold text-emerald-800 uppercase tracking-tight">En línea - Sincronizado</p></div></div>
            </div>

            <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50"><h3 className="font-extrabold text-slate-950 text-xl tracking-tight"><Inbox size={22} className="text-blue-600 inline mr-3 -mt-1"/>{activeView === 'dashboard' ? 'Últimos Candidatos' : 'Directorio Completo de Talentos'}</h3><div className="text-xs text-slate-500 font-mono bg-white p-2.5 px-4 rounded-xl border border-gray-100 shadow-inner">{filteredData.length} resultados filtrados</div></div>
              <div className="overflow-x-auto pb-32">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                  <thead className="bg-gray-50 border-b border-gray-100"><tr><th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Información del Candidato</th><th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Estado RRHH</th><th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Datos de Contacto</th><th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Perfil Profesional</th><th className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Acciones</th></tr></thead>
                  <tbody className="divide-y divide-gray-100/80">
                    {filteredData.length === 0 ? (
                      <tr><td colSpan={5} className="p-24 text-center text-slate-500 bg-white"><Users size={64} className="mx-auto mb-6 opacity-20 text-blue-400"/><p className="font-bold text-lg text-slate-600 mb-1">Bandeja de talentos vacía.</p><p className="text-sm text-slate-400 mt-1">Prueba cambiando los filtros de búsqueda.</p></td></tr>
                    ) : (
                      filteredData.map((p, i) => (
                        <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 + 0.1 }} className="hover:bg-gray-50 transition-colors group cursor-default relative">
                          <td className="px-8 py-6 relative z-10">
                            <div className="absolute left-0 inset-y-0 w-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-center gap-5">{p.foto_url ? (<img src={p.foto_url} alt="Foto" className="w-16 h-16 rounded-2xl object-cover border border-gray-100 group-hover:border-blue-100 transition-colors shadow-inner" />) : (<div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-slate-500 border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">{p.nombres.charAt(0)}{p.apellidos.charAt(0)}</div>)}<div><p className="font-extrabold text-slate-950 text-base leading-tight uppercase tracking-tight group-hover:text-blue-700 transition-colors">{p.apellidos}, {p.nombres}</p><div className="flex items-center gap-2 mt-2"><User size={12} className="text-slate-400"/><div className="text-[11px] font-mono text-slate-600 bg-gray-100 p-1 px-2 rounded-lg border border-gray-100 shadow-inner">DNI: {p.dni}</div></div></div></div>
                          </td>
                          <td className="px-8 py-6 relative z-10">
                            <EstadoDropdown postulanteId={p.id} estadoActual={p.estado} supabase={supabase} />
                          </td>
                          <td className="px-8 py-6 relative z-10 space-y-2"><div className="flex items-center gap-2.5 text-slate-700"><Phone size={14} className="text-slate-400"/><p className="text-sm font-semibold">{p.telefono || '-'}</p></div><div className="flex items-center gap-2.5 text-slate-500"><Mail size={14} className="text-slate-400"/><p className="text-xs truncate max-w-[200px] font-medium">{p.correo || '-'}</p></div></td>
                          <td className="px-8 py-6 relative z-10"><p className="text-xs text-slate-600 bg-white px-5 py-3 rounded-2xl border border-gray-100 inline-block line-clamp-2 max-w-[250px] font-medium leading-relaxed shadow-sm shadow-inner" title={p.perfil_profesional}>{p.perfil_profesional ? p.perfil_profesional : 'Sin descripción.'}</p></td>
                          <td className="px-8 py-6 text-right relative z-10">
                            <div className="flex justify-end gap-3 relative z-10">
                              <motion.button onClick={() => abrirModal(p)} whileTap={{ scale: 0.96 }} className="p-3 text-slate-500 hover:text-white hover:bg-slate-900 rounded-xl transition-all border border-gray-100 hover:border-slate-800 active:scale-95 shadow-sm bg-white" title="Ver Resumen Rápido"><Eye size={18}/></motion.button>
                              <motion.button onClick={() => handleDownloadPDF(p)} whileTap={{ scale: 0.96 }} className="p-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md active:scale-95 shadow-blue-200/60" title="Descargar CV en PDF"><Download size={18}/></motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}