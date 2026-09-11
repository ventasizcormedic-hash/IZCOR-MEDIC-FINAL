import React, { useState, useEffect } from 'react';
import { Settings, ShieldAlert, Zap, RefreshCw, CheckCircle2, Sliders, Database, HardDrive } from 'lucide-react';

interface SettingsManagerProps {
  user: any;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({ user }) => {
  const [settings, setSettings] = useState<any>({
    scraper: true,
    imports: true,
    catalog: true,
    qualityControl: true,
    autoPublishScore: 85,
    riskThreshold: 'LOW',
    operatingMode: 'AUTO',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const fetchSettings = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/settings/maintenance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSaveMsg(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/settings/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMsg("Configuraciones del sistema guardadas exitosamente.");
      } else {
        alert(data.error || "Error al guardar configuraciones");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al guardar configuración");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Configuración del Sistema &amp; Modo Mantenimiento</h2>
          <p className="text-xs text-gray-500">
            Control de pasarelas operativas, interruptores de contingencia y umbrales de publicación automática
          </p>
        </div>

        <button
          onClick={fetchSettings}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
          title="Recargar configuración"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {saveMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {saveMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Interruptores de Servicio / Modo Mantenimiento */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-gray-900">Pasarelas de Servicio &amp; Contingencia</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-slate-50/50">
              <div>
                <div className="font-bold text-gray-900">Motor de Extracción (Scraper)</div>
                <div className="text-gray-500 text-[11px] mt-0.5">Permite ejecuciones de rastreo y recolección web</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.scraper}
                  onChange={(e) => setSettings({ ...settings, scraper: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-slate-50/50">
              <div>
                <div className="font-bold text-gray-900">Motor Autónomo de Calidad</div>
                <div className="text-gray-500 text-[11px] mt-0.5">Evaluación automática y categorización clínica</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.qualityControl}
                  onChange={(e) => setSettings({ ...settings, qualityControl: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Parámetros de Operación del Catálogo */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-gray-900">Parámetros de Publicación &amp; Auto-Verificación</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                Score Mínimo para Auto-Publicación ({settings.autoPublishScore}%)
              </label>
              <input
                type="range"
                min={60}
                max={98}
                value={settings.autoPublishScore}
                onChange={(e) => setSettings({ ...settings, autoPublishScore: Number(e.target.value) })}
                className="w-full"
              />
              <span className="text-[11px] text-gray-400 block mt-1">
                Productos con score menor requerirán revisión humana obligatoria
              </span>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Modo Operativo del Motor</label>
              <select
                value={settings.operatingMode}
                onChange={(e) => setSettings({ ...settings, operatingMode: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold text-xs"
              >
                <option value="AUTO">AUTO (Operación Plena Autónoma)</option>
                <option value="SAFE_MODE">SAFE_MODE (Revisión antes de publicar)</option>
                <option value="DRY_RUN">DRY_RUN (Simulación sin persistencia)</option>
                <option value="CANARY">CANARY (Despliegue escalonado 10%)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Tolerancia de Riesgo</label>
              <select
                value={settings.riskThreshold}
                onChange={(e) => setSettings({ ...settings, riskThreshold: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold text-xs"
              >
                <option value="LOW">LOW (Estricto Grado Médico)</option>
                <option value="MEDIUM">MEDIUM (Estándar)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
          >
            {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            Guardar Configuración
          </button>
        </div>
      </form>
    </div>
  );
};
