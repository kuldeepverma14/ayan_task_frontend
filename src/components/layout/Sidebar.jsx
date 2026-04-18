import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  X, Menu, LogOut
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path, active, isOpen, onClick }) => (
  <Link
    to={path}
    onClick={onClick} // Close sidebar on mobile when clicked
    className={`flex items-center px-4 py-3 my-1 rounded-lg transition-all duration-200 group ${active
      ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
      : 'text-slate-600 hover:bg-primary-50 hover:text-primary-600'
      }`}
  >
    <div className="flex items-center flex-1">
      <Icon size={20} className={active ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
      {isOpen && <span className="ml-3 hover:text-white font-medium whitespace-nowrap">{label}</span>}
    </div>
  </Link>
);

const Sidebar = ({ isOpen, setOpen, modules, onLogout, hasPermission }) => {
  const location = useLocation();

  const handleLinkClick = () => {
    // Auto collapse on mobile when a link is clicked
    if (window.innerWidth < 1024) {
      setOpen(false);
    }
  };

  const filteredModules = modules.map(module => ({
    ...module,
    items: module.items.filter(item => !item.permission || hasPermission(item.permission, 'canView'))
  })).filter(module => module.items.length > 0);
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 w-20'}
        bg-white border-r border-slate-200 flex flex-col
      `}
    >
      <div className="h-16 flex items-center justify-between px-3 border-b border-slate-100 shrink-0">
        {(isOpen || window.innerWidth >= 1024) ? (
          <span className={`text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent ${!isOpen && 'lg:hidden'}`}>
            AdminPro
          </span>
        ) : null}

        {!isOpen && window.innerWidth >= 1024 && (
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold mx-auto">A</div>
        )}

        <button
          onClick={() => setOpen(!isOpen)}
          className="p-1 rounded-md hover:bg-slate-100 text-slate-500 md:block hidden shrink-0"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <button
          onClick={() => setOpen(false)}
          className="p-1 rounded-md hover:bg-slate-100 text-slate-500 lg:hidden shrink-0"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        {filteredModules.map((module, idx) => (
          <div key={idx} className="mb-6">
            {isOpen && (
              <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {module.name}
              </h3>
            )}
            {module.items.map((item) => (
              <SidebarItem
                key={item.path}
                {...item}
                active={location.pathname === item.path}
                isOpen={isOpen}
                onClick={handleLinkClick}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 shrink-0">
        <button
          onClick={onLogout}
          className={`w-full flex items-center px-4 py-3 rounded-lg text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all ${!isOpen && 'lg:justify-center'}`}
        >
          <LogOut size={20} />
          {isOpen && <span className="ml-3 font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
