import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  Upload, Database, Play, Pause, XCircle, RefreshCw, AlertTriangle, 
  CheckCircle2, Server, DatabaseBackup, ArrowRight, Settings, FileText, ChevronRight
} from 'lucide-react';
import Papa from 'papaparse';

interface MassImportManagerProps {
  user: User | null;
}

export function MassImportManager({ user }: MassImportManagerProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'jobs'>('upload');
  
  // Upload State
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [fieldMap, setFieldMap] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentJob, setCurrentJob] = useState<any>(null);

  // Job Monitoring State
  const [jobs, setJobs] = useState<any[]>([]);
  
  const standardFields = ['name', 'manufacturer', 'model', 'catalogNumber', 'description', 'technicalSpecs', 'category'];

  // Parse CSV Preview
  useEffect(() => {
    if (!file) return;
    
    Papa.parse(file, {
      header: true,
      preview: 5,
      complete: (results) => {
        if (results.meta.fields) {
          setHeaders(results.meta.fields);
          
          // Auto-map simple matches
          const initialMap: Record<string, string> = {};
          results.meta.fields.forEach(h => {
            const lower = h.toLowerCase();
            if (lower.includes('nombre') || lower.includes('name')) initialMap[h] = 'name';
            else if (lower.includes('marca') || lower.includes('fabricante')) initialMap[h] = 'manufacturer';
            else if (lower.includes('modelo') || lower.includes('model')) initialMap[h] = 'model';
            else if (lower.includes('ref') || lower.includes('sku') || lower.includes('catalog')) initialMap[h] = 'catalogNumber';
          });
          setFieldMap(initialMap);
        }
        setPreviewData(results.data);
      }
    });

    // Count total rows without loading everything in memory (stream)
    let rowCount = 0;
    Papa.parse(file, {
      header: true,
      chunk: (results) => {
        rowCount += results.data.length;
      },
      complete: () => {
        setTotalRows(rowCount);
      }
    });

  }, [file]);

  const fetchJobs = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Filter out MASS_IMPORT jobs
        setJobs(data.filter((j: any) => j.jobType === 'MASS_IMPORT'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'jobs') {
      fetchJobs();
      const interval = setInterval(fetchJobs, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, user]);

  const handleStartImportWorkflow = async () => {
    if (!user || !file) return;
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const token = await user.getIdToken();

      // 1. Create Job First
      const createRes = await fetch('/api/admin/imports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ totalItems: totalRows, config: { fieldMap, fileName: file.name } })
      });
      const { job } = await createRes.json();
      setCurrentJob(job);

      // 2. Stream File in Chunks to not blow up memory
      let processed = 0;
      let chunkData: any[] = [];
      const CHUNK_SIZE = 1000;

      Papa.parse(file, {
        header: true,
        chunk: async (results, parser) => {
          parser.pause(); // Pause parser while we upload this chunk

          const mappedChunk = results.data.filter((r: any) => Object.keys(r).length > 0).map((row: any) => {
            const mapped: any = {};
            for (const [csvCol, dbField] of Object.entries(fieldMap)) {
              const fieldName = dbField as string;
              if (fieldName && row[csvCol]) {
                mapped[fieldName] = row[csvCol];
              }
            }
            return { raw: row, mapped };
          });

          if (mappedChunk.length > 0) {
            await fetch(`/api/admin/imports/${job.id}/chunk`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ records: mappedChunk })
            });
            processed += mappedChunk.length;
            setUploadProgress(Math.round((processed / totalRows) * 100));
          }
          parser.resume();
        },
        complete: async () => {
          // 3. Auto-start the job once fully uploaded
          await fetch(`/api/admin/imports/${job.id}/start`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setIsUploading(false);
          setActiveTab('jobs');
        }
      });

    } catch (e) {
      console.error(e);
      setIsUploading(false);
      alert('Error al iniciar la importación.');
    }
  };

  const handleJobAction = async (jobId: number, action: 'start' | 'pause' | 'cancel') => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await fetch(`/api/admin/imports/${jobId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchJobs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DatabaseBackup className="w-6 h-6 text-brand-cyan" />
            <h2 className="text-lg font-black text-[#2C3E50]">Sistema de Importación Masiva (Jobs)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Sube catálogos de cientos de miles de registros sin bloquear el servidor. El procesamiento se divide en lotes con checkpoints automáticos, garantizando que puedas pausar, cancelar y reanudar desde el último punto seguro en caso de fallos.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === 'upload' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Nueva Importación
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${activeTab === 'jobs' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Monitor de Trabajos <span className="bg-brand-cyan text-white px-2 py-0.5 rounded-full text-[10px]">{jobs.length}</span>
        </button>
      </div>

      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
              <Upload className="w-4 h-4 text-brand-cyan" /> 1. Subir Archivo CSV
            </h3>
            <input 
              type="file" 
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-xl file:border-0
                file:text-xs file:font-bold
                file:bg-cyan-50 file:text-cyan-800
                hover:file:bg-cyan-100 transition-colors"
            />
            {totalRows > 0 && (
              <p className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-2 rounded-lg inline-block">
                Archivo analizado. Total registros detectados: {totalRows.toLocaleString()}
              </p>
            )}
          </div>

          {headers.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
                <Settings className="w-4 h-4 text-brand-cyan" /> 2. Mapeo de Campos (Field Mapping)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {headers.map((header) => (
                  <div key={header} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase truncate" title={header}>
                      CSV Col: {header}
                    </label>
                    <select
                      value={fieldMap[header] || ''}
                      onChange={(e) => setFieldMap({ ...fieldMap, [header]: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg text-xs border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-cyan"
                    >
                      <option value="">(Ignorar Columna)</option>
                      {standardFields.map(sf => (
                        <option key={sf} value={sf}>{sf}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {previewData.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-cyan" /> 3. Previsualización (Dry Run / Muestra)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                    <tr>
                      {standardFields.map(sf => <th key={sf} className="py-2 px-3">{sf}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.map((row, idx) => {
                      // Map the preview row
                      const mapped: any = {};
                      for (const [csvCol, dbField] of Object.entries(fieldMap)) {
                        const fieldName = dbField as string;
                        if (fieldName && row[csvCol]) mapped[fieldName] = row[csvCol];
                      }
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          {standardFields.map(sf => (
                            <td key={sf} className="py-2 px-3 truncate max-w-[150px]">{mapped[sf] || '-'}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {totalRows > 0 && (
            <div className="flex items-center justify-end">
              <button
                onClick={handleStartImportWorkflow}
                disabled={isUploading}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Creando Lotes ({uploadProgress}%)...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" /> Iniciar Importación Masiva (Jobs Worker)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200 shadow-xs">
              No hay trabajos de importación recientes.
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-slate-900">Job #{job.id}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      job.status === 'RUNNING' ? 'bg-brand-cyan text-white animate-pulse' :
                      job.status === 'PAUSED' ? 'bg-amber-100 text-amber-800' :
                      job.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      job.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {job.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Creado: {new Date(job.createdAt).toLocaleString()}</span>
                  </div>
                  
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className="bg-brand-cyan h-full transition-all duration-500" style={{ width: `${job.progress || 0}%` }}></div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-600">
                    <span className="text-brand-cyan">Procesados: {job.processedItems} / {job.totalItems}</span>
                    <span className="text-emerald-600">Completados (Checkpoint guardado)</span>
                    {job.errorCount > 0 && <span className="text-red-600">Errores: {job.errorCount}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center border-l border-slate-200 pl-4">
                  {(job.status === 'PAUSED' || job.status === 'PENDING') && (
                    <button onClick={() => handleJobAction(job.id, 'start')} className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors" title="Reanudar">
                      <Play className="w-5 h-5" />
                    </button>
                  )}
                  {job.status === 'RUNNING' && (
                    <button onClick={() => handleJobAction(job.id, 'pause')} className="p-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors" title="Pausar">
                      <Pause className="w-5 h-5" />
                    </button>
                  )}
                  {(job.status === 'RUNNING' || job.status === 'PAUSED' || job.status === 'PENDING') && (
                    <button onClick={() => handleJobAction(job.id, 'cancel')} className="p-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors" title="Cancelar">
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
