'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { Toaster, toast } from 'sonner'
import { 
  Search, Users, FileText, Download, Calendar, Eye, 
  LayoutDashboard, Building, Inbox, User, Mail, Phone, 
  ChevronDown, Sparkles, Link as LinkIcon, ExternalLink, X, MapPin, 
  Briefcase, GraduationCap, FileBadge, Filter, Save, Lock, Loader2, Zap, Globe, Star, UploadCloud, Wand2, CheckCircle2, LogOut
} from 'lucide-react'

// --- LIBRERÍAS PARA EL PDF ---
import { Document, Page, Text, View, StyleSheet, Image as PdfImage, pdf, Link } from '@react-pdf/renderer'

// --- INTERFAZ DE DATOS ACTUALIZADA ---
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
  titulo_profesional?: string
  linkedin?: string
  colegiatura?: string
  estado: string
  notas_internas?: string
  created_at: string
  experiencias?: any[]
  educacion?: any[]
  certificados?: any[]
  software?: any[]
  idiomas?: any[]
  logros?: any[]
}

// --- ESTILOS DEL PDF ---
const pdfStyles = StyleSheet.create({
  page: { flexDirection: 'row', backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  leftColumn: { width: '32%', backgroundColor: '#f8fafc', paddingHorizontal: 20, paddingTop: 30, paddingBottom: 20, borderRight: '1px solid #e2e8f0' },
  photoContainer: { alignItems: 'center', marginBottom: 20 },
  photo: { width: 100, height: 100, borderRadius: 50, objectFit: 'cover', marginBottom: 10, border: '3px solid #ffffff' },
  sectionLeft: { marginBottom: 20 },
  titleLeft: { fontSize: 10, fontWeight: 'bold', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: 4, marginBottom: 10, letterSpacing: 1.2 },
  textLeft: { fontSize: 8.5, color: '#475569', marginBottom: 4, lineHeight: 1.3 },
  textLeftBold: { fontSize: 8.5, fontWeight: 'bold', color: '#1e293b', marginBottom: 2 },
  
  skillBlock: { marginBottom: 6 },
  skillHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  skillName: { fontSize: 8.5, color: '#334155', fontWeight: 'bold' },
  barBg: { height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 2 },

  rightColumn: { width: '68%', paddingHorizontal: 30, paddingTop: 30, paddingBottom: 20 },
  headerRight: { marginBottom: 20 },
  nameRight: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: -0.5 },
  titleRightMain: { fontSize: 12, fontWeight: 'bold', color: '#2563eb', marginTop: 4, letterSpacing: 1.5, textTransform: 'uppercase' },
  colegiatura: { fontSize: 9, color: '#64748b', marginTop: 4, fontWeight: 'bold' },
  
  contactRow: { flexDirection: 'row', gap: 12, marginTop: 10, flexWrap: 'wrap' },
  contactItem: { fontSize: 8.5, color: '#475569' },

  sectionRight: { marginBottom: 18 },
  titleRight: { fontSize: 11, fontWeight: 'bold', color: '#0f172a', borderBottom: '2px solid #2563eb', paddingBottom: 3, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  textBodyRight: { fontSize: 9, color: '#334155', lineHeight: 1.5, textAlign: 'justify' },
  
  itemBlock: { marginBottom: 12 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  itemTitle: { fontSize: 10, fontWeight: 'bold', color: '#0f172a', width: '70%' },
  itemDate: { fontSize: 8.5, color: '#2563eb', fontWeight: 'bold', width: '30%', textAlign: 'right' },
  itemSubtitle: { fontSize: 9, color: '#64748b', marginBottom: 3, fontStyle: 'italic' },
  
  bulletPoint: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 3 },
  bulletDot: { fontSize: 9, color: '#2563eb', marginRight: 5, marginTop: -1 },
  bulletText: { fontSize: 9, color: '#475569', lineHeight: 1.4, flex: 1 },

  pageAnexos: { backgroundColor: '#ffffff', padding: 40, fontFamily: 'Helvetica' },
  anexoHeader: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', borderBottom: '2px solid #2563eb', paddingBottom: 10, marginBottom: 20, textTransform: 'uppercase' },
  anexoCard: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 8, marginBottom: 25, border: '1px solid #e2e8f0', alignItems: 'center' },
  anexoTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 4, textAlign: 'center' },
  anexoInst: { fontSize: 11, color: '#64748b', marginBottom: 15, textAlign: 'center' },
  anexoImage: { width: '100%', maxHeight: 450, objectFit: 'contain', border: '1px solid #cbd5e1', marginTop: 10 },
  anexoLink: { fontSize: 10, color: '#2563eb', marginTop: 10, textDecoration: 'none', fontWeight: 'bold' }
})

const isImageUrl = (url: string) => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return cleanUrl.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/) != null;
}

const CVPdfDocument = ({ data }: { data: Postulante }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      
      <View style={pdfStyles.leftColumn}>
        <View style={pdfStyles.photoContainer}>
          {data.foto_url && <PdfImage src={data.foto_url} style={pdfStyles.photo} />}
        </View>

        {data.educacion && data.educacion.length > 0 && (
          <View style={pdfStyles.sectionLeft}>
            <Text style={pdfStyles.titleLeft}>EDUCACIÓN</Text>
            {data.educacion.map((edu: any, i: number) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <Text style={pdfStyles.textLeftBold}>{edu.institucion}</Text>
                <Text style={pdfStyles.textLeft}>{edu.titulo}</Text>
                <Text style={{ fontSize: 8, color: '#94a3b8' }}>{edu.anio_inicio} - {edu.anio_fin}</Text>
              </View>
            ))}
          </View>
        )}

        {data.software && data.software.length > 0 && (
          <View style={pdfStyles.sectionLeft} wrap={false}>
            <Text style={pdfStyles.titleLeft}>COMPETENCIAS TÉCNICAS</Text>
            {data.software.map((sw: any, i: number) => (
              <View key={i} style={pdfStyles.skillBlock}>
                <View style={pdfStyles.skillHeader}>
                  <Text style={pdfStyles.skillName}>{sw.nombre}</Text>
                  <Text style={{fontSize: 7, color: '#94a3b8'}}>{sw.nivel}</Text>
                </View>
                <View style={pdfStyles.barBg}><View style={[pdfStyles.barFill, { width: `${sw.porcentaje}%` }]} /></View>
              </View>
            ))}
          </View>
        )}

        {data.idiomas && data.idiomas.length > 0 && (
          <View style={pdfStyles.sectionLeft} wrap={false}>
            <Text style={pdfStyles.titleLeft}>IDIOMAS</Text>
            {data.idiomas.map((idioma: any, i: number) => (
              <View key={i} style={pdfStyles.skillBlock}>
                <View style={pdfStyles.skillHeader}>
                  <Text style={pdfStyles.skillName}>{idioma.nombre}</Text>
                  <Text style={{fontSize: 7, color: '#94a3b8'}}>{idioma.nivel}</Text>
                </View>
                <View style={pdfStyles.barBg}><View style={[pdfStyles.barFill, { width: `${idioma.porcentaje}%` }]} /></View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={pdfStyles.rightColumn}>
        <View style={pdfStyles.headerRight}>
          <Text style={pdfStyles.nameRight}>{data.nombres} {data.apellidos}</Text>
          {data.titulo_profesional && <Text style={pdfStyles.titleRightMain}>{data.titulo_profesional}</Text>}
          {data.colegiatura && <Text style={pdfStyles.colegiatura}>{data.colegiatura}</Text>}
          
          <View style={pdfStyles.contactRow}>
            {data.correo && <Text style={pdfStyles.contactItem}>✉ {data.correo}</Text>}
            {data.telefono && <Text style={pdfStyles.contactItem}>✆ {data.telefono}</Text>}
            {data.direccion && <Text style={pdfStyles.contactItem}>📍 {data.direccion}</Text>}
            {data.linkedin && <Text style={pdfStyles.contactItem}>in/ {data.linkedin}</Text>}
          </View>
        </View>

        {data.perfil_profesional && (
          <View style={pdfStyles.sectionRight} wrap={false}>
            <Text style={pdfStyles.titleRight}>Perfil Profesional</Text>
            <Text style={pdfStyles.textBodyRight}>{data.perfil_profesional}</Text>
          </View>
        )}

        {data.logros && data.logros.length > 0 && (
          <View style={pdfStyles.sectionRight} wrap={false}>
            <Text style={pdfStyles.titleRight}>Logros Clave</Text>
            {data.logros.map((logro: any, i: number) => (
              <View key={i} style={pdfStyles.bulletPoint}>
                <Text style={pdfStyles.bulletDot}>•</Text>
                <Text style={pdfStyles.bulletText}>{logro.descripcion}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={pdfStyles.sectionRight}>
          <Text style={pdfStyles.titleRight}>Experiencia Laboral</Text>
          {data.experiencias && data.experiencias.length > 0 ? data.experiencias.map((exp: any, i: number) => (
            <View key={i} style={pdfStyles.itemBlock} wrap={false}>
              <View style={pdfStyles.itemHeader}>
                <Text style={pdfStyles.itemTitle}>{exp.cargo}</Text>
                <Text style={pdfStyles.itemDate}>{exp.fecha_inicio} / {exp.fecha_fin || 'Actual'}</Text>
              </View>
              <Text style={pdfStyles.itemSubtitle}>{exp.empresa}</Text>
              <Text style={pdfStyles.textBodyRight}>{exp.descripcion}</Text>
            </View>
          )) : <Text style={pdfStyles.textBodyRight}>No registra experiencia laboral.</Text>}
        </View>
      </View>
    </Page>

    {data.certificados && data.certificados.length > 0 && (
      <Page size="A4" style={pdfStyles.pageAnexos}>
        <Text style={pdfStyles.anexoHeader}>Anexos y Documentos Verificados</Text>
        <Text style={{ fontSize: 10, color: '#64748b', marginBottom: 20 }}>
          Los siguientes documentos han sido adjuntados por el postulante como respaldo de su experiencia y educación.
        </Text>
        
        {data.certificados.map((cert: any, i: number) => {
          const isImage = isImageUrl(cert.url_archivo);
          
          return (
            <View key={i} style={pdfStyles.anexoCard} wrap={false}>
              <Text style={pdfStyles.anexoTitle}>{cert.nombre || 'Documento Adjunto'}</Text>
              <Text style={pdfStyles.anexoInst}>Institución/Emisor: {cert.institucion || 'No especificado'}</Text>
              
              {isImage && cert.url_archivo && (
                <PdfImage src={cert.url_archivo} style={pdfStyles.anexoImage} />
              )}
              
              {cert.url_archivo && (
                <Link src={cert.url_archivo} style={pdfStyles.anexoLink}>
                  {isImage ? 'Haz clic aquí para ver el archivo original' : '📄 HAZ CLIC AQUÍ PARA VER EL ARCHIVO PDF ADJUNTO'}
                </Link>
              )}
            </View>
          )
        })}
      </Page>
    )}
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
  <div className="bg-white p-5 sm:p-7 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between group cursor-default transition-all duration-300 hover:shadow-md hover:border-blue-100">
    <div className="flex items-center justify-between mb-4 sm:mb-8">
      <p className="text-slate-500 text-xs sm:text-sm font-semibold tracking-tight uppercase">{label}</p>
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 transition-colors group-hover:bg-blue-50 group-hover:border-blue-100`}><Icon size={20} className={iconColor} /></div>
    </div>
    <h3 className="text-5xl sm:text-6xl font-extrabold text-slate-950 leading-none tracking-tighter">{value}</h3>
  </div>
)

const EstadoRadio = ({ postulanteId, estadoActual, supabase, layout = 'col', onStatusChange }: { postulanteId: string, estadoActual: string, supabase: any, layout?: 'col' | 'row', onStatusChange?: (nuevoEstado: string) => void }) => {
  const [estado, setEstado] = useState(estadoActual || 'Nuevo')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => { setEstado(estadoActual || 'Nuevo') }, [estadoActual])

  const handleChange = async (nuevoEstado: string) => {
    setEstado(nuevoEstado)
    setIsUpdating(true)
    try {
      await supabase.from('cv_postulantes').update({ estado: nuevoEstado }).eq('id', postulanteId)
      toast.success(`Estado actualizado a ${nuevoEstado}`)
      if (onStatusChange) onStatusChange(nuevoEstado)
    } catch (error) {
      toast.error('Error al actualizar el estado')
      setEstado(estadoActual)
    } finally {
      setIsUpdating(false)
    }
  }

  const options = [
    { name: 'Nuevo', classes: 'border-blue-500 peer-checked:bg-blue-500 peer-hover:shadow-blue-500/50 peer-checked:shadow-blue-500/50 text-blue-700' },
    { name: 'En Proceso', classes: 'border-amber-500 peer-checked:bg-amber-500 peer-hover:shadow-amber-500/50 peer-checked:shadow-amber-500/50 text-amber-700' },
    { name: 'Contratado', classes: 'border-emerald-500 peer-checked:bg-emerald-500 peer-hover:shadow-emerald-500/50 peer-checked:shadow-emerald-500/50 text-emerald-700' },
    { name: 'Descartado', classes: 'border-red-500 peer-checked:bg-red-500 peer-hover:shadow-red-500/50 peer-checked:shadow-red-500/50 text-red-700' }
  ]

  return (
    <div className={`flex ${layout === 'col' ? 'flex-col space-y-2.5' : 'flex-row flex-wrap gap-3 sm:gap-4 bg-gray-50/80 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-gray-100'}`}>
      {options.map((opt) => (
        <label key={opt.name} className={`relative flex items-center cursor-pointer group ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
          <input className="sr-only peer" name={`status-${postulanteId}-${layout}`} type="radio" value={opt.name} checked={estado === opt.name} onChange={() => handleChange(opt.name)} />
          <div className={`w-4 h-4 sm:w-5 sm:h-5 bg-transparent border-2 rounded-full peer-hover:shadow-lg peer-checked:shadow-lg transition duration-300 ease-in-out ${opt.classes.split(' text-')[0]}`} />
          <span className={`ml-1.5 sm:ml-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-colors ${estado === opt.name ? opt.classes.split(' ').pop() : 'text-slate-400 group-hover:text-slate-600'}`}>{opt.name}</span>
        </label>
      ))}
    </div>
  )
}

const EstadoDropdown = ({ postulanteId, estadoActual, supabase, onStatusChange }: { postulanteId: string, estadoActual: string, supabase: any, onStatusChange?: (nuevoEstado: string) => void }) => {
  const [estado, setEstado] = useState(estadoActual || 'Nuevo')
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => { setEstado(estadoActual || 'Nuevo') }, [estadoActual])

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
      if (onStatusChange) onStatusChange(nuevoEstado)
    } catch (error) {
      toast.error('Error al actualizar el estado')
      setEstado(estadoActual)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="relative inline-block w-full sm:w-[140px]">
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

  // --- ESTADOS PARA IA (COLA DE IMPORTACIÓN MASIVA) ---
  const fileInputIARef = useRef<HTMLInputElement>(null)
  const [isImportingIA, setIsImportingIA] = useState(false)
  const [showDniModal, setShowDniModal] = useState(false)
  
  // Refs y estados para manejar la cola de archivos
  const queueRef = useRef<File[]>([])
  const indexRef = useRef(0)
  const totalRef = useRef(0)
  
  const [tempDni, setTempDni] = useState('')
  const [tempAiData, setTempAiData] = useState<any>(null)
  const [isSavingAiData, setIsSavingAiData] = useState(false)

  useEffect(() => {
    const isAuthed = sessionStorage.getItem('ruag_admin_auth')
    if (isAuthed === 'true') {
      setIsAuthenticated(true)
    }
    setAuthChecking(false)
  }, [])

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthenticating(true)
    setTimeout(() => {
      if (passInput === 'RUAG2026') { 
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
    const toastId = toast.loading('Generando diseño del PDF Premium...')
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
      setPostulantes(postulantes.map(p => p.id === previewData.id ? { ...p, notas_internas: notaLocal } : p))
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

  const handleEstadoChangeGlobal = (id: string, nuevoEstado: string) => {
    setPostulantes(postulantes.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p))
    if (previewData && previewData.id === id) {
      setPreviewData({ ...previewData, estado: nuevoEstado })
    }
  }

  // --- 1. INICIAR COLA DE ARCHIVOS ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    queueRef.current = files
    totalRef.current = files.length
    indexRef.current = 1
    
    if (fileInputIARef.current) fileInputIARef.current.value = ''
    
    procesarArchivoIA(queueRef.current[0])
  }

  // --- 2. PROCESAR UN ARCHIVO CON GEMINI ---
  const procesarArchivoIA = async (file: File) => {
    setIsImportingIA(true)
    const isBatch = totalRef.current > 1
    const progressText = isBatch ? `(${indexRef.current}/${totalRef.current}) ` : ''
    const toastId = toast.loading(`✨ Analizando CV ${progressText}capa por capa...`)

    try {
      const base64String = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          resolve(result.split(',')[1]) 
        }
        reader.readAsDataURL(file)
      })

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (!apiKey) throw new Error("Falta la API Key de Gemini en las variables de entorno.")

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: `Eres un experto en Recursos Humanos. Analiza este Curriculum Vitae minuciosamente. Es un documento complejo que puede tener docenas de páginas.
              Tu tarea es extraer ABSOLUTAMENTE TODA la información y estructurarla ESTRICTAMENTE en el siguiente formato JSON.
              
              REGLAS VITALES OBLIGATORIAS:
              1. EXTRAE TODAS LAS EXPERIENCIAS: Sé exhaustivo. Si una persona trabajó en una empresa matriz pero especifica haber trabajado en múltiples "Obras" o "Proyectos" distintos dentro de esa etapa, DEBES crear un objeto separado en el array "experiencias" para CADA OBRA/PROYECTO. El campo "empresa" puede ser "Nombre Empresa Matriz - Nombre Obra". No omitas NINGUNA.
              2. DNI: Busca minuciosamente el DNI (Documento Nacional de Identidad de Perú, 8 dígitos). Búscalo en el texto o escaneando visualmente las últimas páginas si hay imágenes de documentos. Si lo encuentras, colócalo. Si es imposible hallarlo, déjalo vacío ("").
              3. CERTIFICADOS / ANEXOS: Al final del documento suele haber imágenes de diplomas, constancias de trabajo, o certificados. Identifícalos visualmente y crea un elemento en la lista "certificados" por cada uno (nombre e institución). Deja "url_archivo" vacío ("").
              4. SOFTWARE E IDIOMAS: Asigna un porcentaje aproximado (Básico=30, Intermedio=60, Avanzado=85, Experto=100).
              5. Devuelve ÚNICAMENTE un JSON válido, sin markdown (\`\`\`json), sin texto adicional al principio ni al final.

              Formato JSON requerido:
              {
                "dni": "", "nombres": "", "apellidos": "", "correo": "", "telefono": "", "direccion": "",
                "titulo_profesional": "", "perfil_profesional": "", "linkedin": "", "colegiatura": "",
                "experiencias": [{"cargo": "", "empresa": "", "fecha_inicio": "", "fecha_fin": "", "descripcion": ""}],
                "educacion": [{"institucion": "", "titulo": "", "nivel": "Universitario", "anio_inicio": "", "anio_fin": ""}],
                "software": [{"nombre": "", "nivel": "Intermedio", "porcentaje": 60}],
                "idiomas": [{"nombre": "", "nivel": "Básico", "porcentaje": 30}],
                "logros": [{"descripcion": ""}],
                "certificados": [{"nombre": "", "institucion": "", "url_archivo": ""}]
              }` },
              { inline_data: { mime_type: "application/pdf", data: base64String } }
            ]
          }]
        })
      })

      const apiResult = await response.json()
      if (apiResult.error) throw new Error(apiResult.error.message)

      let textResult = apiResult.candidates[0].content.parts[0].text
      
      const jsonMatch = textResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
          textResult = jsonMatch[0];
      } else {
          textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim()
      }
      
      const dataAnalizada = JSON.parse(textResult)

      toast.success(`¡Análisis del archivo completado!`, { id: toastId })
      
      setTempAiData(dataAnalizada)
      setTempDni(dataAnalizada.dni || '')
      setShowDniModal(true)

    } catch (error) {
      console.error(error)
      toast.error(`Error al procesar el archivo. Pasando al siguiente...`, { id: toastId })
      setIsImportingIA(false)
      avanzarCola()
    }
  }

  // --- 3. AVANZAR LA COLA AL SIGUIENTE ARCHIVO ---
  const avanzarCola = () => {
    queueRef.current = queueRef.current.slice(1) 
    
    if (queueRef.current.length > 0) {
      indexRef.current += 1
      setTimeout(() => {
        procesarArchivoIA(queueRef.current[0])
      }, 400)
    } else {
      if (totalRef.current > 1) {
        toast.success("¡Importación Masiva Completada con Éxito!")
      }
      totalRef.current = 0
      indexRef.current = 0
      setIsImportingIA(false)
    }
  }

  // --- 4. GUARDAR Y CONTINUAR ---
  const handleConfirmAndSaveAiProfile = async () => {
    if (!tempDni || tempDni.length < 8) {
      toast.error("Debes ingresar un DNI válido (Mínimo 8 dígitos).")
      return;
    }

    setIsSavingAiData(true)
    
    try {
      const { data: existente, error: errorBusqueda } = await supabase
        .from('cv_postulantes')
        .select('id')
        .eq('dni', tempDni)
        .maybeSingle() 
      
      if (errorBusqueda) throw errorBusqueda;

      const payloadToSave = {
        dni: tempDni,
        nombres: tempAiData.nombres || 'Sin Nombre',
        apellidos: tempAiData.apellidos || '',
        correo: tempAiData.correo || '',
        telefono: tempAiData.telefono || '',
        direccion: tempAiData.direccion || '',
        titulo_profesional: tempAiData.titulo_profesional || '',
        perfil_profesional: tempAiData.perfil_profesional || '',
        linkedin: tempAiData.linkedin || '',
        colegiatura: tempAiData.colegiatura || '',
        estado: 'Nuevo',
        experiencias: tempAiData.experiencias?.map((e:any) => ({...e, id: crypto.randomUUID()})) || [],
        educacion: tempAiData.educacion?.map((e:any) => ({...e, id: crypto.randomUUID()})) || [],
        software: tempAiData.software?.map((e:any) => ({...e, id: crypto.randomUUID()})) || [],
        idiomas: tempAiData.idiomas?.map((e:any) => ({...e, id: crypto.randomUUID()})) || [],
        logros: tempAiData.logros?.map((e:any) => ({...e, id: crypto.randomUUID()})) || [],
        certificados: tempAiData.certificados?.length > 0 ? tempAiData.certificados.map((c:any) => ({
          id: crypto.randomUUID(), nombre: c.nombre || 'Certificado', institucion: c.institucion || '', url_archivo: ''
        })) : []
      }

      if (existente) {
        const { error } = await supabase.from('cv_postulantes').update({ ...payloadToSave, updated_at: new Date().toISOString() }).eq('dni', tempDni)
        if (error) throw error
        toast.success("Perfil actualizado correctamente.")
      } else {
        const { error } = await supabase.from('cv_postulantes').insert(payloadToSave)
        if (error) throw error
        toast.success("Trabajador agregado correctamente.")
      }

      fetchData()
      setShowDniModal(false)
      setTempAiData(null)
      setTempDni('')
      
      avanzarCola()

    } catch (error: any) {
      toast.error(`Error al guardar: ${error.message}`)
    } finally {
      setIsSavingAiData(false)
    }
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
    const mensaje = `Hola ${nombre}, te escribimos de *RUAG*. Hemos revisado tu perfil profesional y nos gustaría conversar contigo...`
    window.open(`https://wa.me/${numFinal}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  if (authChecking) return <div className="h-screen bg-slate-950"></div>

  // --- PANTALLA DE LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050b14] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <Toaster position="top-center" richColors />
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute -top-[300px] -left-[300px] w-[800px] h-[800px] bg-gradient-to-br from-blue-600/20 to-transparent rounded-full blur-[100px]" />
          <motion.div animate={{ rotate: -360, scale: [1, 1.5, 1] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute -bottom-[300px] -right-[300px] w-[800px] h-[800px] bg-gradient-to-tl from-emerald-500/10 to-transparent rounded-full blur-[100px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30, rotateX: 10 }} 
          animate={{ opacity: 1, y: 0, rotateX: 0 }} 
          transition={{ type: "spring", damping: 20, stiffness: 100 }} 
          className="bg-white/5 backdrop-blur-2xl rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 shadow-[0_0_50px_rgba(37,99,235,0.15)] border border-white/10 w-full max-w-md relative z-10"
        >
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-cyan-400 text-white rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.4)] rotate-12 group-hover:rotate-0 transition-transform">
              <Lock size={32} className="-rotate-12 sm:w-10 sm:h-10" />
            </div>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black text-center text-white mb-2 tracking-tight">Acceso Seguro</h2>
          <p className="text-center text-slate-400 text-xs sm:text-sm mb-8 sm:mb-10 font-medium">Credenciales requeridas por Recursos Humanos.</p>
          
          <form onSubmit={handleLogin} className="space-y-6 sm:space-y-8">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 sm:left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                <Lock size={18} className="sm:w-5 sm:h-5" />
              </div>
              <input 
                type="password" 
                placeholder="Ingresa la clave..." 
                value={passInput} 
                onChange={e => setPassInput(e.target.value)} 
                className="w-full pl-12 sm:pl-14 pr-4 sm:pr-5 py-4 sm:py-5 bg-black/40 border border-white/10 rounded-xl sm:rounded-2xl text-white text-sm sm:text-base font-medium focus:border-blue-500 focus:bg-black/60 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none placeholder:text-slate-600 tracking-widest shadow-inner" 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isAuthenticating || passInput.length < 4} 
              className="relative w-full overflow-hidden bg-white text-slate-900 font-black text-base sm:text-lg py-4 sm:py-5 rounded-xl sm:rounded-2xl hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              {isAuthenticating ? (
                <><Loader2 size={20} className="animate-spin text-blue-600 sm:w-6 sm:h-6"/> <span className="text-slate-500">Verificando...</span></>
              ) : (
                <>Desbloquear Panel <ChevronDown size={18} className="-rotate-90 group-hover:translate-x-1 transition-transform sm:w-5 sm:h-5"/></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-900 overflow-hidden relative">
      <Toaster position="bottom-right" richColors />
      <AnimatePresence>{loading && <SplashLoader />}</AnimatePresence>

      {/* --- MODAL CONFIRMACIÓN DNI DE IA (COLA DE IMPORTACIÓN) --- */}
      <AnimatePresence>
        {showDniModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl w-full max-w-md p-5 sm:p-8 border border-gray-100">
              
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner relative">
                <Wand2 size={24} className="sm:w-8 sm:h-8" />
                {totalRef.current > 1 && (
                  <span className="absolute -top-3 -right-3 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-full border-2 border-white">
                    {indexRef.current}/{totalRef.current}
                  </span>
                )}
              </div>
              
              <h2 className="text-xl sm:text-2xl font-black text-center text-slate-900 mb-2 tracking-tight">¡Currículum Analizado!</h2>
              <p className="text-center text-slate-500 text-xs sm:text-sm mb-6 sm:mb-8">La IA extrajo la información de <strong className="text-slate-800">{tempAiData?.nombres} {tempAiData?.apellidos}</strong>. Confirma su DNI para guardarlo.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Documento de Identidad (DNI)</label>
                  <input 
                    type="text" 
                    value={tempDni} 
                    onChange={e => setTempDni(e.target.value)} 
                    className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl text-slate-900 font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-center tracking-[0.2em] text-base sm:text-lg shadow-inner" 
                    placeholder="Ej. 70123456"
                    autoFocus
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button 
                    onClick={() => { setShowDniModal(false); setTempAiData(null); setTempDni(''); avanzarCola(); }} 
                    className="w-full py-3 sm:py-4 bg-gray-100 hover:bg-gray-200 text-slate-600 text-sm sm:text-base font-bold rounded-xl transition-colors"
                  >
                    {totalRef.current > 1 ? 'Omitir CV' : 'Cancelar'}
                  </button>
                  <button onClick={handleConfirmAndSaveAiProfile} disabled={isSavingAiData || tempDni.length < 8} className="w-full flex items-center justify-center gap-2 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-bold rounded-xl transition-colors shadow-lg shadow-blue-200 disabled:opacity-50">
                    {isSavingAiData ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle2 size={18} />} Guardar
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODAL DE VISTA PREVIA DEL TRABAJADOR --- */}
      <AnimatePresence>
        {previewData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
              
              <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50/50 gap-4 relative z-10">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0"><User size={20}/></div>
                  <div className="flex-1">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Perfil del Candidato</h2>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-mono">DNI: {previewData.dni}</p>
                  </div>
                  <button onClick={() => setPreviewData(null)} className="p-2 text-slate-400 hover:bg-gray-200 hover:text-slate-800 rounded-full transition-colors sm:hidden ml-auto shrink-0"><X size={20} /></button>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto pb-1 sm:pb-0">
                  <EstadoRadio 
                    postulanteId={previewData.id} 
                    estadoActual={previewData.estado} 
                    supabase={supabase} 
                    layout="row" 
                    onStatusChange={(nuevo) => handleEstadoChangeGlobal(previewData.id, nuevo)} 
                  />
                  <button onClick={() => setPreviewData(null)} className="hidden sm:block p-2 text-slate-400 hover:bg-gray-200 hover:text-slate-800 rounded-full transition-colors ml-auto"><X size={24} /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-8 scrollbar-thin scrollbar-thumb-gray-200">
                <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-center md:items-start mb-6 sm:mb-8 text-center md:text-left">
                  {previewData.foto_url ? ( <img src={previewData.foto_url} alt="Foto" className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-lg shrink-0" /> ) : ( <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center text-gray-400 shrink-0"><User size={40} className="sm:w-12 sm:h-12"/></div> )}
                  <div className="space-y-2 sm:space-y-3 w-full overflow-hidden">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight leading-tight">{previewData.nombres} {previewData.apellidos}</h1>
                    {previewData.titulo_profesional && <h2 className="text-xs sm:text-sm font-bold text-blue-600 uppercase tracking-widest">{previewData.titulo_profesional} {previewData.colegiatura && `| ${previewData.colegiatura}`}</h2>}
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-slate-600 mt-2 border-b border-gray-100 pb-4">
                      <span className="flex items-center gap-1.5"><Phone size={14} className="text-blue-500 sm:w-4 sm:h-4"/> {previewData.telefono || 'Sin celular'}</span>
                      <span className="flex items-center gap-1.5"><Mail size={14} className="text-blue-500 sm:w-4 sm:h-4"/> <span className="truncate max-w-[150px] sm:max-w-none">{previewData.correo || 'Sin correo'}</span></span>
                      <span className="flex items-center gap-1.5"><MapPin size={14} className="text-blue-500 sm:w-4 sm:h-4"/> <span className="truncate max-w-[150px] sm:max-w-none">{previewData.direccion || 'Sin dirección'}</span></span>
                      {previewData.linkedin && <span className="flex items-center gap-1.5"><LinkIcon size={14} className="text-blue-500 sm:w-4 sm:h-4"/> <span className="truncate max-w-[100px] sm:max-w-none">in/{previewData.linkedin}</span></span>}
                    </div>

                    <div className="text-xs sm:text-sm text-slate-600 w-full overflow-hidden pt-2 text-left">
                      <p className="font-bold text-slate-800 mb-1 text-[10px] sm:text-xs uppercase tracking-widest">Resumen Profesional</p>
                      <p className="break-words whitespace-pre-wrap leading-relaxed">{previewData.perfil_profesional || 'El candidato no escribió un resumen.'}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6 sm:mb-8 bg-amber-50/50 border border-amber-100 rounded-2xl p-4 sm:p-5 relative overflow-hidden text-left">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
                  <h3 className="text-xs sm:text-sm font-bold text-amber-800 uppercase tracking-widest mb-3 flex items-center gap-2"><FileText size={16} className="text-amber-500"/> Notas Internas (Solo RRHH)</h3>
                  <textarea value={notaLocal} onChange={(e) => setNotaLocal(e.target.value)} placeholder="Observaciones de entrevista, expectativas salariales..." className="w-full bg-white border border-amber-200 rounded-xl p-3 text-xs sm:text-sm text-slate-700 outline-none focus:ring-2 focus:ring-amber-400 resize-none min-h-[80px] break-words"/>
                  <div className="flex justify-end mt-3">
                    <button onClick={guardarNotaInterna} disabled={guardandoNota || notaLocal === previewData.notas_internas} className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50">
                      <Save size={14} /> {guardandoNota ? 'Guardando...' : 'Guardar Nota'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 text-left">
                  {/* COLUMNA PRINCIPAL (Exp, Logros, Edu) */}
                  <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                    
                    {previewData.logros && previewData.logros.length > 0 && (
                      <div>
                        <h3 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2"><Star size={16} className="text-amber-500 sm:w-[18px] sm:h-[18px]"/> Logros Destacados</h3>
                        <ul className="space-y-2 sm:space-y-3 pl-1 sm:pl-2">
                          {previewData.logros.map((l, i) => (
                            <li key={i} className="text-xs sm:text-sm text-slate-700 relative pl-3 sm:pl-4 leading-relaxed"><span className="absolute left-0 top-1.5 sm:top-2 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>{l.descripcion}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h3 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2"><Briefcase size={16} className="text-blue-500 sm:w-[18px] sm:h-[18px]"/> Experiencia Laboral</h3>
                      <div className="space-y-5 sm:space-y-6">
                        {previewData.experiencias && previewData.experiencias.length > 0 ? previewData.experiencias.map((exp, i) => (
                          <div key={i} className="relative pl-4 sm:pl-5 border-l-2 border-blue-100"><div className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full -left-[6px] sm:-left-[7px] top-1 border-2 border-white"></div><h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight mb-0.5">{exp.cargo}</h4><p className="text-[10px] sm:text-xs text-blue-600 font-bold mb-2">{exp.empresa} <span className="text-slate-400 font-medium">| {exp.fecha_inicio} - {exp.fecha_fin || 'Actual'}</span></p><p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-words">{exp.descripcion}</p></div>
                        )) : <p className="text-xs sm:text-sm text-slate-400 italic">No registra experiencia.</p>}
                      </div>
                    </div>

                    <div>
                      <h3 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2"><GraduationCap size={16} className="text-emerald-500 sm:w-[18px] sm:h-[18px]"/> Educación</h3>
                      <div className="space-y-4">
                        {previewData.educacion && previewData.educacion.length > 0 ? previewData.educacion.map((edu, i) => (
                          <div key={i} className="relative pl-4 sm:pl-5 border-l-2 border-emerald-100"><div className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 rounded-full -left-[6px] sm:-left-[7px] top-1 border-2 border-white"></div><h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight mb-0.5">{edu.titulo}</h4><p className="text-[10px] sm:text-xs text-slate-600 font-medium">{edu.institucion} ({edu.nivel})</p><p className="text-[9px] sm:text-[10px] font-bold text-slate-400 mt-1">{edu.anio_inicio} - {edu.anio_fin}</p></div>
                        )) : <p className="text-xs sm:text-sm text-slate-400 italic">No registra educación.</p>}
                      </div>
                    </div>
                  </div>

                  {/* COLUMNA LATERAL (Skills y Docs) */}
                  <div className="space-y-6 sm:space-y-8 bg-slate-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 h-fit">
                    
                    {previewData.software && previewData.software.length > 0 && (
                      <div>
                        <h3 className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 sm:mb-4"><Zap size={14} className="text-blue-500 sm:w-4 sm:h-4"/> Herramientas</h3>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {previewData.software.map((sw, i) => (
                            <span key={i} className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white border border-blue-100 text-blue-700 text-[9px] sm:text-[10px] font-bold rounded-lg shadow-sm">{sw.nombre} <span className="opacity-50">({sw.nivel})</span></span>
                          ))}
                        </div>
                      </div>
                    )}

                    {previewData.idiomas && previewData.idiomas.length > 0 && (
                      <div>
                        <h3 className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 sm:mb-4"><Globe size={14} className="text-emerald-500 sm:w-4 sm:h-4"/> Idiomas</h3>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {previewData.idiomas.map((lang, i) => (
                            <span key={i} className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white border border-emerald-100 text-emerald-700 text-[9px] sm:text-[10px] font-bold rounded-lg shadow-sm">{lang.nombre} <span className="opacity-50">({lang.nivel})</span></span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 sm:mb-4"><FileBadge size={14} className="text-purple-500 sm:w-4 sm:h-4"/> Documentos</h3>
                      <div className="flex flex-col gap-2">
                        {previewData.certificados && previewData.certificados.length > 0 ? previewData.certificados.map((cert, i) => (
                          <a key={i} href={cert.url_archivo} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 sm:p-3 bg-white hover:bg-purple-50 rounded-xl border border-gray-100 hover:border-purple-200 transition-colors group shadow-sm">
                            <div className="pr-2"><p className="font-bold text-[11px] sm:text-xs text-slate-800 group-hover:text-purple-700 line-clamp-1">{cert.nombre}</p><p className="text-[9px] sm:text-[10px] text-slate-500 line-clamp-1">{cert.institucion}</p></div>
                            <ExternalLink size={14} className="text-slate-400 group-hover:text-purple-500 shrink-0" />
                          </a>
                        )) : <p className="text-[10px] sm:text-xs text-slate-400 italic">Sin documentos.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 sm:px-8 py-4 sm:py-5 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                <button onClick={() => abrirWhatsApp(previewData.telefono, previewData.nombres)} className="w-full sm:w-auto px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"><Phone size={16} className="fill-current sm:w-[18px] sm:h-[18px]"/> Contactar</button>
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                  <button onClick={() => setPreviewData(null)} className="flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-slate-600 bg-white border border-gray-200 hover:bg-gray-100 transition-colors text-center shadow-sm">Cerrar</button>
                  <button onClick={() => handleDownloadPDF(previewData)} className="flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-black shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2"><Download size={16} className="sm:w-[18px] sm:h-[18px]"/> Descargar</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BARRA LATERAL PC */}
      <aside className="hidden md:flex w-64 bg-white text-slate-900 flex-col h-full border-r border-gray-100 transition-all z-20">
        <div className="h-24 flex items-center justify-start px-6 border-b border-gray-100"><Building size={24} className="text-blue-600" /><h1 className="font-bold text-xl ml-3 tracking-tighter text-slate-950">RUAG <span className="font-light text-slate-500">CV</span></h1></div>
        <nav className="flex-1 py-8 flex flex-col gap-2 px-3">
          <button onClick={() => setActiveView('dashboard')} className={`flex items-center justify-start gap-4 w-full p-4 rounded-2xl transition-all font-semibold text-sm ${activeView === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-950 hover:bg-gray-50'}`}><LayoutDashboard size={20} /><span className="tracking-tight">Dashboard</span></button>
          <button onClick={() => setActiveView('talentos')} className={`flex items-center justify-start gap-4 w-full p-4 rounded-2xl transition-all font-semibold text-sm ${activeView === 'talentos' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-950 hover:bg-gray-50'}`}><Users size={20} /><span className="tracking-tight">Base de Talentos</span></button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-auto md:h-24 py-4 md:py-0 bg-white/80 backdrop-blur-xl border-b border-gray-100/80 px-4 sm:px-10 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-10 gap-3 md:gap-0">
          <div className="flex justify-between items-center w-full md:w-auto">
            <div>
              <p className="text-[9px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Gestión de Talento</p>
              <h2 className="text-xl sm:text-3xl font-extrabold text-slate-950 tracking-tighter">{activeView === 'dashboard' ? 'Panel Principal' : 'Directorio'}</h2>
            </div>
            {/* BOTÓN MAGIA IA ADMIN MÓVIL */}
            <button 
              onClick={() => fileInputIARef.current?.click()}
              disabled={isImportingIA || showDniModal}
              className="md:hidden flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-md active:scale-95 transition-transform"
            >
              {isImportingIA || showDniModal ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 relative w-full md:w-auto overflow-x-auto scrollbar-hide pb-1 md:pb-0">
            
            {/* BOTÓN MAGIA IA ADMIN PC */}
            <input 
              type="file" 
              accept="application/pdf" 
              multiple 
              className="hidden" 
              ref={fileInputIARef} 
              onChange={handleFileSelect} 
            />
            <button 
              onClick={() => fileInputIARef.current?.click()}
              disabled={isImportingIA || showDniModal}
              className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
            >
              {isImportingIA || showDniModal ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              {isImportingIA || showDniModal ? `Procesando... ${totalRef.current > 1 ? `(${indexRef.current}/${totalRef.current})` : ''}` : 'Importar CVs (IA)'}
            </button>

            <div className="relative group flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shrink-0"><Filter size={14} className="text-slate-400 sm:w-4 sm:h-4" /><select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="bg-transparent text-xs sm:text-sm font-bold text-slate-700 outline-none cursor-pointer appearance-none pr-4"><option value="Todos">Todos los Estados</option><option value="Nuevo">Nuevos</option><option value="En Proceso">En Proceso</option><option value="Contratado">Contratados</option><option value="Descartado">Descartados</option></select></div>
            <div className="relative group hidden sm:block w-48 lg:w-72 shrink-0"><Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16}/><input type="text" placeholder="Buscar perfil..." className="w-full pl-9 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl focus:bg-white focus:ring-1 focus:ring-blue-200 focus:border-blue-300 outline-none transition-all text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-inner" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/></div>
            
            <div onClick={() => setIsMenuOpen(!isMenuOpen)} className="hidden md:flex items-center gap-3 bg-gray-50 p-1.5 px-4 rounded-full border border-gray-100 shadow-sm cursor-pointer hover:bg-gray-100 transition-colors ml-2 shrink-0">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs"><Lock size={12}/></div>
              <p className="text-xs font-bold text-slate-800 select-none">Admin</p>
              <motion.div animate={{ rotate: isMenuOpen ? 180 : 0 }}><ChevronDown size={14} className="text-slate-400"/></motion.div>
            </div>
            
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute right-0 top-14 sm:top-16 mt-2 w-48 sm:w-56 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50 py-2">
                  <button onClick={handleCopyLink} className="w-full flex items-center gap-3 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors text-left"><LinkIcon size={14} className="sm:w-4 sm:h-4"/> Copiar enlace</button>
                  <div className="h-px bg-gray-100 my-1 mx-4"></div>
                  <button onClick={() => { sessionStorage.removeItem('ruag_admin_auth'); window.location.reload(); }} className="w-full flex items-center gap-3 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left"><Lock size={14} className="sm:w-4 sm:h-4"/> Cerrar Sesión</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Buscador móvil */}
        <div className="sm:hidden px-4 pt-3 pb-1 bg-gray-50 border-b border-gray-100 z-0 relative">
          <div className="relative group w-full"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16}/><input type="text" placeholder="Buscar perfil o DNI..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-200 focus:border-blue-300 outline-none transition-all text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-inner" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/></div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-10 pb-24 sm:pb-10 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent scroll-smooth relative z-0">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-[1600px] mx-auto space-y-6 sm:space-y-10">
            
            <div className={`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-7 ${activeView === 'dashboard' ? 'grid' : 'hidden'}`}>
              <StatCard icon={FileText} label="Total CVs Recibidos" value={postulantes.length} iconColor="text-blue-600" />
              <StatCard icon={Sparkles} label="Nuevos (Esta semana)" value={postulantes.filter(p => new Date(p.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} iconColor="text-emerald-600" />
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group flex flex-col justify-between"><div><h3 className="text-slate-950 font-bold text-lg sm:text-xl mb-1 tracking-tight">Portal de Empleo Activo</h3><p className="text-slate-500 text-xs sm:text-sm max-w-sm leading-relaxed">El sistema está sincronizado. Las nuevas postulaciones aparecen aquí instantáneamente.</p></div><div className="flex items-center gap-2 mt-4 sm:mt-6 bg-emerald-50 p-2 px-3 sm:px-4 rounded-full border border-emerald-100 self-start"><div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-200"></div><p className="text-[10px] sm:text-xs font-semibold text-emerald-800 uppercase tracking-tight">En línea - Sincronizado</p></div></div>
            </div>

            <motion.div variants={itemVariants} className="bg-transparent sm:bg-white rounded-none sm:rounded-3xl sm:border sm:border-gray-100 sm:shadow-sm overflow-hidden relative">
              <div className="p-2 pb-4 sm:p-8 sm:border-b border-gray-100 flex justify-between items-center sm:bg-gray-50/50">
                <h3 className="font-extrabold text-slate-950 text-base sm:text-xl tracking-tight hidden sm:block"><Inbox size={22} className="text-blue-600 inline mr-3 -mt-1"/>{activeView === 'dashboard' ? 'Últimos Candidatos' : 'Directorio Completo de Talentos'}</h3>
                <div className="text-[10px] sm:text-xs text-slate-500 font-mono sm:bg-white sm:p-2.5 sm:px-4 sm:rounded-xl sm:border sm:border-gray-100 sm:shadow-inner w-full sm:w-auto text-right">{filteredData.length} resultados filtrados</div>
              </div>
              
              {/* VISTA MÓVIL (TARJETAS) */}
              <div className="md:hidden flex flex-col gap-4">
                {filteredData.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-gray-100"><Users size={48} className="mx-auto mb-4 opacity-20 text-blue-400"/><p className="font-bold text-base text-slate-600 mb-1">Bandeja vacía.</p><p className="text-xs text-slate-400">Cambia los filtros.</p></div>
                ) : (
                  filteredData.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        {p.foto_url ? (<img src={p.foto_url} alt="Foto" className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shadow-inner shrink-0" />) : (<div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-slate-400 border border-gray-100 shrink-0">{p.nombres.charAt(0)}{p.apellidos.charAt(0)}</div>)}
                        <div className="flex-1 min-w-0">
                          <p className="font-extrabold text-slate-950 text-sm leading-tight uppercase tracking-tight truncate">{p.apellidos}, {p.nombres}</p>
                          <p className="text-[10px] font-bold text-blue-600 uppercase mt-0.5 truncate">{p.titulo_profesional || 'Perfil en revisión'}</p>
                          <p className="text-[10px] font-mono text-slate-500 mt-1">DNI: {p.dni}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-2 text-slate-700"><Phone size={12} className="text-slate-400"/><p className="text-xs font-semibold">{p.telefono || '-'}</p></div>
                        <div className="flex items-center gap-2 text-slate-500"><Mail size={12} className="text-slate-400"/><p className="text-[11px] truncate">{p.correo || '-'}</p></div>
                      </div>

                      <div className="flex justify-between items-center mt-1">
                        <EstadoDropdown postulanteId={p.id} estadoActual={p.estado} supabase={supabase} onStatusChange={(nuevo) => handleEstadoChangeGlobal(p.id, nuevo)} />
                        <div className="flex gap-2">
                          <button onClick={() => abrirModal(p)} className="w-9 h-9 bg-gray-100 text-slate-600 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"><Eye size={16}/></button>
                          <button onClick={() => handleDownloadPDF(p)} className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-200"><Download size={16}/></button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* VISTA PC (TABLA) */}
              <div className="hidden md:block overflow-x-auto pb-32">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Información del Candidato</th>
                      <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Estado RRHH</th>
                      <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Datos de Contacto</th>
                      <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Notas de RRHH</th>
                      <th className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/80">
                    {filteredData.length === 0 ? (
                      <tr><td colSpan={5} className="p-24 text-center text-slate-500 bg-white"><Users size={64} className="mx-auto mb-6 opacity-20 text-blue-400"/><p className="font-bold text-lg text-slate-600 mb-1">Bandeja de talentos vacía.</p><p className="text-sm text-slate-400 mt-1">Prueba cambiando los filtros de búsqueda.</p></td></tr>
                    ) : (
                      filteredData.map((p, i) => (
                        <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 + 0.1 }} className="hover:bg-gray-50 transition-colors group cursor-default relative">
                          <td className="px-8 py-6 relative z-10">
                            <div className="absolute left-0 inset-y-0 w-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-center gap-5">{p.foto_url ? (<img src={p.foto_url} alt="Foto" className="w-16 h-16 rounded-2xl object-cover border border-gray-100 group-hover:border-blue-100 transition-colors shadow-inner" />) : (<div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-slate-500 border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">{p.nombres.charAt(0)}{p.apellidos.charAt(0)}</div>)}<div><p className="font-extrabold text-slate-950 text-base leading-tight uppercase tracking-tight group-hover:text-blue-700 transition-colors">{p.apellidos}, {p.nombres}</p><p className="text-[10px] font-bold text-blue-600 uppercase mt-0.5">{p.titulo_profesional || 'Perfil en revisión'}</p><div className="flex items-center gap-2 mt-2"><User size={12} className="text-slate-400"/><div className="text-[11px] font-mono text-slate-600 bg-gray-100 p-1 px-2 rounded-lg border border-gray-100 shadow-inner">DNI: {p.dni}</div></div></div></div>
                          </td>
                          <td className="px-8 py-6 relative z-10">
                            <EstadoDropdown postulanteId={p.id} estadoActual={p.estado} supabase={supabase} onStatusChange={(nuevo) => handleEstadoChangeGlobal(p.id, nuevo)} />
                          </td>
                          <td className="px-8 py-6 relative z-10 space-y-2"><div className="flex items-center gap-2.5 text-slate-700"><Phone size={14} className="text-slate-400"/><p className="text-sm font-semibold">{p.telefono || '-'}</p></div><div className="flex items-center gap-2.5 text-slate-500"><Mail size={14} className="text-slate-400"/><p className="text-xs truncate max-w-[200px] font-medium">{p.correo || '-'}</p></div></td>
                          
                          <td className="px-8 py-6 relative z-10">
                            <p className="text-xs text-amber-700 bg-amber-50 px-5 py-3 rounded-2xl border border-amber-100 inline-block line-clamp-2 max-w-[250px] font-medium leading-relaxed shadow-sm shadow-inner break-words" title={p.notas_internas}>
                              {p.notas_internas ? p.notas_internas : 'Sin notas registradas.'}
                            </p>
                          </td>

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

        {/* BOTTOM NAVIGATION BAR ADMIN (SÓLO MÓVIL) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 pb-safe z-50">
          <div className="flex justify-around items-center h-16 px-2">
            <button onClick={() => setActiveView('dashboard')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeView === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}>
              <LayoutDashboard size={20} className={activeView === 'dashboard' ? 'fill-blue-100' : ''} />
              <span className="text-[10px] font-bold">Panel</span>
            </button>
            
            <button onClick={() => setActiveView('talentos')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeView === 'talentos' ? 'text-blue-600' : 'text-slate-400'}`}>
              <Users size={20} className={activeView === 'talentos' ? 'fill-blue-100' : ''} />
              <span className="text-[10px] font-bold">Talentos</span>
            </button>

            <button onClick={() => { sessionStorage.removeItem('ruag_admin_auth'); window.location.reload(); }} className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-400 hover:text-red-500">
              <LogOut size={20} />
              <span className="text-[10px] font-bold">Salir</span>
            </button>
          </div>
        </div>

      </main>
    </div>
  )
}