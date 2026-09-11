import React, { useState, useEffect } from 'react';
import { Layers, Folder, FolderPlus, Search, Edit, Trash2, CheckCircle2, RefreshCw, X, ChevronRight } from 'lucide-react';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  image: string | null;
  status: string;
  productCount: number;
}

interface CategoriesManagerProps {
  user: any;
  onFilterProductsByCategory?: (catId: number) => void;
}

export const CategoriesManager: React.FC<CategoriesManagerProps> = ({
  user,
  onFilterProductsByCategory,
}) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<any>(null);
  const [formName, setFormName] = useState('');
  const [formParentId, setFormParentId] = useState<number | null>(null);
  const [formDesc, setFormDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/categories/tree', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setCategories(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  const handleOpenAdd = () => {
    setEditCategory(null);
    setFormName('');
    setFormParentId(null);
    setFormDesc('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditCategory(cat);
    setFormName(cat.name);
    setFormParentId(cat.parentId);
    setFormDesc(cat.description || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formName.trim()) return;
    setIsSaving(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: editCategory?.id,
          name: formName.trim(),
          parentId: formParentId,
          description: formDesc.trim(),
          status: 'ACTIVE'
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchCategories();
      } else {
        alert("Error al guardar categoría");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Maestro de Categorías Médicas</h2>
          <p className="text-xs text-gray-500">
            Organización jerárquica de especialidades, equipamiento, insumos e instrumental médico
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCategories}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
            title="Recargar"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md transition flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            Nueva Categoría
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar categoría médica..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs border-none focus:outline-none focus:ring-0 text-gray-800"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="p-3.5">Categoría</th>
              <th className="p-3.5">Slug</th>
              <th className="p-3.5">Jerarquía</th>
              <th className="p-3.5">Productos</th>
              <th className="p-3.5">Estado</th>
              <th className="p-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                  Cargando categorías...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-400">
                  No hay categorías que coincidan.
                </td>
              </tr>
            ) : (
              filtered.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5">
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                      <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                      {cat.name}
                    </div>
                    {cat.description && (
                      <div className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{cat.description}</div>
                    )}
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-gray-500">{cat.slug}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      cat.parentId ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {cat.parentId ? 'Subcategoría' : 'Categoría Principal'}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-gray-900">
                    {Number(cat.productCount).toLocaleString()} productos
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {cat.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition"
                        title="Editar categoría"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onFilterProductsByCategory?.(cat.id)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md font-semibold text-[11px] transition inline-flex items-center gap-1"
                      >
                        Ver <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Añadir / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editCategory ? 'Editar Categoría' : 'Nueva Categoría Médica'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nombre de la Categoría</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Equipos de Diagnóstico Clínico"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Categoría Padre (Opcional)</label>
                <select
                  value={formParentId || ''}
                  onChange={(e) => setFormParentId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Ninguna (Nivel Raíz)</option>
                  {categories.filter(c => !c.parentId && c.id !== editCategory?.id).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Descripción</label>
                <textarea
                  rows={3}
                  placeholder="Breve descripción del alcance..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold"
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
