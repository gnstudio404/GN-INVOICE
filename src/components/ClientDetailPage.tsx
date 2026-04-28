import React, { useMemo } from 'react';
import { 
  ArrowRight, 
  Phone, 
  MapPin, 
  Receipt, 
  Wallet, 
  TrendingUp,
  ChevronLeft,
  Search,
  Calendar,
  AlertCircle,
  Clock,
  User,
  Building2,
  Trash2,
  Download
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
}

interface Invoice {
  id: string;
  serialNumber: string;
  invoiceTitle: string;
  totalAmount: number;
  paidAmount?: number;
  status: 'pending' | 'paid' | 'overdue' | 'partially-paid';
  savedAt: string;
  contactId?: string;
}

interface Payment {
  id: string;
  amount: number;
  method: string;
  date: string;
  note?: string;
  contactId: string;
  invoiceId?: string;
}

interface ClientDetailPageProps {
  clientId: string;
  clients: Client[];
  invoices: Invoice[];
  payments: Payment[];
  onBack: () => void;
  onEditInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onDownloadInvoice: (invoice: Invoice) => void;
  onAddInvoice: (client: Client) => void;
  onExport: (clientId: string) => void;
  onMarkAsPaid?: (invoice: Invoice) => void;
  lang?: 'ar' | 'en';
}

const ClientDetailPage: React.FC<ClientDetailPageProps> = ({ 
  clientId, 
  clients, 
  invoices, 
  payments, 
  onBack,
  onEditInvoice,
  onDeleteInvoice,
  onDownloadInvoice,
  onAddInvoice,
  onExport,
  onMarkAsPaid,
  lang = 'ar'
}) => {
  const isAr = lang === 'ar';

  const client = useMemo(() => clients.find(c => c.id === clientId), [clients, clientId]);
  const clientInvoices = useMemo(() => invoices.filter(inv => inv.contactId === clientId).sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()), [invoices, clientId]);
  const clientPayments = useMemo(() => payments.filter(p => p.contactId === clientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [payments, clientId]);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle size={48} className="text-slate-300 mb-4" />
        <h3 className="text-xl font-bold">{isAr ? 'العميل غير موجود' : 'Client Not Found'}</h3>
        <button onClick={onBack} className="mt-4 text-primary font-bold hover:underline">
          {isAr ? 'العودة لقائمة العملاء' : 'Back to Clients'}
        </button>
      </div>
    );
  }

  const totalInvoiced = clientInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalPaid = clientPayments.reduce((acc, p) => acc + p.amount, 0);
  const remainingDebt = client.debt;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white transition-all shadow-sm"
          >
            {isAr ? <ArrowRight size={20} /> : <ArrowRight size={20} className="rotate-180" />}
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">{client.name}</h1>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                client.type === 'company' ? "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              )}>
                {isAr ? (client.type === 'company' ? 'شركة' : 'فرد') : (client.type === 'company' ? 'Company' : 'Individual')}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1"><Phone size={14} /> {client.phone}</span>
              {client.location && <span className="flex items-center gap-1 border-r border-slate-200 dark:border-white/10 pr-4"><MapPin size={14} /> {client.location}</span>}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => onExport(clientId)}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 transition-all font-bold text-sm shadow-sm"
          >
            <Download size={18} />
            <span>{isAr ? 'تصدير الكشف' : 'Export Statement'}</span>
          </button>
          <button 
            onClick={() => onAddInvoice(client)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all font-bold text-sm"
          >
            <Receipt size={18} />
            <span>{isAr ? 'إنشاء فاتورة' : 'Create Invoice'}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <Receipt size={20} />
          </div>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{isAr ? 'إجمالي الفواتير' : 'Total Invoiced'}</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalInvoiced.toLocaleString()} <span className="text-sm font-medium">ج.م</span></h3>
        </div>
        
        <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <TrendingUp size={20} />
          </div>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{isAr ? 'إجمالي المدفوع' : 'Total Paid'}</p>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalPaid.toLocaleString()} <span className="text-sm font-medium">ج.م</span></h3>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl shadow-slate-200 dark:shadow-none">
          <div className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center mb-4">
            <Clock size={20} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'المتبقي (المديونية)' : 'Remaining Debt'}</p>
          <h3 className="text-2xl font-black text-white">{remainingDebt.toLocaleString()} <span className="text-sm font-medium">ج.م</span></h3>
        </div>
      </div>

      {/* Tabs / Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Invoices List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="text-primary" />
              {isAr ? 'الفواتير' : 'Invoices'}
            </h3>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">{clientInvoices.length}</span>
          </div>

          <div className="space-y-4">
            {clientInvoices.length > 0 ? (
              clientInvoices.map(inv => (
                <div key={inv.id} className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:border-primary/20 transition-all shadow-sm group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary/5 transition-all text-slate-400 dark:text-slate-500 group-hover:text-primary">
                        <Receipt size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{inv.invoiceTitle || (isAr ? 'فاتورة بدون عنوان' : 'Untitled Invoice')}</h4>
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-2 mt-1">
                          <span className="font-black text-blue-600">{inv.serialNumber}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/10" />
                          <span>{new Date(inv.savedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                      <div className="text-left md:text-right">
                        <p className="text-lg font-black text-slate-900 dark:text-white whitespace-nowrap">{inv.totalAmount.toLocaleString()} ج.م</p>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          inv.status === 'paid' ? "text-emerald-500" : 
                          inv.status === 'partially-paid' ? "text-orange-500" : 
                          "text-red-500"
                        )}>
                          {isAr ? (
                            inv.status === 'paid' ? 'مدفوعة' : 
                            inv.status === 'partially-paid' ? 'مدفوعة جزئياً' : 
                            'غير مدفوعة'
                          ) : inv.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {inv.status !== 'paid' && onMarkAsPaid && (
                          <button 
                            onClick={() => onMarkAsPaid(inv)}
                            className="p-2 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                            title={isAr ? 'تم الدفع' : 'Mark Paid'}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <Wallet size={18} />
                              <span className="text-[8px] font-black">{isAr ? 'دفع' : 'Pay'}</span>
                            </div>
                          </button>
                        )}
                        <button 
                          onClick={() => onEditInvoice(inv)}
                          className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                          title={isAr ? 'تعديل' : 'Edit'}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <Receipt size={18} />
                            <span className="text-[8px] font-black">{isAr ? 'تعديل' : 'Edit'}</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => onDownloadInvoice(inv)}
                          className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                          title={isAr ? 'تحميل' : 'Download'}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <Download size={18} />
                            <span className="text-[8px] font-black">{isAr ? 'تحميل' : 'Get'}</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => onDeleteInvoice(inv.id)}
                          className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                          title={isAr ? 'حذف' : 'Delete'}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <Trash2 size={18} />
                            <span className="text-[8px] font-black">{isAr ? 'حذف' : 'Del'}</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                <Receipt size={40} className="text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'لا يوجد فواتير مسجلة لهذا العميل' : 'No invoices registered for this client'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payments List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Wallet className="text-emerald-500" />
              {isAr ? 'آخر المدفوعات' : 'Recent Payments'}
            </h3>
          </div>

          <div className="space-y-4">
            {clientPayments.length > 0 ? (
              clientPayments.map(p => (
                <div key={p.id} className="p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <TrendingUp size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{p.amount.toLocaleString()} ج.م</p>
                        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{new Date(p.date).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                      {p.method}
                    </span>
                  </div>
                  {p.note && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 p-2 rounded border border-slate-100 dark:border-white/10">
                      {p.note}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-slate-50/50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                <Wallet size={32} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'لا يوجد دفعات مسجلة' : 'No payments registered'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailPage;
