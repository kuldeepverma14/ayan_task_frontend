import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import { toast } from 'react-hot-toast';
import {
  Shield, Users, Settings, Save,
  Check, X, ChevronRight, Lock, Loader2, Info,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Roles = () => {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role?.name?.toUpperCase() === 'SUPER_ADMIN';

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissionMatrix, setPermissionMatrix] = useState([]);
  const [allPages, setAllPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.ROLES.BASE);
      setRoles(res.data.data);
    } catch (error) {
      toast.error('Failed to synchronize system roles', { id: 'roles-fetch-error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleDetails = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.ROLES.GET_ONE(id));
      const { role, allPages: systemPages } = res.data.data;

      setSelectedRole(role);
      setAllPages(systemPages);

      const matrix = systemPages.map(page => {
        const existing = role.permissions.find(p => p.pageId === page.id);
        return {
          pageId: page.id,
          pageName: page.name,
          canView: existing?.canView || false,
          canCreate: existing?.canCreate || false,
          canEdit: existing?.canEdit || false,
          canDelete: existing?.canDelete || false,
        };
      });
      setPermissionMatrix(matrix);
    } catch (error) {
      toast.error('Failed to load authority matrix', { id: 'role-details-error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleToggle = (pageId, action) => {
    if (!isSuperAdmin) return;
    setPermissionMatrix(prev => prev.map(item => {
      if (item.pageId === pageId) {
        return { ...item, [action]: !item[action] };
      }
      return item;
    }));
  };

  const savePermissions = async () => {
    if (!selectedRole || !isSuperAdmin) return;
    setSaving(true);
    const syncToastId = toast.loading('Synchronizing security matrix...');
    try {
      await api.post(API_ENDPOINTS.ROLES.UPDATE_PERMISSIONS(selectedRole.id), {
        permissions: permissionMatrix
      });
      toast.success(`${selectedRole.name} authority updated!`, { id: syncToastId });
      fetchRoles();
    } catch (error) {
      toast.error('Governance synchronization failed', { id: syncToastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500 pb-10">
      {/* 1. Role List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden h-fit">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Subordinate Roles</h2>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Shield size={20} />
            </div>
          </div>

          <div className="space-y-2">
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => fetchRoleDetails(role.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${selectedRole?.id === role.id
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-lg shadow-indigo-50'
                  : 'border-slate-50 hover:border-indigo-100 hover:bg-slate-50 text-slate-600'
                  }`}
              >
                <div>
                  <p className="font-black uppercase tracking-widest text-[11px] group-hover:text-indigo-600 transition-colors">
                    {role.name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">{role._count.users} Identities assigned</p>
                </div>
                <ChevronRight size={18} className={selectedRole?.id === role.id ? 'text-indigo-600' : 'text-slate-300'} />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2rem] text-white overflow-hidden relative group shadow-2xl">
          <Shield size={120} className="absolute -bottom-6 -right-6 text-white/10 group-hover:scale-110 transition-transform duration-700" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Authority Note</p>
          <h3 className="text-lg font-bold leading-tight mb-4 uppercase italic">Sovereign Matrix</h3>
          <p className="text-xs font-medium leading-relaxed opacity-80 uppercase tracking-tight">
            {isSuperAdmin
              ? 'You determine the operational boundaries of every subordinate role. Toggle actions across system modules to ensure perfect security.'
              : 'Security visibility mode active. You are viewing the global authority distribution for active administrative roles.'}
          </p>
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedRole ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-300">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-100">
                  <Lock size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">{selectedRole.name} Matrix</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.05em]">Governance mapping for system modules</p>
                </div>
              </div>
              {isSuperAdmin && (
                <button
                  onClick={savePermissions}
                  disabled={saving || loading}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  <span>Synchronize Matrix</span>
                </button>
              )}
            </div>

            <div className="p-8">
              {!isSuperAdmin && (
                <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-3 text-indigo-700 shadow-sm">
                  <ShieldAlert size={20} className="shrink-0" />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                    Read-Only Visibility: Only the Super Admin can modify authority levels or synchronize the security matrix.
                  </p>
                </div>
              )}

              <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-3 rounded-l-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">Module / Path</th>
                      <th className="px-6 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissionMatrix.map(matrix => (
                      <tr key={matrix.pageId} className="group hover:bg-indigo-50/30 transition-all">
                        <td className="px-6 py-4 rounded-l-2xl border-y border-l border-slate-50 border-r-0">
                          <p className="text-xs font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">
                            {matrix.pageName}
                          </p>
                        </td>
                        {['canView'].map(action => (
                          <td key={action} className="px-6 py-4 text-center rounded-r-2xl border-y border-r border-slate-50 border-l-0">
                            <button
                              onClick={() => handleToggle(matrix.pageId, action)}
                              disabled={!isSuperAdmin || selectedRole.name === 'SUPER_ADMIN'}
                              className={`w-9 h-9 rounded-xl mx-auto flex items-center justify-center transition-all border-2 ${matrix[action]
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm'
                                : 'bg-slate-50 text-slate-200 border-slate-100'
                                } ${isSuperAdmin && selectedRole.name !== 'SUPER_ADMIN' && 'hover:scale-110 active:scale-95 hover:bg-white cursor-pointer'} ${!isSuperAdmin && 'cursor-default'}`}
                            >
                              {matrix[action] ? <Check size={16} /> : <X size={16} />}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedRole.name === 'SUPER_ADMIN' && (
                <div className="mt-8 p-5 bg-amber-50 border border-amber-100 rounded-3xl flex gap-4 text-amber-800">
                  <Info size={22} className="shrink-0" />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                    Sovereign Account Notice: The Super Admin role is immutable and possesses absolute authority across all current and future modules by default.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[500px] border-4 border-dashed border-slate-50 rounded-[3rem] flex flex-col items-center justify-center text-slate-200 bg-slate-50/10">
            <Settings size={64} className="mb-4 animate-spin-slow opacity-20" />
            <p className="font-black uppercase tracking-widest text-[10px]">Select a role to visualize authority distribution</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Roles;
