import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import Pagination from '../components/Pagination';
import UserModal from '../components/users/UserModal';
import UserPermissionsModal from '../components/users/UserPermissionsModal';
import ConfirmModal from '../components/common/ConfirmModal';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Users as UsersIcon, Plus, Search, Filter, Edit2, 
  Trash2, Loader2, UserCheck, UserX,
  ShieldCheck, Fingerprint, ChevronDown, RotateCcw,
  Lock
} from 'lucide-react';

const Users = () => {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role?.name?.toUpperCase() === 'SUPER_ADMIN';

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 10
  });

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [isPermModalOpen, setPermModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchRoles = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.USERS.ROLES);
      setRoles(res.data.data);
    } catch (error) {
      console.error("Registry roles unreachable");
    }
  };

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page,
        search,
        roleId: roleFilter === 'all' ? '' : roleFilter,
        status: statusFilter === 'all' ? '' : statusFilter
      }).toString();

      const response = await api.get(`${API_ENDPOINTS.USERS.BASE}?${query}`);
      const data = response.data.data;
      
      setUsers(data.items || []);
      setPagination({
        total: data.total ?? 0,
        totalPages: data.totalPages ?? 1,
        page: data.page ?? 1,
        limit: data.limit ?? 10
      });
    } catch (error) {
      toast.error('Identity sync failure');
    } finally {
      setLoading(false);
    }
  };

  const handleManageAccess = (user) => {
    if (!isSuperAdmin) return;
    setSelectedUser(user);
    setPermModalOpen(true);
  };

  const handleEdit = (user) => {
    if (!isSuperAdmin) return;
    setSelectedUser(user);
    setModalOpen(true);
  };

  const openDeleteConfirm = (user) => {
    if (!isSuperAdmin) return;
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser || !isSuperAdmin) return;
    setDeleteModalOpen(false);
    const toastId = toast.loading('Terminating identity record...');
    try {
      await api.delete(API_ENDPOINTS.USERS.DELETE(selectedUser.id));
      toast.success('Account terminated permanently', { id: toastId });
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error('Destruction rejected by system', { id: toastId });
    }
  };

  const toggleStatus = async (user) => {
    if (!isSuperAdmin) return toast.error("Authority Restricted");
    const toastId = toast.loading('Syncing access level...');
    try {
      await api.patch(API_ENDPOINTS.USERS.TOGGLE_STATUS(user.id));
      toast.success(`${user.firstName} status updated!`, { id: toastId });
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error('Revocation failed', { id: toastId });
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(1), 400);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Terminate Identity"
        message={`Are you sure you want to permanently delete the account for ${selectedUser?.firstName} ${selectedUser?.lastName}? This operation is irreversible.`}
        variant="danger"
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tight uppercase">
             <UsersIcon className="text-indigo-600" size={28} />
             Identity Management
          </h1>
          <p className="text-slate-500 text-sm">Centralized registry of authorized administrative profiles</p>
        </div>
        {isSuperAdmin && (
          <button 
            onClick={() => { setSelectedUser(null); setModalOpen(true); }}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl"
          >
            <Plus size={18} />
            <span>Provision Identity</span>
          </button>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-6 flex items-center gap-4 text-indigo-800 shadow-sm border-2 border-dashed">
          <Lock size={20} className="shrink-0" />
          <p className="text-[10px] font-black uppercase tracking-[0.05em]">
            Governance Lockdown: User provisioning and identity modifications are restricted to Super Admins.
          </p>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Filter Bar */}
        <div className="p-6 border-b border-slate-50 flex flex-col xl:flex-row gap-4 justify-between bg-slate-50/10">
          <div className="relative group max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search Identity or Role..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-600/10 focus:ring-4 focus:ring-indigo-50/50 focus:bg-white transition-all text-sm font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
             <select 
               value={roleFilter}
               onChange={(e) => setRoleFilter(e.target.value)}
               className="bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600"
             >
               <option value="all">Authority: All</option>
               {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
             </select>
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600"
             >
               <option value="all">Status: All</option>
               <option value="active">Active</option>
               <option value="revoked">Revoked</option>
             </select>
             <button onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); }} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all">
                <RotateCcw size={18} />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-300">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
              <p className="text-xs font-black uppercase tracking-[0.2em] italic text-slate-300">Identity Sync Active...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrator</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Security Status</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-indigo-50/30 transition-all group">
                    <td className="px-6 py-6 font-bold text-slate-900 uppercase tracking-tight text-xs">
                      {user.firstName} {user.lastName}
                      <p className="text-[10px] font-medium text-slate-400 truncate mt-1 lowercase">{user.email}</p>
                    </td>
                    <td className="px-6 py-6 text-center">
                       <div className="flex flex-col items-center gap-2">
                         <span className="text-[9px] font-black text-indigo-700 uppercase tracking-[0.2em] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">{user.role?.name}</span>
                         <button 
                            onClick={() => toggleStatus(user)}
                            disabled={!isSuperAdmin}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all border font-black text-[9px] uppercase tracking-widest ${user.status ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'} ${isSuperAdmin && 'hover:bg-slate-900 hover:text-white pointer-cursor'}`}
                          >
                            {user.status ? <UserCheck size={12} /> : <UserX size={12} />}
                            <span>{user.status ? 'Active' : 'Revoked'}</span>
                          </button>
                       </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isSuperAdmin && (
                          <>
                            <button onClick={() => handleManageAccess(user)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Authority Overrides"><Fingerprint size={18} /></button>
                            <button onClick={() => handleEdit(user)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Modify Identity"><Edit2 size={18} /></button>
                            <button onClick={() => openDeleteConfirm(user)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Terminate Identity"><Trash2 size={18} /></button>
                          </>
                        )}
                        {!isSuperAdmin && <ShieldCheck size={20} className="text-indigo-200 mx-2" />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-8 py-6 bg-white border-t border-slate-50">
          <Pagination pagination={pagination} onPageChange={(page) => fetchUsers(page)} />
        </div>
      </div>

      <UserModal 
        isOpen={isModalOpen}
        onClose={() => { setModalOpen(false); setSelectedUser(null); }}
        onSuccess={() => fetchUsers(pagination.page)}
        initialData={selectedUser}
      />

      <UserPermissionsModal 
        isOpen={isPermModalOpen}
        onClose={() => { setPermModalOpen(false); setSelectedUser(null); }}
        user={selectedUser}
      />
    </div>
  );
};

export default Users;
