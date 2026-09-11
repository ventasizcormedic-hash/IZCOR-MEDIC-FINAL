import React, { useState, useEffect } from 'react';
import { Users, Shield, UserCheck, RefreshCw, Check, X, ShieldAlert, Key } from 'lucide-react';

interface UserRecord {
  id: number;
  uid: string;
  email: string;
  role: string;
  createdAt: string;
}

interface UsersManagerProps {
  user: any;
}

const ROLES_LIST = ['SUPER_ADMIN', 'ADMIN', 'CATALOG_MANAGER', 'QUALITY_ANALYST', 'USER'];

const PERMISSIONS_MATRIX: Record<string, string[]> = {
  SUPER_ADMIN: ['Ver Catálogo', 'Editar Productos', 'Publicar Oficial', 'Gestionar Fuentes', 'Ejecutar Scraper', 'Importaciones Masivas', 'Auditoría & Logs', 'Configuración de Sistema', 'Gestión de Roles'],
  ADMIN: ['Ver Catálogo', 'Editar Productos', 'Publicar Oficial', 'Gestionar Fuentes', 'Ejecutar Scraper', 'Importaciones Masivas', 'Auditoría & Logs', 'Configuración de Sistema'],
  CATALOG_MANAGER: ['Ver Catálogo', 'Editar Productos', 'Publicar Oficial', 'Gestionar Fuentes', 'Importaciones Masivas'],
  QUALITY_ANALYST: ['Ver Catálogo', 'Editar Productos', 'Auditoría & Logs', 'Deduplicación & Revisión'],
  USER: ['Ver Catálogo'],
};

export const UsersManager: React.FC<UsersManagerProps> = ({ user }) => {
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setUsersList(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!user) return;
    setUpdatingId(userId);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        alert("Error al actualizar rol");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Usuarios &amp; Permisos (RBAC)</h2>
          <p className="text-xs text-gray-500">
            Control de accesos basados en roles, administradores autorizados y matriz de privilegios
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
          title="Recargar usuarios"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Lista de Usuarios */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="p-3.5">Usuario / Correo</th>
              <th className="p-3.5">Identificador UID</th>
              <th className="p-3.5">Fecha Registro</th>
              <th className="p-3.5">Rol Actual</th>
              <th className="p-3.5 text-right">Asignar Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                  Cargando usuarios autorizados...
                </td>
              </tr>
            ) : usersList.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-gray-400">
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {u.email.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.email}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-gray-500">
                    {u.uid.substring(0, 14)}...
                  </td>
                  <td className="p-3.5 text-gray-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.role === 'SUPER_ADMIN' || u.role === 'ADMIN'
                        ? 'bg-slate-100 text-[#2C3E50] border border-slate-200'
                        : u.role === 'CATALOG_MANAGER'
                        ? 'bg-cyan-50 text-cyan-800'
                        : u.role === 'QUALITY_ANALYST'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {u.role || 'USER'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <select
                      disabled={updatingId === u.id}
                      value={u.role || 'USER'}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="px-2.5 py-1 border border-gray-300 rounded-md text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                    >
                      {ROLES_LIST.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Matriz de Permisos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Key className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold text-gray-900">Matriz de Privilegios y Capacidades por Rol</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {Object.entries(PERMISSIONS_MATRIX).map(([roleName, perms]) => (
            <div key={roleName} className="p-4 rounded-xl border border-gray-200 bg-slate-50/50 space-y-2">
              <div className="font-bold text-sm text-gray-900 flex items-center justify-between">
                <span>{roleName}</span>
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <ul className="space-y-1 text-gray-600 pt-1">
                {perms.map((p, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
