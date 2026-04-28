import React from 'react';
import { 
  Search, 
  HelpCircle, 
  UserCircle, 
  Bell,
  Sun,
  Moon,
  LogOut,
  Languages,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { User } from 'firebase/auth';

interface TopNavProps {
  title: string;
  user: User | null;
  onLogout: () => void;
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

const TopNav: React.FC<TopNavProps> = ({ 
  title, 
  user, 
  onLogout, 
  lang, 
  setLang, 
  isDarkMode, 
  setIsDarkMode,
  onMenuToggle,
  isMenuOpen
}) => {
  const isAr = lang === 'ar';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md flex items-center justify-between px-4 md:px-8 h-20 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuToggle}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 active:scale-95 transition-all"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-white tracking-tight line-clamp-1">{title}</h2>
      </div>

      <div className="flex items-center gap-2 md:gap-8">
        {/* Search Bar */}
        <div className="relative w-96 hidden lg:block">
          <Search size={18} className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold", isAr ? "right-3" : "left-3")} />
          <input 
            type="text" 
            placeholder={isAr ? "ابحث عن عميل بالاسم أو الرقم..." : "Search clients..."} 
            className={cn(
              "w-full py-3 bg-slate-50/80 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/20 focus:bg-white dark:focus:bg-white/10 focus:border-primary outline-none transition-all font-medium dark:text-white",
              isAr ? "pr-10 pl-4" : "pl-10 pr-4"
            )}
          />
        </div>

        <div className="flex items-center gap-1 md:gap-6 border-r border-slate-200 dark:border-white/10 pr-2 md:pr-6">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setLang(isAr ? 'en' : 'ar')}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-black text-xs"
            >
              {isAr ? 'EN' : 'ع'}
            </button>
          </div>

          <button className="relative w-10 h-10 hidden sm:flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0F172A]"></span>
          </button>
          
          <div className="flex items-center gap-1 md:gap-3 cursor-pointer group p-1.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/10">
            {user?.photoURL ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                <UserCircle size={24} />
              </div>
            )}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">
                {user?.displayName || 'المستخدم'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                {isAr ? 'مدير الحساب' : 'Account Admin'}
              </p>
            </div>
            <button 
              onClick={onLogout}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-error transition-all"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
