import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import Pagination from '../components/Pagination';
import { toast } from 'react-hot-toast';
import {
  History, Search, Filter,
  Clock, Download, Loader2,
  User, Globe, RotateCcw
} from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Standardized Pagination State
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 10
  });

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async (pageNum = 1) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: pageNum,
        search,
        action: actionFilter
      }).toString();

      const response = await api.get(`${API_ENDPOINTS.AUDIT.BASE}?${query}`);
      const data = response.data.data;

      setLogs(data.items || []);

      // Ensure we map correctly to the standardized pagination component props
      setPagination({
        total: data.total ?? 0,
        totalPages: data.totalPages ?? 1,
        page: data.page ?? 1,
        limit: data.limit ?? 10
      });

    } catch (error) {
      toast.error('Identity registry sync interrupted');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, actionFilter]);
  const getActionColor = (action) => {
    if (action.includes('CREATE') || action.includes('POST')) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (action.includes('UPDATE') || action.includes('PATCH')) return 'text-amber-600 bg-amber-50 border-amber-100';
    if (action.includes('DELETE')) return 'text-rose-600 bg-rose-50 border-rose-100';
    return 'text-indigo-600 bg-indigo-50 border-indigo-100';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
            <History className="text-indigo-600" size={28} />
            System Audit Trails
          </h1>
          <p className="text-slate-500 text-sm">Real-time immutable administrative history</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Simplified Filter Bar */}
        <div className="p-6 border-b border-slate-50 flex flex-col xl:flex-row gap-4 justify-between bg-slate-50/10">
          <div className="relative group max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search Identity, IP or Operation..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-600/10 focus:ring-4 focus:ring-indigo-50/50 focus:bg-white transition-all text-sm font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="appearance-none bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">All Operations</option>
              <option value="LOGIN">Logins</option>
              <option value="CREATE">Creation</option>
              <option value="UPDATE">Updates</option>
              <option value="DELETE">Deletions</option>
            </select>
            <button
              onClick={() => { setSearch(''); setActionFilter(''); }}
              className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto min-h-[500px]">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-300">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
              <p className="text-xs font-black uppercase tracking-[0.2em] italic text-slate-300">Synchronizing Trails...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrator</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Operation</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Context Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-indigo-50/20 transition-all group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3 text-slate-400">
                        <Clock size={14} />
                        <span className="text-[11px] font-bold text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                          <User size={16} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight">{log.user?.firstName} {log.user?.lastName}</p>
                          <p className="text-[10px] font-medium text-slate-400 mt-1 lowercase">{log.user?.email || 'SYSTEM'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Globe size={14} className="text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-600">{log.ipAddress || 'Internal'}</span>
                      </div>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-8 py-6 bg-white border-t border-slate-50">
          <Pagination
            pagination={pagination}
            onPageChange={(page) => fetchLogs(page)}
          />
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
