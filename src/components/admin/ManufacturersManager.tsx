import React, { useState, useEffect } from 'react';
import { Building2, Search, Filter, Globe, Package, Shield, ExternalLink, RefreshCw, ChevronRight } from 'lucide-react';

interface Manufacturer {
  id: number;
  name: string;
  productCount: number;
  country: string;
  status: string;
  qualityScore: number;
  sourcesCount: number;
}

interface ManufacturersManagerProps {
  user: any;
  onFilterProductsByManufacturer?: (mfg: string) => void;
}

export const ManufacturersManager: React.FC<ManufacturersManagerProps> = ({
  user,
  onFilterProductsByManufacturer,
}) => {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchManufacturers = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/manufacturers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setManufacturers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManufacturers();
  }, [user]);

  const filtered = manufacturers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Maestro de Fabricantes</h2>
          <p className="text-xs text-gray-500">
            Control de casas fabricantes, procedencia técnica, volumen de catálogo y calidad de datos
          </p>
        </div>

        <button
          onClick={fetchManufacturers}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
          title="Actualizar listado"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar fabricante por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs border-none focus:outline-none focus:ring-0 text-gray-800"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="p-3.5">Fabricante</th>
              <th className="p-3.5">País Origen</th>
              <th className="p-3.5">Productos Asociados</th>
              <th className="p-3.5">Fuentes de Extracción</th>
              <th className="p-3.5">Calidad Promedio</th>
              <th className="p-3.5">Estado</th>
              <th className="p-3.5 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                  Cargando fabricantes...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-gray-400">
                  No se encontraron fabricantes registrados en el catálogo.
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5">
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                      {m.name}
                    </div>
                  </td>
                  <td className="p-3.5 text-gray-600">{m.country}</td>
                  <td className="p-3.5 font-semibold text-gray-900">{m.productCount.toLocaleString()} items</td>
                  <td className="p-3.5 text-gray-600">{m.sourcesCount} oficial{m.sourcesCount > 1 ? 'es' : ''}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-emerald-600">{m.qualityScore}%</span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {m.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => onFilterProductsByManufacturer?.(m.name)}
                      className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md font-semibold text-[11px] transition inline-flex items-center gap-1"
                    >
                      Ver Productos <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
