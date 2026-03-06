'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster, toast } from 'sonner'
import confetti from 'canvas-confetti'
import { 
  User, Briefcase, GraduationCap, FileBadge, 
  Plus, Trash2, UploadCloud, ChevronLeft, Loader2, ImageIcon, FileText, 
  LayoutDashboard, Download, CheckCircle2, FileDown, ShieldCheck, MapPin, 
  Zap, Award, X, Globe, Star, Linkedin, Wand2
} from 'lucide-react'

// --- LIBRERÍAS PARA EL PDF ---
import { Document, Page, Text, View, StyleSheet, Image as PdfImage, pdf, Link } from '@react-pdf/renderer'

// --- ESTILOS DEL PDF (Corregido para evitar desbordamiento y hojas en blanco) ---
const pdfStyles = StyleSheet.create({
  page: { flexDirection: 'row', backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  
  // COLUMNA IZQUIERDA
  leftColumn: { width: '32%', backgroundColor: '#f8fafc', paddingHorizontal: 20, paddingTop: 30, paddingBottom: 20, borderRight: '1px solid #e2e8f0' },
  photoContainer: { alignItems: 'center', marginBottom: 20 },
  photo: { width: 100, height: 100, borderRadius: 50, objectFit: 'cover', marginBottom: 10, border: '3px solid #ffffff' }, // Foto ligeramente más pequeña
  sectionLeft: { marginBottom: 20 },
  titleLeft: { fontSize: 10, fontWeight: 'bold', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: 4, marginBottom: 10, letterSpacing: 1.2 },
  textLeft: { fontSize: 8.5, color: '#475569', marginBottom: 4, lineHeight: 1.3 },
  textLeftBold: { fontSize: 8.5, fontWeight: 'bold', color: '#1e293b', marginBottom: 2 },
  
  skillBlock: { marginBottom: 6 },
  skillHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  skillName: { fontSize: 8.5, color: '#334155', fontWeight: 'bold' },
  barBg: { height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 2 },

  // COLUMNA DERECHA
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

  // ANEXOS
  pageAnexos: { backgroundColor: '#ffffff', padding: 40, fontFamily: 'Helvetica' },
  anexoHeader: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', borderBottom: '2px solid #2563eb', paddingBottom: 10, marginBottom: 20, textTransform: 'uppercase' },
  anexoCard: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 8, marginBottom: 25, border: '1px solid #e2e8f0', alignItems: 'center' },
  anexoTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 4, textAlign: 'center' },
  anexoInst: { fontSize: 11, color: '#64748b', marginBottom: 15, textAlign: 'center' },
  anexoImage: { width: '100%', maxHeight: 450, objectFit: 'contain', border: '1px solid #cbd5e1' },
  anexoLink: { fontSize: 10, color: '#2563eb', marginTop: 15, textDecoration: 'none', fontWeight: 'bold' }
})

// Función inteligente para detectar si una URL es de una imagen
const isImageUrl = (url: string) => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return cleanUrl.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/) != null;
}

const CVPdfDocument = ({ data }: { data: any }) => (
  <Document>
    {/* PÁGINA 1: EL CV PRINCIPAL */}
    <Page size="A4" style={pdfStyles.page}>
      
      {/* COLUMNA IZQUIERDA */}
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
          <View style={pdfStyles.sectionLeft}>
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
          <View style={pdfStyles.sectionLeft}>
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

      {/* COLUMNA DERECHA */}
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
          <View style={pdfStyles.sectionRight}>
            <Text style={pdfStyles.titleRight}>Perfil Profesional</Text>
            <Text style={pdfStyles.textBodyRight}>{data.perfil_profesional}</Text>
          </View>
        )}

        {data.logros && data.logros.length > 0 && (
          <View style={pdfStyles.sectionRight}>
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
            <View key={i} style={pdfStyles.itemBlock}>
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

    {/* PÁGINA(S) DE ANEXOS Y CERTIFICADOS */}
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
              
              {/* SI ES IMAGEN, LA DIBUJA EN EL PDF */}
              {isImage && cert.url_archivo && (
                <PdfImage src={cert.url_archivo} style={pdfStyles.anexoImage} />
              )}
              
              {/* SIEMPRE DEJA EL LINK COMO RESPALDO O SI ES UN PDF */}
              {cert.url_archivo && (
                <Link src={cert.url_archivo} style={pdfStyles.anexoLink}>
                  {isImage ? 'Haz clic aquí para ver archivo original completo' : '📄 HAZ CLIC AQUÍ PARA VER EL ARCHIVO PDF ADJUNTO'}
                </Link>
              )}
            </View>
          )
        })}
      </Page>
    )}
  </Document>
)

const AnimatedSaveButton = ({ onClick, isSaving, isSaved }: { onClick: () => void, isSaving: boolean, isSaved: boolean }) => {
  const buttonStateClass = isSaving || isSaved ? 'is-saving' : '';
  return (
    <div className="relative hidden sm:block">
      <style>{`.btn-uiverse { --primary: #2563eb; --neutral-1: #ffffff; --neutral-2: #f1f5f9; --radius: 12px; cursor: pointer; border-radius: var(--radius); text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1); border: none; box-shadow: 0 0.5px 0.5px 1px rgba(255, 255, 255, 0.2), 0 10px 20px rgba(0, 0, 0, 0.1), 0 4px 5px 0px rgba(0, 0, 0, 0.05); display: flex; align-items: center; justify-content: center; position: relative; transition: all 0.3s ease; min-width: 170px; height: 44px; font-family: inherit; font-size: 14px; font-weight: 700; color: #334155; background: transparent; } .btn-uiverse:hover { transform: scale(1.02); box-shadow: 0 0 1px 2px rgba(255, 255, 255, 0.3), 0 15px 30px rgba(0, 0, 0, 0.15), 0 10px 3px -3px rgba(0, 0, 0, 0.04); } .btn-uiverse:active { transform: scale(1); box-shadow: 0 0 1px 2px rgba(255, 255, 255, 0.3), 0 10px 3px -3px rgba(0, 0, 0, 0.1); } .btn-uiverse:after { content: ""; position: absolute; inset: 0; border-radius: var(--radius); border: 2px solid transparent; background: linear-gradient(var(--neutral-1), var(--neutral-2)) padding-box, linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)) border-box; z-index: 0; transition: all 0.4s ease; } .btn-uiverse:hover::after { transform: scale(1.02, 1.05); box-shadow: inset 0 -1px 3px 0 rgba(255, 255, 255, 1); } .btn-uiverse::before { content: ""; inset: 5px 4px 4px 4px; position: absolute; background: linear-gradient(to top, var(--neutral-1), var(--neutral-2)); border-radius: 30px; filter: blur(0.5px); z-index: 2; } .state p { display: flex; align-items: center; justify-content: center; margin: 0; } .state .icon { position: absolute; left: 0; top: 0; bottom: 0; margin: auto; transform: scale(1); transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; } .state .icon svg { overflow: visible; } .outline { position: absolute; border-radius: inherit; overflow: hidden; z-index: 1; opacity: 0; transition: opacity 0.4s ease; inset: -2px -3.5px; } .outline::before { content: ""; position: absolute; inset: -100%; background: conic-gradient(from 180deg, transparent 60%, #38bdf8 80%, transparent 100%); animation: spin 2s linear infinite; animation-play-state: paused; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .btn-uiverse:hover .outline { opacity: 1; } .btn-uiverse:hover .outline::before { animation-play-state: running; } .state p span { display: block; opacity: 0; animation: slideDown 0.8s ease forwards calc(var(--i) * 0.03s); } .btn-uiverse:hover p span { opacity: 1; animation: wave 0.5s ease forwards calc(var(--i) * 0.02s); } .btn-uiverse.is-saving p span { opacity: 1; animation: disapear 0.6s ease forwards calc(var(--i) * 0.03s); } @keyframes wave { 30% { opacity: 1; transform: translateY(3px) translateX(0) rotate(0); } 50% { opacity: 1; transform: translateY(-2px) translateX(0) rotate(0); color: var(--primary); } 100% { opacity: 1; transform: translateY(0) translateX(0) rotate(0); } } @keyframes slideDown { 0% { opacity: 0; transform: translateY(-15px) translateX(5px) rotate(-90deg); color: var(--primary); filter: blur(5px); } 30% { opacity: 1; transform: translateY(3px) translateX(0) rotate(0); filter: blur(0); } 50% { opacity: 1; transform: translateY(-2px) translateX(0) rotate(0); } 100% { opacity: 1; transform: translateY(0) translateX(0) rotate(0); } } @keyframes disapear { from { opacity: 1; } to { opacity: 0; transform: translateX(5px) translateY(15px); color: var(--primary); filter: blur(5px); } } .state--default .icon svg { animation: land 0.6s ease forwards; } .btn-uiverse:hover .state--default .icon { transform: rotate(45deg) scale(1.1); } .btn-uiverse.is-saving .state--default svg { animation: takeOff 0.8s linear forwards; } .btn-uiverse.is-saving .state--default .icon { transform: rotate(0) scale(1.1); } @keyframes takeOff { 0% { opacity: 1; } 60% { opacity: 1; transform: translateX(50px) rotate(45deg) scale(1.5); } 100% { opacity: 0; transform: translateX(120px) rotate(45deg) scale(0); } } @keyframes land { 0% { transform: translateX(-40px) translateY(20px) rotate(-50deg) scale(1.5); opacity: 0; filter: blur(3px); } 100% { transform: translateX(0) translateY(0) rotate(0); opacity: 1; filter: blur(0); } } .state--default .icon:before { content: ""; position: absolute; top: 50%; height: 2px; width: 0; left: -5px; background: linear-gradient(to right, transparent, rgba(37, 99, 235, 0.5)); } .btn-uiverse.is-saving .state--default .icon:before { animation: contrail 0.8s linear forwards; } @keyframes contrail { 0% { width: 0; opacity: 1; } 8% { width: 10px; } 60% { opacity: 0.7; width: 60px; } 100% { opacity: 0; width: 120px; } } .state { padding-left: 25px; z-index: 2; display: flex; position: relative; } .state--default span:nth-child(7) { margin-right: 5px; } .state--sent { display: none; } .state--sent svg { transform: scale(1.1); margin-right: 6px; } .btn-uiverse.is-saving .state--default { position: absolute; } .btn-uiverse.is-saving .state--sent { display: flex; } .btn-uiverse.is-saving .state--sent span { opacity: 0; animation: slideDown 0.8s ease forwards calc(var(--i) * 0.15s); } .btn-uiverse.is-saving .state--sent .icon svg { opacity: 0; animation: appear 1.2s ease forwards 0.8s; } @keyframes appear { 0% { opacity: 0; transform: scale(3) rotate(-40deg); color: var(--primary); filter: blur(4px); } 30% { opacity: 1; transform: scale(0.6); filter: blur(1px); } 50% { opacity: 1; transform: scale(1.2); filter: blur(0); } 100% { opacity: 1; transform: scale(1); } }`}</style>
      <button className={`btn-uiverse ${buttonStateClass}`} onClick={onClick} disabled={isSaving || isSaved}>
        <div className="outline" />
        <div className="state state--default">
          <div className="icon">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g style={{filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))'}}>
                <path d="M14.2199 21.63C13.0399 21.63 11.3699 20.8 10.0499 16.83L9.32988 14.67L7.16988 13.95C3.20988 12.63 2.37988 10.96 2.37988 9.78001C2.37988 8.61001 3.20988 6.93001 7.16988 5.60001L15.6599 2.77001C17.7799 2.06001 19.5499 2.27001 20.6399 3.35001C21.7299 4.43001 21.9399 6.21001 21.2299 8.33001L18.3999 16.82C17.0699 20.8 15.3999 21.63 14.2199 21.63ZM7.63988 7.03001C4.85988 7.96001 3.86988 9.06001 3.86988 9.78001C3.86988 10.5 4.85988 11.6 7.63988 12.52L10.1599 13.36C10.3799 13.43 10.5599 13.61 10.6299 13.83L11.4699 16.35C12.3899 19.13 13.4999 20.12 14.2199 20.12C14.9399 20.12 16.0399 19.13 16.9699 16.35L19.7999 7.86001C20.3099 6.32001 20.2199 5.06001 19.5699 4.41001C18.9199 3.76001 17.6599 3.68001 16.1299 4.19001L7.63988 7.03001Z" fill="currentColor" />
                <path d="M10.11 14.4C9.92005 14.4 9.73005 14.33 9.58005 14.18C9.29005 13.89 9.29005 13.41 9.58005 13.12L13.16 9.53C13.45 9.24 13.93 9.24 14.22 9.53C14.51 9.82 14.51 10.3 14.22 10.59L10.64 14.18C10.5 14.33 10.3 14.4 10.11 14.4Z" fill="currentColor" />
              </g>
            </svg>
          </div>
          <p>
            {['G','u','a','r','d','a','r','C','V'].map((letter, i) => (
              <span key={i} style={{ '--i': i } as React.CSSProperties} className={i === 6 ? 'mr-1.5' : ''}>{letter}</span>
            ))}
          </p>
        </div>
        <div className="state state--sent">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="1em" width="1em" strokeWidth="0.5px" stroke="black">
              <g style={{filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))'}}>
                <path fill="currentColor" d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z" />
                <path fill="currentColor" d="M10.5795 15.5801C10.3795 15.5801 10.1895 15.5001 10.0495 15.3601L7.21945 12.5301C6.92945 12.2401 6.92945 11.7601 7.21945 11.4701C7.50945 11.1801 7.98945 11.1801 8.27945 11.4701L10.5795 13.7701L15.7195 8.6301C16.0095 8.3401 16.4895 8.3401 16.7795 8.6301C17.0695 8.9201 17.0695 9.4001 16.7795 9.6901L11.1095 15.3601C10.9695 15.5001 10.7795 15.5801 10.5795 15.5801Z" />
              </g>
            </svg>
          </div>
          <p>
            {['¡','G','u','a','r','d','a','d','o','!'].map((letter, i) => (
              <span key={i} style={{ '--i': i + 5 } as React.CSSProperties}>{letter}</span>
            ))}
          </p>
        </div>
      </button>
    </div>
  )
}

// --- LOADER A PANTALLA COMPLETA (CYBER/AI PREMIUM) ---
const MagiaIALoader = () => {
  const [loadingText, setLoadingText] = useState("Procesando documento...");
  
  useEffect(() => {
    const texts = [
      "Leyendo PDF...",
      "Extrayendo experiencia laboral...",
      "Validando educación y títulos...",
      "Identificando competencias clave...",
      "Casi listo..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLoadingText(texts[i]);
      i = (i + 1) % texts.length;
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-lg overflow-hidden"
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" />
      <div className="relative w-48 h-64 border-2 border-blue-500/30 rounded-xl bg-slate-900/50 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.2)]">
        <FileText size={60} className="text-slate-600 opacity-50" />
        <motion.div 
          animate={{ y: [-130, 130] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear", repeatType: "reverse" }}
          className="absolute w-full h-1 bg-blue-400 shadow-[0_0_20px_#60A5FA]"
        />
        <Wand2 size={24} className="absolute top-4 right-4 text-blue-400 animate-pulse" />
      </div>
      <h2 className="mt-10 text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-widest uppercase">
        GEMINI 2.5 FLASH
      </h2>
      <p className="mt-4 text-blue-200/70 font-mono text-sm tracking-widest uppercase animate-pulse">
        {loadingText}
      </p>
    </motion.div>
  )
}

type Experiencia = { id: string, empresa: string, cargo: string, fecha_inicio: string, fecha_fin: string, descripcion: string }
type Educacion = { id: string, institucion: string, titulo: string, nivel: string, anio_inicio: string, anio_fin: string }
type Certificado = { id: string, nombre: string, institucion: string, url_archivo: string }
type Skill = { id: string, nombre: string, nivel: string, porcentaje: number }
type Logro = { id: string, descripcion: string }

export default function ConstructorCV() {
  const params = useParams()
  const router = useRouter()
  const dni = params.dni as string
  const supabase = createClient()

  const [sidebarView, setSidebarView] = useState<'editar' | 'descargar'>('editar')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false) 
  const [uploadingFile, setUploadingFile] = useState(false)
  const [activeTab, setActiveTab] = useState<'perfil' | 'experiencia' | 'educacion' | 'competencias' | 'logros' | 'certificados'>('perfil')

  const [isImportingIA, setIsImportingIA] = useState(false)
  const fileInputIARef = useRef<HTMLInputElement>(null)

  const [perfil, setPerfil] = useState({ id: '', nombres: '', apellidos: '', correo: '', telefono: '', direccion: '', perfil_profesional: '', foto_url: '', titulo_profesional: '', linkedin: '', colegiatura: '' })
  const [experiencias, setExperiencias] = useState<Experiencia[]>([])
  const [educacion, setEducacion] = useState<Educacion[]>([])
  const [certificados, setCertificados] = useState<Certificado[]>([])
  const [software, setSoftware] = useState<Skill[]>([])
  const [idiomas, setIdiomas] = useState<Skill[]>([])
  const [logros, setLogros] = useState<Logro[]>([])
  
  const [newSoftName, setNewSoftName] = useState('')
  const [newSoftLevel, setNewSoftLevel] = useState('Intermedio')
  const [newLangName, setNewLangName] = useState('')
  const [newLangLevel, setNewLangLevel] = useState('Básico')
  const [newLogro, setNewLogro] = useState('')

  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [progresoCV, setProgresoCV] = useState(0)

  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'generating' | 'success'>('idle')

  useEffect(() => { cargarDatos() }, [])

  useEffect(() => {
    let puntos = 0
    if (perfil.telefono) puntos += 10
    if (perfil.correo) puntos += 10
    if (perfil.titulo_profesional) puntos += 10
    if (perfil.perfil_profesional) puntos += 15
    if (perfil.foto_url) puntos += 15
    if (experiencias.length > 0) puntos += 10
    if (educacion.length > 0) puntos += 10
    if (software.length > 0) puntos += 10
    if (logros.length > 0) puntos += 10

    setProgresoCV(puntos > 100 ? 100 : puntos)

    if (puntos >= 100 && progresoCV < 100) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#2563eb', '#10b981', '#f59e0b'] })
    }
  }, [perfil, experiencias, educacion, software, logros])

  const cargarDatos = async () => {
    try {
      const { data, error } = await supabase.from('cv_postulantes').select('*').eq('dni', dni).single()
      if (error) throw error
      if (data) {
        setPerfil({
          id: data.id, nombres: data.nombres, apellidos: data.apellidos, correo: data.correo || '', 
          telefono: data.telefono || '', direccion: data.direccion || '', 
          perfil_profesional: data.perfil_profesional || '', foto_url: data.foto_url || '',
          titulo_profesional: data.titulo_profesional || '', linkedin: data.linkedin || '', colegiatura: data.colegiatura || ''
        })
        setExperiencias(data.experiencias || [])
        setEducacion(data.educacion || [])
        setCertificados(data.certificados || [])
        setSoftware(data.software || [])
        setIdiomas(data.idiomas || [])
        setLogros(data.logros || [])
      }
    } catch (error) {
      toast.error('Error al cargar tu información.')
    } finally {
      setLoading(false)
    }
  }

  const handleImportarConIA = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImportingIA(true)

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
              { text: `Extrae la información de este Curriculum Vitae en formato PDF y devuélvela EXACTAMENTE en el siguiente formato JSON, sin markdown ni comillas extras:
              {
                "nombres": "", "apellidos": "", "correo": "", "telefono": "", "direccion": "",
                "titulo_profesional": "", "perfil_profesional": "", "linkedin": "", "colegiatura": "",
                "experiencias": [{"cargo": "", "empresa": "", "fecha_inicio": "", "fecha_fin": "", "descripcion": ""}],
                "educacion": [{"institucion": "", "titulo": "", "nivel": "Universitario", "anio_inicio": "", "anio_fin": ""}],
                "software": [{"nombre": "", "nivel": "Intermedio", "porcentaje": 60}],
                "idiomas": [{"nombre": "", "nivel": "Básico", "porcentaje": 30}],
                "logros": [{"descripcion": ""}]
              }` },
              { inline_data: { mime_type: "application/pdf", data: base64String } }
            ]
          }]
        })
      })

      const apiResult = await response.json()
      if (apiResult.error) throw new Error(apiResult.error.message)

      let textResult = apiResult.candidates[0].content.parts[0].text
      textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim()
      
      const dataAnalizada = JSON.parse(textResult)

      setPerfil(prev => ({
        ...prev,
        nombres: dataAnalizada.nombres || prev.nombres,
        apellidos: dataAnalizada.apellidos || prev.apellidos,
        correo: dataAnalizada.correo || prev.correo,
        telefono: dataAnalizada.telefono || prev.telefono,
        direccion: dataAnalizada.direccion || prev.direccion,
        titulo_profesional: dataAnalizada.titulo_profesional || prev.titulo_profesional,
        perfil_profesional: dataAnalizada.perfil_profesional || prev.perfil_profesional,
        linkedin: dataAnalizada.linkedin || prev.linkedin,
        colegiatura: dataAnalizada.colegiatura || prev.colegiatura,
      }))

      if (dataAnalizada.experiencias?.length > 0) setExperiencias(dataAnalizada.experiencias.map((e: any) => ({ ...e, id: crypto.randomUUID() })))
      if (dataAnalizada.educacion?.length > 0) setEducacion(dataAnalizada.educacion.map((e: any) => ({ ...e, id: crypto.randomUUID() })))
      if (dataAnalizada.software?.length > 0) setSoftware(dataAnalizada.software.map((e: any) => ({ ...e, id: crypto.randomUUID() })))
      if (dataAnalizada.idiomas?.length > 0) setIdiomas(dataAnalizada.idiomas.map((e: any) => ({ ...e, id: crypto.randomUUID() })))
      if (dataAnalizada.logros?.length > 0) setLogros(dataAnalizada.logros.map((e: any) => ({ ...e, id: crypto.randomUUID() })))

      toast.success("¡Tu CV ha sido importado con éxito! Revisa los datos.")
    } catch (error) {
      console.error(error)
      toast.error("Error al procesar el PDF. Intenta con otro archivo.")
    } finally {
      setIsImportingIA(false)
      if (fileInputIARef.current) fileInputIARef.current.value = ''
    }
  }

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>, tipo: 'foto' | 'certificado', certId?: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingFile(true)
    const toastId = toast.loading(`Subiendo ${tipo === 'foto' ? 'foto' : 'archivo'}...`)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${dni}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${tipo}s/${fileName}`

      const { error: uploadError } = await supabase.storage.from('cv_assets').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('cv_assets').getPublicUrl(filePath)

      if (tipo === 'foto') setPerfil(prev => ({ ...prev, foto_url: publicUrl }))
      else if (tipo === 'certificado' && certId) setCertificados(prev => prev.map(c => c.id === certId ? { ...c, url_archivo: publicUrl } : c))

      toast.success('¡Subido correctamente!', { id: toastId })
    } catch (error) {
      toast.error('Error al subir el archivo.', { id: toastId })
    } finally {
      setUploadingFile(false)
    }
  }

  const handleGuardar = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from('cv_postulantes').update({
        correo: perfil.correo, telefono: perfil.telefono, direccion: perfil.direccion, perfil_profesional: perfil.perfil_profesional,
        foto_url: perfil.foto_url, titulo_profesional: perfil.titulo_profesional, linkedin: perfil.linkedin, colegiatura: perfil.colegiatura,
        experiencias: experiencias, educacion: educacion, certificados: certificados, 
        software: software, idiomas: idiomas, logros: logros, updated_at: new Date().toISOString()
      }).eq('dni', dni)

      if (error) throw error
      setSaved(true)
      toast.success('¡Datos guardados correctamente!')
      setTimeout(() => { setSaving(false); setSaved(false) }, 2000)
    } catch (error) {
      setSaving(false)
      toast.error('Hubo un error al guardar.')
    }
  }

  const descargarMiCV = async () => {
    if (!aceptaTerminos) {
      toast.error('Debes aceptar la política de privacidad.')
      return
    }
    
    setDownloadStatus('generating')
    
    try {
      const fullData = { ...perfil, dni, experiencias, educacion, certificados, software, idiomas, logros }
      const blob = await pdf(<CVPdfDocument data={fullData} />).toBlob()
      const url = URL.createObjectURL(blob)
      
      await new Promise(resolve => setTimeout(resolve, 2000))

      const link = document.createElement('a')
      link.href = url
      link.download = `CV_${perfil.nombres}_${perfil.apellidos}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setDownloadStatus('success')
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 }, zIndex: 9999 })
      
      setTimeout(() => setDownloadStatus('idle'), 3500)

    } catch (error) {
      setDownloadStatus('idle')
      toast.error('Error al generar el PDF')
    }
  }

  const agregarSoftware = () => {
    if (newSoftName.trim()) {
      const pct = newSoftLevel === 'Básico' ? 30 : newSoftLevel === 'Intermedio' ? 60 : newSoftLevel === 'Avanzado' ? 85 : 100;
      setSoftware([...software, { id: crypto.randomUUID(), nombre: newSoftName.trim(), nivel: newSoftLevel, porcentaje: pct }])
      setNewSoftName('')
    }
  }

  const agregarIdioma = () => {
    if (newLangName.trim()) {
      const pct = newLangLevel === 'Básico' ? 30 : newLangLevel === 'Intermedio' ? 60 : newLangLevel === 'Avanzado' ? 85 : 100;
      setIdiomas([...idiomas, { id: crypto.randomUUID(), nombre: newLangName.trim(), nivel: newLangLevel, porcentaje: pct }])
      setNewLangName('')
    }
  }

  const agregarLogro = () => {
    if (newLogro.trim()) {
      setLogros([...logros, { id: crypto.randomUUID(), descripcion: newLogro.trim() }])
      setNewLogro('')
    }
  }

  const distritos = [
    "Callao Cercado", "Bellavista", "Carmen de la Legua", "La Perla", "La Punta", "Ventanilla", "Mi Perú",
    "Lima Cercado", "San Miguel", "Magdalena del Mar", "Pueblo Libre", "Los Olivos", "San Martín de Porres", "San Isidro", "Miraflores", "Surco"
  ]

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-blue-600" size={40} /></div>

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-900 overflow-hidden">
      <Toaster position="top-center" richColors />

      {/* PANTALLA DE CARGA DE IA */}
      <AnimatePresence>
        {isImportingIA && <MagiaIALoader />}
      </AnimatePresence>

      <aside className="w-20 lg:w-64 bg-white border-r border-gray-100 flex flex-col h-full z-20 shadow-sm shrink-0 transition-all">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-100">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md"><FileText size={20}/></div>
          <h1 className="hidden lg:block font-extrabold text-xl ml-3 tracking-tighter text-slate-900">RUAG <span className="font-light text-slate-500">Postulante</span></h1>
        </div>
        <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
          <button onClick={() => setSidebarView('editar')} className={`flex items-center justify-center lg:justify-start gap-4 w-full p-4 rounded-2xl transition-all font-bold text-sm ${sidebarView === 'editar' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-gray-50 hover:text-slate-900'}`}>
            <LayoutDashboard size={20} /><span className="hidden lg:block tracking-tight">Editar Mi CV</span>
          </button>
          <button onClick={() => setSidebarView('descargar')} className={`flex items-center justify-center lg:justify-start gap-4 w-full p-4 rounded-2xl transition-all font-bold text-sm ${sidebarView === 'descargar' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-gray-50 hover:text-slate-900'}`}>
            <Download size={20} /><span className="hidden lg:block tracking-tight">Descargar PDF</span>
          </button>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={() => router.push('/')} className="flex items-center justify-center lg:justify-start gap-3 w-full p-3 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all font-semibold text-sm">
            <ChevronLeft size={18} /><span className="hidden lg:block">Salir</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {sidebarView === 'editar' && (
          <>
            <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-10 flex flex-col">
              <div className="px-6 lg:px-10 h-20 flex items-center justify-between">
                
                <div className="flex flex-col gap-1 w-1/3 md:w-1/4">
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tighter">Constructor de CV</h2>
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner ${progresoCV === 100 ? 'ring-2 ring-emerald-400/50' : ''}`}>
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${progresoCV}%` }} transition={{ type: "spring", bounce: 0.25 }} 
                        className={`h-full rounded-full ${progresoCV === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`}
                      />
                    </div>
                    <motion.span key={progresoCV} initial={{ scale: 1.5, color: '#2563eb' }} animate={{ scale: 1, color: progresoCV === 100 ? '#10b981' : '#94a3b8' }} className="text-xs font-black">
                      {progresoCV}%
                    </motion.span>
                  </div>
                </div>
                
                <AnimatedSaveButton onClick={handleGuardar} isSaving={saving} isSaved={saved} />
                <button onClick={handleGuardar} disabled={saving || saved} className="sm:hidden bg-blue-600 text-white p-3 rounded-xl shadow-md active:scale-95 disabled:opacity-50">
                  {saving ? <Loader2 size={20} className="animate-spin"/> : saved ? <CheckCircle2 size={20}/> : <FileDown size={20}/>}
                </button>
              </div>

              <div className="px-6 lg:px-10 flex overflow-x-auto scrollbar-hide border-t border-gray-50">
                <nav className="flex space-x-6 min-w-max py-1">
                  {[{ id: 'perfil', label: 'Personal', icon: User }, { id: 'experiencia', label: 'Experiencia', icon: Briefcase }, { id: 'educacion', label: 'Educación', icon: GraduationCap }, { id: 'competencias', label: 'Competencias', icon: Zap }, { id: 'logros', label: 'Logros', icon: Award }, { id: 'certificados', label: 'Documentos', icon: FileBadge }].map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`py-3 flex items-center gap-2 text-sm font-bold border-b-2 transition-all ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>
                      <tab.icon size={16} /> {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-thin scrollbar-thumb-gray-200">
              <div className="max-w-4xl mx-auto pb-20 relative">

                {/* BOTÓN MÁGICO DE IA - REDISEÑADO AL ESTILO APPLE/VERCEL */}
                <div className="mb-8 w-full">
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    className="hidden" 
                    ref={fileInputIARef}
                    onChange={handleImportarConIA}
                  />
                  <motion.button 
                    onClick={() => fileInputIARef.current?.click()}
                    disabled={isImportingIA}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative w-full overflow-hidden rounded-[24px] bg-white border border-gray-200 p-1 flex items-center shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Borde Animado (Gradiente que da la vuelta) */}
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,#e2e8f0_0%,#3b82f6_50%,#8b5cf6_100%)] opacity-0 group-hover:opacity-20 animate-[spin_4s_linear_infinite]" />
                    
                    <div className="relative w-full h-full bg-white rounded-[22px] flex flex-col sm:flex-row items-center gap-5 p-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-inner group-hover:scale-110 transition-transform">
                        {isImportingIA ? <Loader2 size={28} className="animate-spin text-blue-500" /> : <Wand2 size={28} />}
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
                          {isImportingIA ? 'La IA está leyendo tu currículum...' : 'Relleno Automático con Inteligencia Artificial'}
                          {!isImportingIA && <span className="bg-blue-100 text-blue-700 text-[10px] uppercase font-black px-2 py-0.5 rounded-md tracking-widest">BETA</span>}
                        </h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {isImportingIA 
                            ? 'Por favor, no cierres esta ventana.' 
                            : 'Sube tu PDF antiguo y Gemini 2.5 completará todo este formulario por ti en segundos.'}
                        </p>
                      </div>

                      <div className="shrink-0 w-full sm:w-auto">
                        <div className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-blue-600 transition-colors shadow-md">
                          <UploadCloud size={18} />
                          {isImportingIA ? 'Subiendo...' : 'Subir mi CV en PDF'}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                </div>

                <AnimatePresence mode="wait">
                  
                  {activeTab === 'perfil' && (
                    <motion.div key="perfil" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                      <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group">
                          <div className="w-28 h-28 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                            {perfil.foto_url ? <img src={perfil.foto_url} alt="Perfil" className="w-full h-full object-cover" /> : <ImageIcon size={40} className="text-gray-300" />}
                          </div>
                          <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2.5 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-colors ring-4 ring-white">
                            <UploadCloud size={16} />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadFile(e, 'foto')} />
                          </label>
                        </div>
                        <div className="text-center sm:text-left flex-1">
                          <h3 className="text-xl font-bold text-slate-900">Fotografía Profesional</h3>
                          <p className="text-sm text-slate-500 mt-1">Sube una foto formal para tu CV.</p>
                        </div>
                      </div>

                      <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nombres</label><input type="text" value={perfil.nombres} readOnly className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-slate-500 font-semibold cursor-not-allowed" /></div>
                          <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Apellidos</label><input type="text" value={perfil.apellidos} readOnly className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-slate-500 font-semibold cursor-not-allowed" /></div>
                          
                          <div className="sm:col-span-2"><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Título Profesional / Oficio</label><input type="text" value={perfil.titulo_profesional} onChange={e => setPerfil({...perfil, titulo_profesional: e.target.value})} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-slate-900 font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-inner" placeholder="Ej. ARQUITECTO SENIOR, INGENIERO CIVIL..."/></div>
                          
                          <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Colegiatura (Opcional)</label><input type="text" value={perfil.colegiatura} onChange={e => setPerfil({...perfil, colegiatura: e.target.value})} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-slate-900 font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-inner" placeholder="Ej. CAP 23538, CIP 12345"/></div>
                          <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Perfil de LinkedIn (Usuario)</label><input type="text" value={perfil.linkedin} onChange={e => setPerfil({...perfil, linkedin: e.target.value})} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-slate-900 font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-inner" placeholder="Ej. alberto-mautino"/></div>
                          
                          <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Celular</label><input type="tel" value={perfil.telefono} onChange={e => setPerfil({...perfil, telefono: e.target.value})} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-slate-900 font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-inner" placeholder="Ej. 987654321"/></div>
                          <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Correo Electrónico</label><input type="email" value={perfil.correo} onChange={e => setPerfil({...perfil, correo: e.target.value})} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-slate-900 font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-inner" placeholder="ejemplo@correo.com"/></div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Distrito de Residencia</label>
                          <div className="relative">
                            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select value={perfil.direccion} onChange={e => setPerfil({...perfil, direccion: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-white border border-gray-200 rounded-2xl text-slate-900 font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-inner appearance-none cursor-pointer">
                              <option value="">Selecciona tu distrito...</option>
                              {distritos.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                        </div>

                        <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Resumen Profesional</label><textarea rows={5} value={perfil.perfil_profesional} onChange={e => setPerfil({...perfil, perfil_profesional: e.target.value})} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-slate-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none shadow-inner" placeholder="Ej. Arquitecto colegiado con más de 10 años de experiencia..."/></div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'experiencia' && (
                    <motion.div key="experiencia" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                      {experiencias.map((exp, index) => (
                        <div key={exp.id} className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm relative group">
                          <button onClick={() => setExperiencias(experiencias.filter(e => e.id !== exp.id))} className="absolute top-6 right-6 p-2.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"><Trash2 size={18} /></button>
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Briefcase size={16}/> Experiencia {index + 1}</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                            <div><label className="block text-xs font-bold text-slate-400 mb-2 ml-1">Cargo Desempeñado</label><input type="text" value={exp.cargo} onChange={e => setExperiencias(experiencias.map(x => x.id === exp.id ? {...x, cargo: e.target.value} : x))} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"/></div>
                            <div><label className="block text-xs font-bold text-slate-400 mb-2 ml-1">Empresa / Obra</label><input type="text" value={exp.empresa} onChange={e => setExperiencias(experiencias.map(x => x.id === exp.id ? {...x, empresa: e.target.value} : x))} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"/></div>
                            <div><label className="block text-xs font-bold text-slate-400 mb-2 ml-1">Mes/Año Inicio</label><input type="text" placeholder="Ej. Agost 2022" value={exp.fecha_inicio} onChange={e => setExperiencias(experiencias.map(x => x.id === exp.id ? {...x, fecha_inicio: e.target.value} : x))} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"/></div>
                            <div><label className="block text-xs font-bold text-slate-400 mb-2 ml-1">Mes/Año Fin (o Actual)</label><input type="text" placeholder="Ej. May 2024 o Actualidad" value={exp.fecha_fin} onChange={e => setExperiencias(experiencias.map(x => x.id === exp.id ? {...x, fecha_fin: e.target.value} : x))} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"/></div>
                          </div>
                          <div><label className="block text-xs font-bold text-slate-400 mb-2 ml-1">Descripción de Funciones</label><textarea rows={3} value={exp.descripcion} onChange={e => setExperiencias(experiencias.map(x => x.id === exp.id ? {...x, descripcion: e.target.value} : x))} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium outline-none focus:border-blue-500 focus:bg-white transition-all resize-none" placeholder="• Responsable de ejecución de obra..."/></div>
                        </div>
                      ))}
                      <button onClick={() => setExperiencias([...experiencias, { id: crypto.randomUUID(), empresa: '', cargo: '', fecha_inicio: '', fecha_fin: '', descripcion: '' }])} className="w-full py-5 border-2 border-dashed border-gray-300 rounded-[2rem] text-slate-500 font-bold flex items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                        <Plus size={20} /> Añadir Experiencia Laboral
                      </button>
                    </motion.div>
                  )}

                  {activeTab === 'educacion' && (
                    <motion.div key="educacion" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                      {educacion.map((edu, index) => (
                        <div key={edu.id} className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm relative group">
                          <button onClick={() => setEducacion(educacion.filter(e => e.id !== edu.id))} className="absolute top-6 right-6 p-2.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"><Trash2 size={18} /></button>
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><GraduationCap size={16}/> Estudio {index + 1}</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div><label className="block text-xs font-bold text-slate-400 mb-2 ml-1">Centro de Estudios</label><input type="text" value={edu.institucion} onChange={e => setEducacion(educacion.map(x => x.id === edu.id ? {...x, institucion: e.target.value} : x))} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all" placeholder="Ej. U. Ricardo Palma"/></div>
                            <div><label className="block text-xs font-bold text-slate-400 mb-2 ml-1">Título / Oficio</label><input type="text" value={edu.titulo} onChange={e => setEducacion(educacion.map(x => x.id === edu.id ? {...x, titulo: e.target.value} : x))} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all" placeholder="Ej. Arquitectura"/></div>
                            <div><label className="block text-xs font-bold text-slate-400 mb-2 ml-1">Nivel</label><select value={edu.nivel} onChange={e => setEducacion(educacion.map(x => x.id === edu.id ? {...x, nivel: e.target.value} : x))} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"><option value="">Seleccionar Nivel</option><option value="Secundaria">Secundaria Completa</option><option value="Tecnico">Técnico Superior</option><option value="Universitario">Universitario</option><option value="Curso Libre">Capacitación</option></select></div>
                            <div className="flex gap-4"><div className="w-1/2"><label className="block text-xs font-bold text-slate-400 mb-2 ml-1">Año Inicio</label><input type="text" value={edu.anio_inicio} onChange={e => setEducacion(educacion.map(x => x.id === edu.id ? {...x, anio_inicio: e.target.value} : x))} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all" placeholder="2005"/></div><div className="w-1/2"><label className="block text-xs font-bold text-slate-400 mb-2 ml-1">Año Fin</label><input type="text" value={edu.anio_fin} onChange={e => setEducacion(educacion.map(x => x.id === edu.id ? {...x, anio_fin: e.target.value} : x))} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all" placeholder="2010"/></div></div>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => setEducacion([...educacion, { id: crypto.randomUUID(), institucion: '', titulo: '', nivel: '', anio_inicio: '', anio_fin: '' }])} className="w-full py-5 border-2 border-dashed border-gray-300 rounded-[2rem] text-slate-500 font-bold flex items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                        <Plus size={20} /> Añadir Estudio o Formación
                      </button>
                    </motion.div>
                  )}

                  {activeTab === 'competencias' && (
                    <motion.div key="competencias" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                      
                      {/* SECCIÓN COMPETENCIAS TÉCNICAS */}
                      <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2"><Zap size={20} className="text-blue-500"/> Competencias Técnicas / Herramientas</h3>
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                          <input type="text" value={newSoftName} onChange={e => setNewSoftName(e.target.value)} placeholder="Ej. AutoCAD, Gestión SSOMA, Soldadura..." className="flex-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none focus:border-blue-500 transition-all"/>
                          <select value={newSoftLevel} onChange={e => setNewSoftLevel(e.target.value)} className="w-full sm:w-40 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none focus:border-blue-500 transition-all cursor-pointer">
                            <option value="Básico">Básico</option>
                            <option value="Intermedio">Intermedio</option>
                            <option value="Avanzado">Avanzado</option>
                            <option value="Experto">Experto</option>
                          </select>
                          <button onClick={agregarSoftware} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors shrink-0">Agregar</button>
                        </div>
                        
                        <div className="space-y-3">
                          {software.map(sw => (
                            <div key={sw.id} className="flex items-center justify-between bg-slate-50 p-3 px-5 rounded-xl border border-slate-100">
                              <div className="w-1/3 font-bold text-slate-700">{sw.nombre}</div>
                              <div className="w-1/3 flex items-center gap-2">
                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${sw.porcentaje}%` }}></div></div>
                                <span className="text-[10px] font-bold text-slate-400 w-16 text-right uppercase">{sw.nivel}</span>
                              </div>
                              <button onClick={() => setSoftware(software.filter(s => s.id !== sw.id))} className="text-red-400 hover:text-red-600 p-1"><X size={16}/></button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SECCIÓN IDIOMAS */}
                      <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2"><Globe size={20} className="text-emerald-500"/> Idiomas</h3>
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                          <input type="text" value={newLangName} onChange={e => setNewLangName(e.target.value)} placeholder="Ej. Inglés, Español..." className="flex-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none focus:border-emerald-500 transition-all"/>
                          <select value={newLangLevel} onChange={e => setNewLangLevel(e.target.value)} className="w-full sm:w-40 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none focus:border-emerald-500 transition-all cursor-pointer">
                            <option value="Básico">Básico</option>
                            <option value="Intermedio">Intermedio</option>
                            <option value="Avanzado">Avanzado</option>
                            <option value="Nativo">Nativo</option>
                          </select>
                          <button onClick={agregarIdioma} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shrink-0">Agregar</button>
                        </div>
                        
                        <div className="space-y-3">
                          {idiomas.map(lang => (
                            <div key={lang.id} className="flex items-center justify-between bg-emerald-50/50 p-3 px-5 rounded-xl border border-emerald-100">
                              <div className="w-1/3 font-bold text-emerald-900">{lang.nombre}</div>
                              <div className="w-1/3 flex items-center gap-2">
                                <div className="h-2 w-full bg-emerald-200 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${lang.porcentaje}%` }}></div></div>
                                <span className="text-[10px] font-bold text-emerald-600 w-16 text-right uppercase">{lang.nivel}</span>
                              </div>
                              <button onClick={() => setIdiomas(idiomas.filter(l => l.id !== lang.id))} className="text-red-400 hover:text-red-600 p-1"><X size={16}/></button>
                            </div>
                          ))}
                        </div>
                      </div>

                    </motion.div>
                  )}

                  {activeTab === 'logros' && (
                    <motion.div key="logros" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 rounded-[2rem] text-white shadow-lg relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 opacity-20"><Star size={150} /></div>
                        <h3 className="text-2xl font-black mb-2 relative z-10">Logros Clave</h3>
                        <p className="text-amber-100 text-sm mb-6 max-w-md relative z-10">Destaca tus principales hitos, coordinaciones o habilidades blandas. (Ej. "Coordinación interdisciplinaria con equipos de ingeniería").</p>
                        
                        <div className="flex gap-3 relative z-10">
                          <input 
                            type="text" value={newLogro} onChange={(e) => setNewLogro(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarLogro() } }}
                            placeholder="Describe un logro..." 
                            className="flex-1 px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 transition-all font-semibold"
                          />
                          <button onClick={agregarLogro} className="bg-white text-orange-600 px-6 py-4 rounded-2xl font-black hover:bg-orange-50 transition-colors shadow-md shrink-0">Agregar</button>
                        </div>
                      </div>

                      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm min-h-[200px] space-y-4">
                        {logros.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                            <Star size={48} className="mb-4 opacity-20" />
                            <p className="font-bold">No has agregado logros clave.</p>
                          </div>
                        ) : (
                          logros.map((logro) => (
                            <motion.div key={logro.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-4 p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                              <div className="mt-1 w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
                              <p className="flex-1 text-sm font-semibold text-slate-700 leading-relaxed">{logro.descripcion}</p>
                              <button onClick={() => setLogros(logros.filter(l => l.id !== logro.id))} className="text-slate-400 hover:text-red-500 transition-colors"><X size={18}/></button>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'certificados' && (
                    <motion.div key="certificados" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                      <div className="bg-blue-50 text-blue-800 p-5 rounded-2xl flex gap-3 text-sm font-medium border border-blue-100"><FileBadge size={20} className="shrink-0 mt-0.5 text-blue-600" /><p>Adjunta fotos o PDFs de tus diplomas y constancias. Aparecerán automáticamente en la sección "Anexos" de tu Currículum generado.</p></div>
                      {certificados.map((cert) => (
                        <div key={cert.id} className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm relative flex flex-col md:flex-row gap-8 items-center">
                          <button onClick={() => setCertificados(certificados.filter(c => c.id !== cert.id))} className="absolute top-6 right-6 p-2.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"><Trash2 size={18} /></button>
                          
                          <div className="w-full md:w-48 shrink-0">
                            {cert.url_archivo ? (
                              <div className="h-32 rounded-2xl border-2 border-emerald-200 bg-emerald-50 flex flex-col items-center justify-center text-emerald-700 relative overflow-hidden group/file">
                                <FileText size={36} className="mb-2 opacity-80" />
                                <span className="text-xs font-bold uppercase tracking-widest">Listo</span>
                                <label className="absolute inset-0 bg-emerald-900/80 flex flex-col items-center justify-center text-white opacity-0 group-hover/file:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm">
                                  <UploadCloud size={24} className="mb-2" />
                                  <span className="text-xs font-bold uppercase tracking-widest">Cambiar</span>
                                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleUploadFile(e, 'certificado', cert.id)} />
                                </label>
                              </div>
                            ) : (
                              <label className="h-32 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 cursor-pointer transition-all">
                                <UploadCloud size={32} className="mb-3" />
                                <span className="text-xs font-bold uppercase tracking-widest">Subir PDF/IMG</span>
                                <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleUploadFile(e, 'certificado', cert.id)} />
                              </label>
                            )}
                          </div>

                          <div className="flex-1 space-y-4 w-full pr-8">
                            <div><label className="block text-xs font-bold text-slate-400 mb-2 ml-1">Nombre del Documento</label><input type="text" value={cert.nombre} onChange={e => setCertificados(certificados.map(x => x.id === cert.id ? {...x, nombre: e.target.value} : x))} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"/></div>
                            <div><label className="block text-xs font-bold text-slate-400 mb-2 ml-1">Institución Emisora</label><input type="text" value={cert.institucion} onChange={e => setCertificados(certificados.map(x => x.id === cert.id ? {...x, institucion: e.target.value} : x))} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"/></div>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => setCertificados([...certificados, { id: crypto.randomUUID(), nombre: '', institucion: '', url_archivo: '' }])} className="w-full py-5 border-2 border-dashed border-gray-300 rounded-[2rem] text-slate-500 font-bold flex items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                        <Plus size={20} /> Añadir Certificado
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}

        {sidebarView === 'descargar' && (
          <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-6 lg:p-10 flex flex-col items-center relative">
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full max-w-2xl bg-white/5 backdrop-blur-3xl rounded-[3rem] p-8 sm:p-12 shadow-2xl border border-white/10 flex flex-col items-center text-center mt-10 relative z-10"
            >
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2.5rem] flex items-center justify-center text-white mb-8 shadow-[0_0_40px_rgba(37,99,235,0.4)] rotate-12">
                <div className="-rotate-12"><FileText size={48} /></div>
              </div>
              
              <h2 className="text-3xl font-black text-white tracking-tight mb-3">Tu Currículum Está Listo</h2>
              <p className="text-slate-400 mb-10 max-w-md">El documento oficial se ha formateado con el diseño corporativo premium. Listo para descargar.</p>

              <div className="bg-black/40 border border-white/5 rounded-3xl p-6 w-full mb-10 text-left flex flex-col sm:flex-row items-center gap-6 shadow-inner">
                {perfil.foto_url ? ( <img src={perfil.foto_url} className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-white/10 shrink-0" /> ) : ( <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center shrink-0"><User size={30} className="text-slate-500"/></div> )}
                <div className="text-center sm:text-left w-full">
                  <h4 className="font-black text-xl text-white uppercase tracking-wide">{perfil.nombres} {perfil.apellidos}</h4>
                  <p className="text-sm text-blue-400 font-mono mt-1 mb-3">DNI: {dni}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <span className="text-[10px] font-bold bg-white/10 text-slate-300 px-3 py-1 rounded-full uppercase border border-white/5">{experiencias.length} Exp.</span>
                    <span className="text-[10px] font-bold bg-white/10 text-slate-300 px-3 py-1 rounded-full uppercase border border-white/5">{educacion.length} Edu.</span>
                    {(software.length > 0 || idiomas.length > 0) && <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full uppercase border border-blue-500/20">{software.length + idiomas.length} Skills</span>}
                    {logros.length > 0 && <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full uppercase border border-amber-500/20">{logros.length} Logros</span>}
                    {certificados.length > 0 && <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full uppercase border border-emerald-500/20">{certificados.length} Anexos</span>}
                  </div>
                </div>
              </div>

              <div className="w-full bg-blue-900/20 border border-blue-500/30 rounded-2xl p-5 mb-10 flex gap-4 text-left cursor-pointer transition-colors hover:bg-blue-900/40" onClick={() => setAceptaTerminos(!aceptaTerminos)}>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 shrink-0 transition-colors mt-0.5 ${aceptaTerminos ? 'bg-blue-500 border-blue-500 text-white' : 'bg-transparent border-blue-500/50 text-transparent'}`}>
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-300 flex items-center gap-1.5"><ShieldCheck size={16}/> Política de Privacidad</h4>
                  <p className="text-xs text-blue-200/60 mt-1.5 leading-relaxed">Declaro bajo juramento que los datos ingresados son verdaderos. Autorizo a RUAG a almacenar mi información para procesos de selección.</p>
                </div>
              </div>

              <motion.button 
                onClick={descargarMiCV}
                disabled={!aceptaTerminos || downloadStatus !== 'idle'}
                animate={{ 
                  width: downloadStatus === 'idle' ? 'auto' : downloadStatus === 'generating' ? '280px' : '220px',
                  scale: downloadStatus === 'generating' ? 0.95 : 1,
                  opacity: (!aceptaTerminos && downloadStatus === 'idle') ? 0.5 : 1 
                }}
                className={`relative font-black text-lg sm:min-w-[280px] h-16 rounded-2xl transition-all duration-300 overflow-hidden shadow-2xl
                  ${downloadStatus === 'idle' ? 'hover:-translate-y-1' : ''}
                  ${downloadStatus === 'success' ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-[#1e293b] border border-white/10'}
                `}
              >
                {downloadStatus === 'generating' && (
                  <motion.div 
                    initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2, ease: "easeInOut" }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-cyan-400"
                  />
                )}

                {downloadStatus === 'idle' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  </div>
                )}

                <div className="relative flex items-center justify-center gap-3 w-full h-full text-white z-10 px-8">
                  <AnimatePresence mode="wait">
                    {downloadStatus === 'idle' && (
                      <motion.div key="idle" initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -15, opacity: 0 }} className="flex items-center gap-3 w-full justify-center">
                        <Download size={22} strokeWidth={2.5} /> DESCARGAR CV OFICIAL
                      </motion.div>
                    )}
                    {downloadStatus === 'generating' && (
                      <motion.div key="generating" initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -15, opacity: 0 }} className="flex items-center gap-3 text-white drop-shadow-md w-full justify-center">
                        <Loader2 size={22} className="animate-spin" /> GENERANDO PDF...
                      </motion.div>
                    )}
                    {downloadStatus === 'success' && (
                      <motion.div key="success" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="flex items-center gap-2 w-full justify-center">
                        <CheckCircle2 size={24} strokeWidth={3} /> ¡COMPLETADO!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}