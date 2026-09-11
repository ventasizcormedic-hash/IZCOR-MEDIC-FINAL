import { useState, useRef, DragEvent, ChangeEvent, FormEvent } from 'react';
import { CloudUpload, FileText, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FormData {
  name: string;
  institution: string;
  email: string;
  phone: string;
  description: string;
}

interface FormErrors {
  name?: string;
  institution?: string;
  email?: string;
  phone?: string;
  file?: string;
}

export function Tdr() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    institution: '',
    email: '',
    phone: '',
    description: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  
  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [tdrId, setTdrId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.institution.trim()) newErrors.institution = 'La entidad es obligatoria';
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Correo institucional inválido';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es obligatorio';
    if (!file && !isUploading) newErrors.file = 'Debe adjuntar el archivo TDR';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // --- Drag & Drop Logic ---
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (selectedFile: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.pdf') && !selectedFile.name.endsWith('.docx') && !selectedFile.name.endsWith('.xlsx')) {
      setErrors(prev => ({ ...prev, file: 'Formato no válido. Solo PDF, DOCX o XLSX.' }));
      return;
    }

    if (selectedFile.size > maxSize) {
      setErrors(prev => ({ ...prev, file: 'El archivo excede el límite de 10MB.' }));
      return;
    }

    setFile(selectedFile);
    setErrors(prev => ({ ...prev, file: undefined }));
    // Show local progress animation for UX feedback (does not slow real submission)
    setUploadProgress(0);
    setIsUploading(true);
    const step = () => {
      setUploadProgress(prev => {
        if (prev >= 100) { setIsUploading(false); return 100; }
        return prev + 20;
      });
    };
    const iv = setInterval(() => step(), 80);
    setTimeout(() => clearInterval(iv), 500);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // removed simulateUpload — upload progress is shown inline in processFile


  const handleRemoveFile = () => {
    setFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isUploading) return;

    setIsUploading(true);
    setSubmitError(null);

    try {
      // Convert file to base64 for JSON transport
      let fileBase64: string | null = null;
      let fileName: string | null = null;
      let fileType: string | null = null;
      if (file) {
        fileName = file.name;
        fileType = file.type || 'application/octet-stream';
        fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      const payload = {
        ...formData,
        fileName,
        fileType,
        fileBase64,
      };

      const res = await fetch('/api/tdr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error del servidor (${res.status})`);
      }

      const data = await res.json();
      setTdrId(data.tdrId || data.id || null);
      setIsSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Error de red. Por favor intente nuevamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFile(null);
    setUploadProgress(0);
    setFormData({
      name: '',
      institution: '',
      email: '',
      phone: '',
      description: '',
    });
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isSubmitted) {
    return (
      <main id="tdr-success-view" className="min-h-screen bg-[#F8FAFC] py-20 flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 py-10 bg-white rounded-2xl border border-slate-200/90 shadow-sm text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Expediente TDR Recibido</h2>
          {tdrId && (
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-2 rounded-xl mb-4">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Código de expediente: <span className="font-mono tracking-wider">{tdrId}</span></span>
            </div>
          )}
          <p className="text-sm text-slate-600 mb-8 leading-relaxed">
            Hemos recibido los Términos de Referencia correctamente. Nuestro equipo de ingenieros de licitaciones y proyectos biomédicos evaluará el documento técnico y enviará la propuesta técnica/económica a <strong className="text-slate-900">{formData.email}</strong>.
          </p>
          <div className="space-y-3">
            <button 
              id="btn-tdr-reset"
              onClick={handleReset}
              className="w-full h-12 inline-flex items-center justify-center px-6 bg-[#2C3E50] hover:bg-[#1E2B37] active:bg-[#34495E] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs hover:shadow active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C3E50] cursor-pointer"
            >
              Cargar Otro Documento TDR
            </button>
            <a
              href="https://wa.me/51928130349?text=Hola%20IZCOR%20MEDIC,%20adjunt%C3%A9%20un%20TDR%20para%20revisi%C3%B3n%20t%C3%A9cnica."
              target="_blank"
              rel="noreferrer"
              className="w-full h-12 inline-flex justify-center items-center gap-2 px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs hover:shadow active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Seguimiento Inmediato por WhatsApp
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with whitespace */}
        <div className="max-w-3xl mb-16">
          <span className="text-brand-cyan font-bold tracking-wider uppercase text-sm mb-4 block">Área Institucional</span>
          <h1 className="text-4xl md:text-5xl font-black text-brand-navy mb-6 tracking-tight leading-tight">
            Presentación de Términos de Referencia (TDR)
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Facilitamos el proceso de evaluación para entidades públicas. Adjunte su documento TDR y nuestro equipo de ingenieros comerciales analizará la viabilidad técnica y económica para participar en su proceso de adquisición.
          </p>
        </div>
        
        <div className="bg-white">
          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Form Fields Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
              <div>
                <label htmlFor="tdr-name" className="block text-sm font-bold text-slate-700 mb-2">
                  Nombre del Responsable <span className="text-red-500">*</span>
                </label>
                <input 
                  id="tdr-name"
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-5 py-3.5 rounded-lg border bg-slate-50 focus:bg-white transition-colors focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:border-brand-cyan focus:ring-brand-cyan/20'
                  }`} 
                  placeholder="Ej. Ing. Carlos Mendoza" 
                />
                {errors.name && <p className="mt-2 text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4"/>{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="tdr-institution" className="block text-sm font-bold text-slate-700 mb-2">
                  Entidad Pública <span className="text-red-500">*</span>
                </label>
                <input 
                  id="tdr-institution"
                  type="text" 
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  className={`w-full px-5 py-3.5 rounded-lg border bg-slate-50 focus:bg-white transition-colors focus:outline-none focus:ring-2 ${
                    errors.institution ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:border-brand-cyan focus:ring-brand-cyan/20'
                  }`} 
                  placeholder="Nombre de la Institución / Hospital" 
                />
                {errors.institution && <p className="mt-2 text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4"/>{errors.institution}</p>}
              </div>

              <div>
                <label htmlFor="tdr-email" className="block text-sm font-bold text-slate-700 mb-2">
                  Correo Institucional <span className="text-red-500">*</span>
                </label>
                <input 
                  id="tdr-email"
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-5 py-3.5 rounded-lg border bg-slate-50 focus:bg-white transition-colors focus:outline-none focus:ring-2 ${
                    errors.email ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:border-brand-cyan focus:ring-brand-cyan/20'
                  }`} 
                  placeholder="usuario@entidad.gob.pe" 
                />
                {errors.email && <p className="mt-2 text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4"/>{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="tdr-phone" className="block text-sm font-bold text-slate-700 mb-2">
                  Teléfono de Contacto <span className="text-red-500">*</span>
                </label>
                <input 
                  id="tdr-phone"
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-5 py-3.5 rounded-lg border bg-slate-50 focus:bg-white transition-colors focus:outline-none focus:ring-2 ${
                    errors.phone ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:border-brand-cyan focus:ring-brand-cyan/20'
                  }`} 
                  placeholder="Celular o Anexo" 
                />
                {errors.phone && <p className="mt-2 text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4"/>{errors.phone}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="tdr-description" className="block text-sm font-bold text-slate-700 mb-2">
                  Descripción del Requerimiento (Opcional)
                </label>
                <textarea 
                  id="tdr-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4} 
                  className="w-full px-5 py-3.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white transition-colors focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 resize-none" 
                  placeholder="Breve resumen de los equipos solicitados o consideraciones especiales..."
                ></textarea>
              </div>
            </div>
            
            {/* Upload Section */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-4">
                Documento TDR <span className="text-red-500">*</span>
              </label>
              
              {!file ? (
                <div>
                  <div 
                    id="tdr-dropzone"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                      isDragging 
                        ? 'border-brand-cyan bg-brand-cyan/5 scale-[1.01]' 
                        : errors.file 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
                    }`}
                  >
                    <CloudUpload className={`mx-auto h-12 w-12 mb-4 transition-colors ${isDragging ? 'text-brand-cyan' : 'text-slate-400'}`} strokeWidth={1.5} />
                    <span className="text-brand-navy font-bold text-lg block mb-1">
                      Arrastra tu archivo aquí o haz clic para buscar
                    </span>
                    <span className="text-slate-500 text-sm">
                      Solo PDF, DOCX o XLSX (Max. 10MB)
                    </span>
                  </div>
                  {errors.file && <p className="mt-3 text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4"/>{errors.file}</p>}
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-brand-navy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 truncate pr-4">{file.name}</div>
                      <div className="text-sm text-slate-500 mt-1">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                      
                      {/* Progress Bar */}
                      <AnimatePresence>
                        {isUploading && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3"
                          >
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                              <span>Subiendo archivo...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-brand-cyan transition-all duration-200 ease-out"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  {!isUploading && (
                    <button 
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 ml-4"
                      title="Eliminar archivo"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
              
              <input 
                id="tdr-file-input"
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf,.docx,.xlsx"
              />
            </div>
            
            {/* Submit Action */}
            <div className="pt-6 border-t border-slate-100">
              <button 
                id="btn-submit-tdr"
                type="submit" 
                disabled={isUploading}
                className="w-full md:w-auto h-12 px-10 bg-brand-cyan hover:bg-[#0087a3] active:bg-[#00768e] text-white font-bold rounded-xl transition-all shadow-xs hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none uppercase tracking-wider text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-cyan cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>ENVIANDO TDR...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>ENVIAR TDR INSTITUCIONAL</span>
                  </>
                )}
              </button>
              {submitError && (
                <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
