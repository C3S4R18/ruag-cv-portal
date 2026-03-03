'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster, toast } from 'sonner'
import { 
  IdCard, User, ArrowRight, Building, CheckCircle2, Loader2 
} from 'lucide-react'

// --- SPLASH SCREEN ÚNICO: CV LLENÁNDOSE ---
const DocumentSplash = () => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900"
    >
      {/* Glow de fondo */}
      <div className="absolute inset-0 bg-blue-600/20 blur-[100px] rounded-full w-96 h-96 mx-auto mt-20 pointer-events-none"></div>
      
      {/* Contenedor de la Hoja */}
      <motion.div 
        initial={{ y: 50, opacity: 0, rotateX: 20 }}
        animate={{ y: 0, opacity: 1, rotateX: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="relative w-48 h-64 bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col p-5 border border-slate-200 overflow-hidden"
        style={{ perspective: "1000px" }}
      >
        {/* Encabezado del CV: Foto y Nombre */}
        <div className="flex gap-4 mb-6 w-full">
          {/* Foto (Círculo) */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="w-10 h-10 rounded-full bg-slate-200 shrink-0"
          />
          {/* Bloque Nombre / Contacto */}
          <div className="flex flex-col gap-2 w-full mt-1">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "80%" }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="h-2.5 bg-blue-500 rounded-full"
            />
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "50%" }}
              transition={{ delay: 0.8, duration: 0.3 }}
              className="h-1.5 bg-slate-200 rounded-full"
            />
          </div>
        </div>

        {/* Separador */}
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
          className="h-px bg-slate-100 mb-5"
        />

        {/* Cuerpo del CV: Experiencia (Líneas) */}
        <div className="flex flex-col gap-3 w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "30%" }}
                transition={{ delay: 1.1 + (i * 0.2), duration: 0.3 }}
                className="h-1.5 bg-slate-300 rounded-full"
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "90%" }}
                transition={{ delay: 1.2 + (i * 0.2), duration: 0.4 }}
                className="h-1 bg-slate-100 rounded-full"
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "70%" }}
                transition={{ delay: 1.3 + (i * 0.2), duration: 0.3 }}
                className="h-1 bg-slate-100 rounded-full mb-1"
              />
            </div>
          ))}
        </div>

        {/* Check de Confirmación */}
        <motion.div 
          initial={{ opacity: 0, scale: 0, y: 10 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 2.2, type: "spring", bounce: 0.5 }}
          className="absolute bottom-4 right-4 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30"
        >
          <CheckCircle2 size={22} className="text-white" />
        </motion.div>
      </motion.div>

      {/* Texto debajo de la hoja */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4 }}
        className="flex flex-col items-center mt-8"
      >
        <h2 className="text-white font-bold tracking-widest text-sm uppercase">
          Configurando Entorno
        </h2>
        <p className="text-slate-400 text-xs mt-1 animate-pulse">Abriendo tu Currículum Digital...</p>
      </motion.div>
    </motion.div>
  )
}

export default function WorkerLogin() {
  const router = useRouter()
  const supabase = createClient()
  
  // Estados
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [showSplash, setShowSplash] = useState(false)
  
  // Datos del formulario
  const [dni, setDni] = useState('')
  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')

  // 1. Verificar si el DNI ya existe
  const handleCheckDNI = async (e: React.FormEvent) => {
    e.preventDefault()
    if (dni.length !== 8) {
      toast.error('El DNI debe tener exactamente 8 números.')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cv_postulantes')
        .select('id, nombres, apellidos')
        .eq('dni', dni)
        .single()

      if (data) {
        // EL USUARIO EXISTE
        setShowSplash(true)
        
        // Redirigir a ruta dinámica después del Splash (2.8 segundos)
        setTimeout(() => {
          router.push(`/cv/${dni}`)
        }, 3200) 
        
      } else {
        // ES UN USUARIO NUEVO
        setStep(2)
        toast.info('DNI no registrado. Ingresa tus datos para empezar.')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error al conectar. Verifica tu internet.')
    } finally {
      setLoading(false)
    }
  }

  // 2. Crear un usuario nuevo
  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (nombres.length < 2 || apellidos.length < 2) {
      toast.error('Por favor ingresa tus nombres y apellidos completos.')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cv_postulantes')
        .insert([{ dni: dni, nombres: nombres.toUpperCase(), apellidos: apellidos.toUpperCase() }])
        .select()
        .single()

      if (error) throw error

      if (data) {
        setShowSplash(true)
        
        setTimeout(() => {
          router.push(`/cv/${dni}`)
        }, 3200)
      }
    } catch (error) {
      console.error(error)
      toast.error('Hubo un error al crear tu perfil. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <Toaster position="top-center" richColors />

      <AnimatePresence>
        {showSplash && <DocumentSplash />}
      </AnimatePresence>

      {/* Fondo decorativo vibrante */}
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-br from-blue-700 to-blue-500 rounded-b-[3rem] shadow-[0_10px_40px_rgba(37,99,235,0.3)] pointer-events-none"></div>
      
      <div className="z-10 w-full max-w-md mt-10">
        
        {/* LOGO DE LA EMPRESA CON MAYOR CONTRASTE */}
        <div className="flex flex-col items-center justify-center mb-10 text-white relative">
          <div className="absolute inset-0 bg-white/10 blur-xl rounded-full w-32 h-32 mx-auto"></div>
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-3 text-blue-600 relative z-10 border-b-4 border-blue-200">
            <Building size={32} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter drop-shadow-md relative z-10">RUAG</h1>
          <p className="text-blue-100 text-xs font-bold mt-1.5 uppercase tracking-[0.3em] relative z-10">Portal de Talento</p>
        </div>

        {/* TARJETA INTERACTIVA */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200 p-7 sm:p-8 border border-slate-100/50 overflow-hidden relative">
          <AnimatePresence mode="wait">
            
            {/* --- PASO 1: INGRESAR DNI --- */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Acceso Rápido</h2>
                  <p className="text-slate-500 text-sm mt-2 font-medium">Ingresa tu número de DNI para crear o actualizar tu CV.</p>
                </div>

                <form onSubmit={handleCheckDNI} className="space-y-6">
                  <div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <IdCard size={22} />
                      </div>
                      <input
                        type="number"
                        maxLength={8}
                        value={dni}
                        onChange={(e) => setDni(e.target.value.slice(0, 8))}
                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 text-xl font-black tracking-widest focus:bg-white focus:ring-0 focus:border-blue-500 transition-all outline-none"
                        placeholder="76543210"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || dni.length !== 8}
                    className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-blue-600/30"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : 'Continuar'}
                    {!loading && <ArrowRight size={20} />}
                  </button>
                </form>
              </motion.div>
            )}

            {/* --- PASO 2: DATOS NUEVOS (Nombres y Apellidos) --- */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                <div className="text-center mb-6">
                  <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-3">
                    <User size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Bienvenido al equipo</h2>
                  <p className="text-slate-500 text-sm mt-1">Por favor, registra tus nombres completos.</p>
                </div>

                <form onSubmit={handleCreateProfile} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nombres Completos</label>
                    <input
                      type="text"
                      value={nombres}
                      onChange={(e) => setNombres(e.target.value)}
                      className="block w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-900 font-bold focus:bg-white focus:border-blue-500 transition-all outline-none uppercase"
                      placeholder="Ej. JUAN CARLOS"
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Apellidos Completos</label>
                    <input
                      type="text"
                      value={apellidos}
                      onChange={(e) => setApellidos(e.target.value)}
                      className="block w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-900 font-bold focus:bg-white focus:border-blue-500 transition-all outline-none uppercase"
                      placeholder="Ej. PEREZ GOMEZ"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || nombres.length < 2 || apellidos.length < 2}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl mt-4"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : 'Crear mi currículum'}
                    {!loading && <CheckCircle2 size={20} />}
                  </button>

                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-center text-sm font-bold text-slate-400 hover:text-slate-600 py-3 transition-colors"
                  >
                    ← Corregir DNI
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-xs font-semibold text-slate-400 bg-white/50 backdrop-blur-md inline-block px-4 py-2 rounded-full shadow-sm">© 2026 RUAG. Plataforma de Talento Humano.</p>
        </div>
      </div>
    </div>
  )
}