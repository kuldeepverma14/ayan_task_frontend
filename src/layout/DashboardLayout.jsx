import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import ConfirmModal from '../components/common/ConfirmModal';
import * as LucideIcons from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout, hasPermission, navModules = [] } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    setLogoutModalOpen(false);
    const logoutPromise = logout();
    toast.promise(logoutPromise, {
      loading: 'Ending session...',
      success: 'Logged out!',
      error: 'Logout failed',
    });
    await logoutPromise;
    navigate('/login');
  };

  /**
   * CRASH-PROOF DYNAMIC NAVIGATION
   */
  const dynamicModules = [
    {
      name: 'Central Control',
      items: [
        { label: 'Dashboard Overview', path: '/', icon: LucideIcons.LayoutDashboard, permission: null },
      ]
    },
    ...(navModules?.map(module => ({
      name: module.name,
      items: (module.pages ?? [])
        .filter(page => page.path !== '/')
        .map(page => ({
          label: page.name,
          path: page.path,
          icon: LucideIcons[module.icon] || LucideIcons.Layout,
          permission: page.path
        }))
    })) ?? [])
  ].filter(mod => mod.items.length > 0);

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden relative">
      <ConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Exit"
        message="Are you sure you want to end your current administrative session?"
        variant="warning"
      />

      {isSidebarOpen && window.innerWidth < 1024 && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] transition-opacity animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar 
        isOpen={isSidebarOpen} 
        setOpen={setSidebarOpen} 
        modules={dynamicModules} 
        onLogout={() => setLogoutModalOpen(true)}
        hasPermission={hasPermission} // 🔥 RECONNECTED
      />

      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <Header 
          user={user} 
          setSidebarOpen={setSidebarOpen} 
          isSidebarOpen={isSidebarOpen} 
        />
        
        <section className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {children}
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;
