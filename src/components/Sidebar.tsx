import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  BarChart3, 
  Settings, 
  UserPlus,
  LogOut,
  ReceiptText
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClient: () => void;
  lang: 'ar' | 'en';
  isSuperAdmin?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onAddClient, lang, isSuperAdmin }) => {
  const isAr = lang === 'ar';

  const menuItems = [
    { id: 'dashboard', label: isAr ? 'لوحة التحكم' : 'Dashboard', icon: LayoutDashboard },
    { id: 'contacts', label: isAr ? 'العملاء' : 'Clients', icon: Users },
    { id: 'invoices', label: isAr ? 'الفواتير' : 'Invoices', icon: ReceiptText },
    { id: 'reports', label: isAr ? 'التقارير' : 'Reports', icon: BarChart3 },
    { id: 'settings', label: isAr ? 'الإعدادات' : 'Settings', icon: Settings },
  ];

  if (isSuperAdmin) {
    // Add Subscribers to the menu if super admin
    menuItems.splice(3, 0, { id: 'subscribers', label: isAr ? 'المشتركين' : 'Subscribers', icon: Users });
  }

  return (
    <aside className={cn(
      "fixed top-0 h-screen w-64 border-slate-200 bg-white shadow-[4px_0px_20px_rgba(0,0,0,0.05)] flex flex-col overflow-y-auto z-50 transition-all duration-300",
      isAr ? "right-0 border-l" : "left-0 border-r"
    )}>
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Receipt size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight">
              {isAr ? 'نظام الفواتير' : 'Invoicing Pro'}
            </h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              {isAr ? 'إدارة الأعمال' : 'Business Management'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-bold text-sm",
                isActive 
                  ? "bg-blue-50 text-blue-700 shadow-sm border-r-4 border-blue-600" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon size={20} className={cn("transition-transform", isActive && "scale-110")} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-100">
        <button 
          onClick={onAddClient}
          className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-primary text-white rounded-2xl font-black text-sm active:scale-[0.98] transition-all shadow-xl shadow-primary/20 hover:opacity-90"
        >
          <UserPlus size={18} />
          <span>{isAr ? 'إضافة عميل جديد' : 'New Client'}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
