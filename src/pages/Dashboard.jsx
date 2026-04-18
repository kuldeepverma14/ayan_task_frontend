import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import {
  Users as UsersIcon, Activity, AlertTriangle, TrendingUp, Clock
} from 'lucide-react';
import API_ENDPOINTS from '../api/endpoints';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.DASHBOARD.STATS);
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    }
  };

  const fetchActivity = async (page = 1) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.DASHBOARD.ACTIVITY}?page=${page}&limit=5`);
      setActivities(response.data.data.items);
      setPagination(response.data.data);
    } catch (error) {
      console.error('Failed to fetch activity logs', error);
    }
  };

  const initDashboard = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchActivity(1)]);
    setLoading(false);
  };

  useEffect(() => {
    initDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse font-medium">
        Synchronizing system data...
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: UsersIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Integrity Check', value: '100%', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Activity Control Center</h1>
        <p className="text-slate-500">Real-time overview of your system's security and activity status</p>
      </div>

      {stats?.anomalyCount > 0 && (
        <div className={`p-4 rounded-xl border flex items-center gap-4 ${stats.anomalyCount > 5 ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}>
          <AlertTriangle size={24} className="shrink-0" />
          <div>
            <p className="font-bold">{stats.anomalies}</p>
            <p className="text-sm opacity-90">{stats.anomalyCount} suspicious failed login attempts detected in the last 10 minutes.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col p-2">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock size={20} className="text-primary-600" />
              Live Activity History
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto min-h-[400px]">
            {activities.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {activities.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm transition-all group-hover:rotate-6 ${log.action.includes('FAILURE') ? 'bg-rose-100 text-rose-600' : 'bg-primary-50 text-white'
                        }`}>
                        {log.user?.firstName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          {log.action}
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="text-slate-500 font-medium">{log.entity}</span>
                        </p>
                        <p className="text-[11px] font-medium text-slate-400">{log.user?.email || 'System Operation'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</p>
                      <p className="text-[10px] text-slate-300">{new Date(log.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                <Activity size={32} />
                <p className="text-sm">Waiting for system logs...</p>
              </div>
            )}
          </div>

          <Pagination
            pagination={pagination}
            onPageChange={(page) => fetchActivity(page)}
          />
        </div>

        <div className="bg-primary-600 rounded-2xl p-8 text-white flex flex-col relative overflow-hidden group">
          <TrendingUp size={120} className="absolute -bottom-6 -right-6 text-white/10 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">System Health</h3>
            <p className="text-primary-100 text-sm mb-8 leading-relaxed">
              Your management system is operating at peak performance with zero reported latency.
            </p>
            <div className="space-y-4">
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/5">
                <p className="text-[10px] uppercase font-bold text-primary-200">Database</p>
                <p className="text-lg font-bold">Connected • Stable</p>
              </div>
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/5">
                <p className="text-[10px] uppercase font-bold text-primary-200">Security Engine</p>
                <p className="text-lg font-bold">Active • Locked</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
