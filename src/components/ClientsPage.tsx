import React from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  User, 
  Phone, 
  MapPin, 
  Edit2, 
  Trash2, 
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Receipt,
  AlertCircle,
  Clock,
  TrendingUp,
  Building2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface Client {
  id: string;
  name: string;
  phone: string;
  location?: string;
  debt: number;
  status: 'debt' | 'regular' | 'pending' | 'critical';
  type: 'individual' | 'company';
  lastActivity?: string;
  invoiceCount?: number;
}

interface ClientsPageProps {
  clients: Client[];
  monthlyCollections: number;
  onAddClient: () => void;
  onSelectClient: (id: string) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

const StatCard = ({ title, value, subValue, trend, trendColor, borderSideColor, isDark = false }: any) => (
  <div className={cn(
    "p-6 rounded-xl shadow-sm border transition-all h-full flex flex-col justify-between",
    isDark ? "bg-inverse-surface text-white" : "bg-white border-slate-100",
    borderSideColor && `border-r-4 ${borderSideColor}`
  )}>
    <p className={cn("text-xs font-semibold uppercase tracking-wider mb-2", isDark ? "text-slate-400" : "text-slate-500")}>
      {title}
    </p>
    <div className="flex items-end justify-between">
      <h2 className={cn("text-3xl font-bold", isDark ? "text-white" : "text-slate-900")}>
        {value}
      </h2>
      <div className="flex flex-col items-end">
        {trend && (
          <span className={cn("text-sm font-bold flex items-center", trendColor)}>
            {trend}
          </span>
        )}
        {subValue && (
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded", isDark ? "text-white/70" : "bg-slate-50 text-slate-500")}>
            {subValue}
          </span>
        )}
      </div>
    </div>
  </div>
);

interface ClientCardProps {
  client: Client;
  onSelect: (id: string) => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onSelect, onEdit, onDelete }) => {
  const statusStyles = {
    debt: "bg-error-container/20 text-error font-bold",
    regular: "bg-secondary-container/20 text-secondary font-bold",
    pending: "bg-orange-100 text-orange-700 font-bold",
    critical: "bg-red-100 text-red-700 font-bold",
  };

  const statusLabels = {
    debt: "مدين (متأخر)",
    regular: "حساب منتظم",
    pending: "بانتظار التحصيل",
    critical: "مدين (حرج)",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(client.id)}
      className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-primary/30 transition-all group cursor-pointer"
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6 w-full lg:w-auto">
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center border",
            client.status === 'regular' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
            client.status === 'debt' || client.status === 'critical' ? "bg-red-50 text-red-600 border-red-100" :
            "bg-blue-50 text-blue-600 border-blue-100"
          )}>
            {client.type === 'company' ? <Building2 size={28} /> : <User size={28} />}
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">{client.name}</h4>
            <div className="flex flex-wrap items-center gap-4 mt-1">
              <div className="flex items-center gap-1 text-slate-500">
                <Phone size={14} />
                <span className="text-sm font-medium tracking-wider">{client.phone}</span>
              </div>
              {client.location && (
                <div className="flex items-center gap-1 text-slate-500">
                  <MapPin size={14} />
                  <span className="text-sm font-medium">{client.location}</span>
                </div>
              )}
              {client.lastActivity && (
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock size={14} />
                  <span className="text-sm font-medium">{client.lastActivity}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-12 w-full lg:w-auto">
          <div className="text-center sm:text-left lg:text-left">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">إجمالي المديونية</p>
            <p className={cn("text-lg font-black", client.debt > 0 ? "text-error" : "text-secondary")}>
              {client.debt.toLocaleString(undefined, { minimumFractionDigits: 2 })} ج.م
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={cn("px-4 py-1.5 rounded-full text-xs font-bold", statusStyles[client.status])}>
              {statusLabels[client.status]}
            </span>
          </div>

          <div className="flex items-center gap-2 pr-0 lg:pr-6 border-r-0 lg:border-r border-slate-100">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(client);
              }}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
            >
              <Edit2 size={18} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(client.id);
              }}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-error hover:bg-error/5 transition-all"
            >
              <Trash2 size={18} />
            </button>
            <button className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ClientsPage: React.FC<ClientsPageProps> = ({ clients, monthlyCollections, onAddClient, onSelectClient, onEditClient, onDeleteClient }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;
  
  const totalDebt = clients.reduce((acc, client) => acc + client.debt, 0);
  const activeClients = clients.length;
  const debtClients = clients.filter(c => c.debt > 0).length;

  const totalPages = Math.max(1, Math.ceil(clients.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedClients = clients.slice(startIndex, startIndex + pageSize);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Dashboard Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="إجمالي العملاء" 
          value={activeClients.toLocaleString()} 
          borderSideColor="border-primary"
        />
        <StatCard 
          title="إجمالي المديونيات" 
          value={totalDebt.toLocaleString(undefined, { minimumFractionDigits: 0 })} 
          subValue="ج.م" 
          borderSideColor="border-error"
        />
        <StatCard 
          title="عملاء مدينون" 
          value={debtClients.toLocaleString()} 
          subValue="بحاجة لتحصيل" 
          borderSideColor="border-orange-500"
        />
        <StatCard 
          title="إجمالي التحصيل الشهر ده" 
          value={monthlyCollections.toLocaleString(undefined, { minimumFractionDigits: 0 })} 
          subValue="ج.م" 
          isDark={true}
        />
      </div>

      {/* Clients List Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">قائمة العملاء النشطين</h3>
          <p className="text-slate-500 mt-1">عرض وتحديث بيانات العملاء والمديونيات الخاصة بهم</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-bold text-sm shadow-sm">
            <Filter size={18} />
            <span>تصفية</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-bold text-sm shadow-sm">
            <Download size={18} />
            <span>تصدير</span>
          </button>
        </div>
      </div>

      {/* Clients List */}
      <div className="space-y-4">
        {paginatedClients.length > 0 ? (
          paginatedClients.map(client => (
            <ClientCard 
              key={client.id} 
              client={client} 
              onSelect={onSelectClient}
              onEdit={onEditClient} 
              onDelete={onDeleteClient} 
            />
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">لا يوجد عملاء مضافين</h3>
            <p className="text-slate-500 mt-1">ابدأ بإضافة أول عميل لك لإدارة مديونياتهم هنا.</p>
            <button 
              onClick={onAddClient}
              className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all"
            >
              إضافة عميل جديد
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">
            عرض {paginatedClients.length} من أصل {clients.length} عملاء
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={20} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all",
                  currentPage === page 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                )}
              >
                {page}
              </button>
            ))}

            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
