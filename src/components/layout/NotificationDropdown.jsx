import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import API_ENDPOINTS from '../../api/endpoints'; // Centralized API List
import Pagination from '../Pagination';
import { toast } from 'react-hot-toast';
import {
  History, Search, Filter,
  ArrowUpRight, Clock, ShieldCheck, X, AlertTriangle
} from 'lucide-react';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 5
  });

  const fetchAlerts = async (page = 1) => {
    setLoading(true);
    try {
      // REQUIREMENT: Use centralized API List
      const url = `${API_ENDPOINTS.DASHBOARD.ACTIVITY}?page=${page}&limit=5&action=LOGIN_FAILURE`;
      const response = await api.get(url);

      const data = response.data.data;
      setAlerts(data.items || []);
      setPagination({
        totalItems: data.totalItems,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        limit: data.limit
      });
    } catch (error) {
      console.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAlerts(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-14 right-0 lg:w-96 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-0 animate-in slide-in-from-top-2 duration-200 z-[60] overflow-hidden">
      <div className="px-4 py-4 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0">
        <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Security Alerts</h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"><X size={14} /></button>
      </div>

      <div className="max-h-80 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-10 text-center"><Clock className="animate-spin inline text-slate-200" size={24} /></div>
        ) : alerts.length === 0 ? (
          <div className="p-10 text-center text-slate-400 font-medium italic text-xs">No active security alerts</div>
        ) : alerts.map(alert => (
          <div key={alert.id} className="p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">Failed login attempt</p>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5">{alert.details ? JSON.parse(alert.details).email : 'Unknown user'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] font-black uppercase text-rose-400 bg-rose-50 px-1.5 py-0.5 rounded">Critical</span>
                  <span className="text-[9px] font-medium text-slate-400">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50/50 scale-[0.85] origin-top border-t border-slate-100">
        <Pagination
          pagination={pagination}
          onPageChange={(page) => fetchAlerts(page)}
        />
      </div>

      <button
        onClick={() => { onClose(); /* Navigate to full logs if needed */ }}
        className="w-full py-3 text-[10px] font-black text-primary-600 uppercase tracking-widest bg-white hover:bg-slate-50 transition-colors border-t border-slate-50"
      >
        View Complete Audit Trail
      </button>
    </div>
  );
};

export default NotificationDropdown;
