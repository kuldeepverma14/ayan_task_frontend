import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const Header = ({ user, setSidebarOpen, isSidebarOpen }) => {
  const [isNoteOpen, setNoteOpen] = useState(false);
  const noteRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (noteRef.current && !noteRef.current.contains(event.target)) {
        setNoteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 relative">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md hover:bg-slate-100 text-slate-500 lg:hidden"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={noteRef}>
          <button
            onClick={() => setNoteOpen(!isNoteOpen)}
            className={`p-2 rounded-xl transition-all relative ${isNoteOpen ? 'bg-primary-50 text-primary-600' : 'text-slate-400 hover:text-primary-600 hover:bg-primary-50'}`}
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>

          <NotificationDropdown
            isOpen={isNoteOpen}
            onClose={() => setNoteOpen(false)}
          />
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none mb-1 leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest leading-none">
              {user?.role?.name}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold border-2 border-primary-50 shadow-sm cursor-pointer hover:scale-105 transition-all duration-200 overflow-hidden">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
