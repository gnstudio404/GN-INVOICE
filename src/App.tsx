/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { db, auth, googleProvider } from './lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup,
  signInWithRedirect, 
  getRedirectResult,
  signOut, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  getDoc,
  getDocs,
  setDoc,
  orderBy, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  Plus, 
  Trash2, 
  Edit,
  Download, 
  Printer, 
  Upload, 
  CheckCircle2, 
  ChevronRight, 
  FileText, 
  Phone, 
  Briefcase,
  Image as ImageIcon,
  ArrowLeft,
  Sparkles,
  Moon,
  Sun,
  Languages,
  DownloadCloud,
  CloudUpload,
  CloudOff,
  Cloud,
  History,
  Save,
  X,
  Send,
  MessageSquare,
  LayoutDashboard,
  Users,
  Wallet,
  Settings,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  UserPlus,
  Link as LinkIcon,
  TrendingUp,
  UserMinus,
  Clock,
  FileDown,
  ChartPie,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from './lib/utils';

// --- Translations ---

const translations = {
  en: {
    title: "GN Invoice",
    subtitle: "PREMIUM INVOICE BUILDER",
    heroTitle: "Generate Professional Invoices.",
    heroDesc: "Create elegant, high-end electronic invoices for your online services in seconds.",
    invoiceTitle: "Invoice Title",
    invoiceTitleDefault: "Electronic Invoice",
    invoiceTitlePlaceholder: "e.g. Project Development - March 2026",
    businessActivity: "Business Activity",
    customActivity: "Custom Activity Name",
    customActivityPlaceholder: "e.g. Architectural Visualization",
    contactPhone: "Contact Phone",
    phonePlaceholder: "+1 (555) 000-0000",
    serviceProviderLabel: "Service Provider Name",
    serviceProviderPlaceholder: "Your name or business name",
    clientNameLabel: "Client Name (Optional)",
    clientNamePlaceholder: "Recipient name",
    businessLogo: "Business Logo",
    uploadLogo: "Upload your logo",
    logoDesc: "PNG, JPG or SVG up to 2MB",
    changeLogo: "Change Logo",
    invoiceItems: "Invoice Items",
    total: "Total",
    description: "Description",
    price: "Price",
    descPlaceholder: "Service description...",
    addItem: "Add New Item",
    generate: "Generate Invoice",
    generating: "Generating...",
    backToEditor: "Back to Editor",
    editForm: "Edit Form",
    print: "Print",
    download: "Download PDF",
    invoice: "Invoice",
    date: "Date",
    invoiceNo: "Invoice No",
    billedFrom: "Billed From",
    billedTo: "Billed To",
    provider: "Provider",
    client: "Valued Client",
    recipient: "Online Service Recipient",
    amount: "Amount",
    subtotal: "Subtotal",
    totalAmount: "Total Amount",
    thankYou: "Thank you for your business",
    poweredBy: "Powered by GN Invoice Premium",
    downloadPng: "Download PNG",
    history: "Invoice History",
    saveToHistory: "Save to History",
    noHistory: "No saved invoices yet.",
    edit: "Edit",
    delete: "Delete",
    savedAt: "Saved at",
    saveSuccess: "Invoice saved successfully!",
    saveNamePrompt: "Enter invoice name:",
    saveNamePlaceholder: "e.g., March Project",
    reset: "Reset Form",
    resetConfirm: "Are you sure you want to reset the form?",
    support: "Support",
  whatsapp: "WhatsApp",
    telegram: "Telegram",
    allRightsReserved: "All rights reserved. Professional invoicing for the modern digital era.",
    currencySymbol: "$",
    login: "Login with Google",
    logout: "Logout",
    saveError: "Failed to save invoice.",
    saveChanges: "Save Changes",
    deleteSuccess: "Invoice deleted.",
    deleteError: "Failed to delete invoice.",
    dashboard: "Dashboard",
    newInvoice: "New Invoice",
    clients: "Clients",
    ledger: "Ledger/Accounts",
    addClient: "Add New Client",
    clientName: "Client Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    balance: "Balance",
    transactions: "Transactions",
    noClients: "No clients yet.",
    searchClients: "Search clients...",
    totalReceivable: "Total Receivable",
    recentInvoices: "Recent Invoices",
    businessOverview: "Business Overview",
    saveClient: "Save Client",
    remainingAmount: "Remaining Amount",
    paidAmount: "Paid Amount",
    activities: [
      "Software Development",
      "Graphic Design",
      "Digital Marketing",
      "Content Creation",
      "Consulting Services",
      "UI/UX Design",
      "Video Editing",
      "Translation Services",
      "Virtual Assistance",
      "Other (Custom)"
    ]
  },
  ar: {
    title: "GN Invoice",
    subtitle: "منشئ فواتير متميز",
    heroTitle: "أنشئ فواتير احترافية.",
    heroDesc: "أنشئ فواتير إلكترونية أنيقة وعالية الجودة لخدماتك عبر الإنترنت في ثوانٍ.",
    invoiceTitle: "عنوان الفاتورة",
    invoiceTitleDefault: "فاتورة إلكترونية",
    invoiceTitlePlaceholder: "مثال: تطوير المشروع - مارس ٢٠٢٦",
    businessActivity: "نشاط العمل",
    customActivity: "اسم النشاط المخصص",
    customActivityPlaceholder: "مثال: التصميم المعماري",
    contactPhone: "رقم الهاتف",
    phonePlaceholder: "+٩٦٦ ٥٠ ٠٠٠ ٠٠٠٠",
    serviceProviderLabel: "اسم مقدم الخدمة",
    serviceProviderPlaceholder: "اسمك أو اسم عملك",
    clientNameLabel: "اسم العميل (اختياري)",
    clientNamePlaceholder: "اسم المستلم",
    businessLogo: "شعار العمل",
    uploadLogo: "ارفع شعارك",
    logoDesc: "PNG أو JPG أو SVG حتى ٢ ميجابايت",
    changeLogo: "تغيير الشعار",
    invoiceItems: "عناصر الفاتورة",
    total: "الإجمالي",
    description: "الوصف",
    price: "السعر",
    descPlaceholder: "وصف الخدمة...",
    addItem: "إضافة عنصر جديد",
    generate: "إنشاء الفاتورة",
    generating: "جاري الإنشاء...",
    backToEditor: "العودة للمحرر",
    editForm: "تعديل النموذج",
    print: "طباعة",
    download: "تحميل PDF",
    invoice: "فاتورة",
    date: "التاريخ",
    invoiceNo: "رقم الفاتورة",
    billedFrom: "مقدم الخدمة",
    billedTo: "مرسل إليه",
    provider: "مقدم الخدمة",
    client: "عميلنا العزيز",
    recipient: "مستلم الخدمة عبر الإنترنت",
    amount: "المبلغ",
    subtotal: "المجموع الفرعي",
    totalAmount: "المبلغ الإجمالي",
    thankYou: "شكراً لتعاملكم معنا",
    poweredBy: "بدعم من جي إن إنفويس بريميوم",
    downloadPng: "تحميل صورة PNG",
    history: "سجل الفواتير",
    saveToHistory: "حفظ في السجل",
    noHistory: "لا توجد فواتير محفوظة بعد.",
    edit: "تعديل",
    delete: "حذف",
    savedAt: "تم الحفظ في",
    saveSuccess: "تم حفظ الفاتورة بنجاح!",
    saveNamePrompt: "أدخل اسم الفاتورة:",
    saveNamePlaceholder: "مثال: مشروع شهر مارس",
    reset: "إعادة تعيين",
    resetConfirm: "هل أنت متأكد أنك تريد إعادة تعيين النموذج؟",
    support: "الدعم",
  whatsapp: "واتساب",
    telegram: "تلجرام",
    allRightsReserved: "جميع الحقوق محفوظة. فوترة احترافية للعصر الرقمي الحديث.",
    currencySymbol: "$",
    login: "تسجيل الدخول باستخدام جوجل",
    logout: "تسجيل الخروج",
    saveError: "فشل حفظ الفاتورة.",
    saveChanges: "حفظ التغييرات",
    deleteSuccess: "تم حذف الفاتورة.",
    deleteError: "فشل حذف الفاتورة.",
    dashboard: "لوحة التحكم",
    newInvoice: "فاتورة جديدة",
    clients: "العملاء",
    ledger: "دفتر الحسابات",
    addClient: "إضافة عميل جديد",
    clientName: "اسم العميل",
    email: "البريد الإلكتروني",
    phone: "الجوال",
    address: "العنوان",
    balance: "الرصيد",
    transactions: "المعاملات",
    noClients: "لا يوجد عملاء بعد.",
    searchClients: "بحث في العملاء...",
    totalReceivable: "إجمالي المستحقات",
    recentInvoices: "آخر الفواتير",
    businessOverview: "نظرة عامة على العمل",
    saveClient: "حفظ العميل",
    remainingAmount: "المبلغ المتبقي",
    paidAmount: "المبلغ المدفوع",
    activities: [
      "تطوير البرمجيات",
      "التصميم الجرافيكي",
      "التسويق الرقمي",
      "صناعة المحتوى",
      "خدمات استشارية",
      "تصميم واجهة المستخدم",
      "تحرير الفيديو",
      "خدمات الترجمة",
      "مساعد افتراضي",
      "أخرى (مخصص)"
    ]
  }
};

// --- Types ---

interface InvoiceItem {
  id: string;
  description: string;
  price: number;
}

interface InvoiceData {
  id?: string;
  userId?: string;
  contactId?: string;
  serialNumber?: string;
  invoiceTitle: string;
  serviceProvider: string;
  clientName: string;
  activityIndex: number;
  customActivity: string;
  logo: string | null;
  phoneNumber: string;
  telegram?: string;
  whatsapp?: string;
  items: InvoiceItem[];
  totalAmount: number;
  paidAmount?: number;
  status: 'paid' | 'pending' | 'overdue' | 'partially-paid';
  savedAt?: string;
  updatedAt?: any;
}

interface Contact {
  id?: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  totalBalance: number;
  totalPaid: number;
  totalInvoices?: number;
  createdAt?: any;
}

interface Payment {
  id?: string;
  userId?: string;
  contactId: string;
  invoiceId?: string;
  amount: number;
  method: 'cash' | 'bank' | 'card' | 'other';
  date: any;
  note?: string;
}

interface BusinessInfo {
  id?: string;
  name: string;
  phone: string;
  telegram?: string;
  whatsapp?: string;
  logo: string | null;
  activityIndex?: number;
  customActivity?: string;
}

interface Expense {
  id?: string;
  userId?: string;
  category: string;
  amount: number;
  date: any;
  description: string;
}

interface Product {
  id?: string;
  userId?: string;
  name: string;
  quantity: number;
  price: number;
  cost: number;
}

// --- Utilities ---
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

// --- Components ---

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger',
  size?: 'default' | 'sm' | 'lg' | 'icon'
}>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    const variants = {
      primary: "bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] hover:bg-[#F5F5F5] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none dark:bg-[#E2E8F0] dark:text-[#060B16] dark:border-transparent dark:shadow-none dark:active:translate-x-0 dark:active:translate-y-0",
      secondary: "bg-[#F5F5F5] text-[#1A1A1A] border border-[#E5E5E5] hover:bg-[#E5E5E5] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:border-white/10 dark:hover:bg-[#1A2538]",
      outline: "border-2 border-[#1A1A1A] bg-transparent hover:bg-[#F9F9F9] text-[#1A1A1A] dark:border-white/10 dark:text-[#E2E8F0] dark:hover:bg-white/5",
      ghost: "hover:bg-[#F5F5F5] text-[#666666] hover:text-[#1A1A1A] dark:hover:bg-white/5 dark:text-[#94A3B8] dark:hover:text-[#E2E8F0]",
      danger: "text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20",
    };

    const sizes = {
      default: "px-4 py-2.5",
      sm: "px-3 py-1.5 text-xs",
      lg: "px-6 py-3 text-base",
      icon: "p-2",
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-lg border-2 border-[#1A1A1A] bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5 transition-all duration-200 dark:bg-[#060B16] dark:border-white/10 dark:text-[#E2E8F0] dark:focus:border-blue-500/50",
        className
      )}
      {...props}
    />
  )
);

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={cn("text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-[#999999] mb-1.5 block", className)}>
    {children}
  </label>
);

// --- Main App ---

function InvoicePage({ lang, setLang, isDarkMode, setIsDarkMode }: { lang: 'en' | 'ar', setLang: (l: 'en' | 'ar') => void, isDarkMode: boolean, setIsDarkMode: (d: boolean) => void }) {
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);
  const [savedInvoices, setSavedInvoices] = useState<InvoiceData[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'contacts' | 'payments' | 'expenses' | 'profile' | 'subscribers' | 'history'>(() => (localStorage.getItem('gn_active_tab') as any) || 'dashboard');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
  const contactsWithAggregatedDebt = useMemo(() => {
    return contacts.map(contact => {
      const contactInvoices = savedInvoices.filter(i => i.contactId === contact.id);
      const contactPayments = payments.filter(p => p.contactId === contact.id);
      
      const totalInvoiced = contactInvoices.reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0);
      const totalPaidViaPayments = contactPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const totalPaidInvoicesAmount = contactInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0);
      
      const currentTotalPaid = Math.max(contact.totalPaid || 0, totalPaidViaPayments, totalPaidInvoicesAmount);
      const currentTotalInvoiced = Math.max(contact.totalInvoices || 0, totalInvoiced);
      const currentDebt = Math.max(0, currentTotalInvoiced - currentTotalPaid);
      
      return { 
        ...contact, 
        aggregatedDebt: currentDebt,
        totalInvoiced: currentTotalInvoiced,
        totalPaid: currentTotalPaid
      };
    });
  }, [contacts, savedInvoices, payments]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newPaymentData, setNewPaymentData] = useState<Omit<Payment, 'id' | 'userId' | 'date'>>({ contactId: '', amount: 0, method: 'cash' });
  const [newExpenseData, setNewExpenseData] = useState<Omit<Expense, 'id' | 'userId' | 'date'>>({ category: 'Rent', amount: 0, description: '' });
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [lastFirebaseError, setLastFirebaseError] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const ADMIN_EMAIL = "mrmostafash187@gmail.com";

  interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    isApproved: boolean;
    createdAt: any;
    lastLogin: any;
  }
  const [showDebug, setShowDebug] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSavingToFirestore, setIsSavingToFirestore] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveNameInput, setSaveNameInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [newContactData, setNewContactData] = useState({ name: '', phone: '', email: '', address: '' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeSuggestionField, setActiveSuggestionField] = useState<string | null>(null);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const t = translations[lang];

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceTitle: translations[lang].invoiceTitleDefault,
    serviceProvider: '',
    clientName: '',
    activityIndex: 0,
    customActivity: '',
    logo: null,
    phoneNumber: '',
    items: [{ id: generateId(), description: '', price: 0 }],
    totalAmount: 0,
    status: 'pending'
  });

  const total = invoiceData.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Update title when language changes if it hasn't been edited
  useEffect(() => {
    const prevLang = lang === 'en' ? 'ar' : 'en';
    if (invoiceData.invoiceTitle === translations[prevLang].invoiceTitleDefault || invoiceData.invoiceTitle === '') {
      setInvoiceData(prev => ({ ...prev, invoiceTitle: t.invoiceTitleDefault }));
    }
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('gn_active_tab', activeTab);
  }, [activeTab]);

  // Firebase Auth and Firestore listener
  useEffect(() => {
    // 1. Handle redirect result
    const checkRedirect = async () => {
      try {
        await getRedirectResult(auth);
      } catch (error: any) {
        console.error("Redirect auth error:", error);
        setLastFirebaseError(error.message);
      }
    };
    checkRedirect();

    console.log("[Auth] Setting up listener...");
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      console.log("[Auth] State changed:", currentUser ? `User: ${currentUser.email} (${currentUser.uid})` : "No user");
      setUser(currentUser);
      if (!currentUser) {
        setIsApproved(null);
        setIsSuperAdmin(false);
        setAuthLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  // Listen to user profile real-time
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users_profiles", user.uid);
    
    // First, ensure profile exists
    const initProfile = async () => {
      try {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          const isDefaultApproved = user.email === ADMIN_EMAIL;
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'User',
            photoURL: user.photoURL || '',
            isApproved: isDefaultApproved,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
          });
        } else {
          await updateDoc(userRef, { lastLogin: serverTimestamp() });
        }
      } catch (err) {
        console.error("Error initializing profile:", err);
      }
    };

    initProfile();

    const unsubProfile = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setIsApproved(data.isApproved);
        setIsSuperAdmin(user.email === ADMIN_EMAIL);
      }
      setAuthLoading(false);
    }, (err) => {
      console.error("Profile listener error:", err);
      setAuthLoading(false);
    });

    return () => unsubProfile();
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const history = localStorage.getItem('gn_invoice_history');
      if (history) {
        try { setSavedInvoices(JSON.parse(history)); } catch (e) { console.error("Failed to parse history", e); }
      } else { setSavedInvoices([]); }

      const loadedContacts = localStorage.getItem('gn_contacts');
      if (loadedContacts) {
        try { setContacts(JSON.parse(loadedContacts)); } catch (e) { console.error("Failed to parse contacts", e); }
      } else { setContacts([]); }

      const loadedPayments = localStorage.getItem('gn_payments');
      if (loadedPayments) {
        try { setPayments(JSON.parse(loadedPayments)); } catch (e) { console.error("Failed to parse payments", e); }
      } else { setPayments([]); }

      const loadedExpenses = localStorage.getItem('gn_expenses');
      if (loadedExpenses) {
        try { setExpenses(JSON.parse(loadedExpenses)); } catch (e) { console.error("Failed to parse expenses", e); }
      } else { setExpenses([]); }

      return;
    }

    if (!isApproved) return;

    const q = query(
      collection(db, "invoices"),
      where("userId", "==", user.uid)
      // Sorting in React to avoid missing index errors
    );

    const unsubFirestore = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as InvoiceData[];
      
      // Sort manually by savedAt desc
      const sortedDocs = docs.sort((a, b) => {
        const dateA = new Date(a.savedAt || 0).getTime();
        const dateB = new Date(b.savedAt || 0).getTime();
        return dateB - dateA;
      });
      
      setSavedInvoices(sortedDocs);
    }, (error) => {
      console.error("Firestore error:", error);
      setLastFirebaseError(error.message);
      if (error.code === 'permission-denied') {
        console.warn("Permission denied - check your security rules");
      }
    });

    const clientsQuery = query(
      collection(db, "clients"),
      where("userId", "==", user.uid)
      // Removed orderBy to ensure it works even without index
    );

    const unsubContacts = onSnapshot(clientsQuery, (snapshot) => {
      console.log(`[Firestore] onSnapshot triggered for "clients"`);
      console.log(`[Firestore] User UID: ${user.uid}`);
      console.log(`[Firestore] Docs found: ${snapshot.docs.length}`);
      
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`[Firestore] Client Doc:`, doc.id, data);
        return {
          ...data,
          id: doc.id
        };
      }) as Contact[];
      
      setContacts(docs);
    }, (error) => {
      console.error("Clients listener error:", error);
      setLastFirebaseError(error.message);
    });

    const paymentsQuery = query(collection(db, "payments"), where("userId", "==", user.uid));
    const unsubPayments = onSnapshot(paymentsQuery, (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Payment[]);
    }, (error) => console.error("Payments listener error:", error));

    const expensesQuery = query(collection(db, "expenses"), where("userId", "==", user.uid));
    const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Expense[]);
    }, (error) => console.error("Expenses listener error:", error));

    const productsQuery = query(collection(db, "products"), where("userId", "==", user.uid));
    const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Product[]);
    }, (error) => console.error("Products listener error:", error));

    const businessQuery = query(collection(db, "businessInfo"), where("userId", "==", user.uid));
    const unsubBusiness = onSnapshot(businessQuery, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setBusinessInfo({ ...data, id: snapshot.docs[0].id } as BusinessInfo);
        
        // Auto-fill invoice if it's empty
        setInvoiceData(prev => ({
          ...prev,
          serviceProvider: prev.serviceProvider || data.name || '',
          phoneNumber: prev.phoneNumber || data.phone || '',
          telegram: prev.telegram || data.telegram || '',
          whatsapp: prev.whatsapp || data.whatsapp || '',
          logo: prev.logo || data.logo || null,
          activityIndex: prev.activityIndex || data.activityIndex || 0,
          customActivity: prev.customActivity || data.customActivity || ''
        }));
      }
    }, (error) => console.error("Business info listener error:", error));

    return () => {
      unsubFirestore();
      unsubContacts();
      unsubPayments();
      unsubExpenses();
      unsubProducts();
      unsubBusiness();
    };
  }, [user, authLoading, isApproved]);

  // Fetch all users for super admin
  useEffect(() => {
    if (!isSuperAdmin || !user) return;

    const q = query(collection(db, "users_profiles"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const users = snap.docs.map(doc => ({ ...doc.data(), uid: doc.id })) as UserProfile[];
      setAllUsers(users);
    }, (err) => {
      console.error("Error fetching users:", err);
    });

    return () => unsub();
  }, [isSuperAdmin, user]);

  // Persist Builder State for guest
  useEffect(() => {
    if (!authLoading && !user) {
      localStorage.setItem('gn_builder_data', JSON.stringify(invoiceData));
      if (businessInfo) {
        localStorage.setItem('gn_business_info', JSON.stringify(businessInfo));
      }
    }
  }, [invoiceData, businessInfo, user, authLoading]);

  useEffect(() => {
    if (!authLoading && !user) {
      const savedBuilderData = localStorage.getItem('gn_builder_data');
      if (savedBuilderData) {
        try { setInvoiceData(JSON.parse(savedBuilderData)); } catch(e) {}
      }
      
      const savedBusinessInfo = localStorage.getItem('gn_business_info');
      if (savedBusinessInfo) {
        try {
          const info = JSON.parse(savedBusinessInfo);
          setBusinessInfo(info);
          setInvoiceData(prev => ({
            ...prev,
            serviceProvider: prev.serviceProvider || info.name || '',
            phoneNumber: prev.phoneNumber || info.phone || '',
            logo: prev.logo || info.logo || null,
            activityIndex: prev.activityIndex || info.activityIndex || 0,
            customActivity: prev.customActivity || info.customActivity || ''
          }));
        } catch(e) {}
      }
    }
  }, [user, authLoading]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    console.log("[InvoicePage] Starting Google Login...");
    try {
      // Try popup first
      console.log("[InvoicePage] Attempting popup auth...");
      await signInWithPopup(auth, googleProvider);
      console.log("[InvoicePage] Popup auth success.");
    } catch (error: any) {
      console.error("[InvoicePage] Popup login error:", error);
      
      const isBlocked = error.code === 'auth/popup-blocked';
      const isClosed = error.code === 'auth/popup-closed-by-user';

      // Fallback to redirect if blocked or closed
      if (isBlocked || isClosed) {
        console.log(`[InvoicePage] Popup was ${isBlocked ? 'blocked' : 'closed'}. Falling back to redirect...`);
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr: any) {
          console.error("[InvoicePage] Redirect login error:", redirectErr);
          alert(lang === 'ar' ? 'فشل تسجيل الدخول: ' + redirectErr.message : 'Login failed: ' + redirectErr.message);
          setIsLoggingIn(false);
        }
      } else if (error.code === 'auth/unauthorized-domain') {
        alert(lang === 'ar' ? 'هذا النطاق غير مصرح به في Firebase Console.' : 'This domain is not authorized in Firebase Console.');
        setIsLoggingIn(false);
      } else {
        alert(lang === 'ar' ? 'فشل تسجيل الدخول: ' + error.message : 'Login failed: ' + error.message);
        setIsLoggingIn(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getRecentSuggestions = (field: string, value: string) => {
    if (!value.trim()) return [];
    
    const suggestions = new Set<string>();
    savedInvoices.forEach(inv => {
      if (field === 'description') {
        inv.items.forEach(item => {
          if (item.description.toLowerCase().includes(value.toLowerCase())) {
            suggestions.add(item.description);
          }
        });
      } else {
        const val = (inv as any)[field];
        if (typeof val === 'string' && val.toLowerCase().includes(value.toLowerCase())) {
          suggestions.add(val);
        }
      }
    });
    return Array.from(suggestions).slice(0, 5);
  };

  const handleFieldChangeWithSuggestions = (field: string, value: string, itemIndex?: number) => {
    if (itemIndex !== undefined) {
      handleItemChange(invoiceData.items[itemIndex].id, 'description', value);
      setActiveItemIndex(itemIndex);
    } else {
      setInvoiceData(prev => {
        const updated = { ...prev, [field]: value };
        if (field === 'clientName') {
          // Try to automatically find and link an existing contact if name matches exactly
          const matchingContact = contacts.find(c => c.name.toLowerCase() === value.toLowerCase());
          updated.contactId = matchingContact?.id;
        }
        return updated;
      });
      if (field === 'invoiceTitle') {
        setSaveNameInput(value);
      }
    }
    
    setActiveSuggestionField(field);
    setFilteredSuggestions(getRecentSuggestions(field, value));
  };

  const selectSuggestion = (value: string) => {
    if (activeSuggestionField === 'description' && activeItemIndex !== null) {
      handleItemChange(invoiceData.items[activeItemIndex].id, 'description', value);
    } else if (activeSuggestionField) {
      setInvoiceData(prev => {
        const updated = { ...prev, [activeSuggestionField]: value };
        if (activeSuggestionField === 'clientName') {
          const matchingContact = contacts.find(c => c.name.toLowerCase() === value.toLowerCase());
          updated.contactId = matchingContact?.id;
        }
        return updated;
      });
    }
    setActiveSuggestionField(null);
    setFilteredSuggestions([]);
  };

  const openSaveModal = () => {
    const defaultTitle = invoiceData.invoiceTitle || (lang === 'ar' ? translations.ar.invoiceTitleDefault : translations.en.invoiceTitleDefault);
    setSaveNameInput(defaultTitle);
    setShowSaveModal(true);
  };

  const handleEditInvoice = (invoice: InvoiceData) => {
    setInvoiceData({
      ...invoice,
      // Ensure all fields are present to avoid controlled/uncontrolled input issues
      items: invoice.items || [{ id: generateId(), description: '', price: 0 }]
    });
    setActiveTab('invoices');
    setIsPreviewMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveToHistory = async () => {
    // If we're editing an invoice, we might want to keep its current title if saveNameInput is empty
    const finalTitle = saveNameInput.trim() || invoiceData.invoiceTitle || (lang === 'ar' ? translations.ar.invoiceTitleDefault : translations.en.invoiceTitleDefault);
    const isNewInvoice = !invoiceData.id;
    const currentId = invoiceData.id || generateId();
    
    // Generate serial number for new invoices
    let serialNumber = invoiceData.serialNumber;
    if (!serialNumber) {
      const lastSerial = savedInvoices.length > 0 
        ? Math.max(...savedInvoices.map(inv => {
            const match = inv.serialNumber?.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          }), 0)
        : 0;
      serialNumber = `INV-${String(lastSerial + 1).padStart(4, '0')}`;
    }

    const invoiceToSave: InvoiceData = {
      ...invoiceData,
      id: currentId,
      serialNumber,
      invoiceTitle: finalTitle,
      totalAmount: total,
      savedAt: new Date().toISOString()
    };

    setInvoiceData(invoiceToSave);
    setShowSaveModal(false);

    if (!user) {
      console.log("[Local] Saving invoice locally (Guest Mode)");
      setSavedInvoices(prev => {
        const exists = prev.findIndex(inv => inv.id === currentId);
        let updated;
        if (exists !== -1) {
          updated = [...prev];
          updated[exists] = invoiceToSave;
        } else {
          updated = [invoiceToSave, ...prev];
        }
        localStorage.setItem('gn_invoice_history', JSON.stringify(updated));
        return updated;
      });

      // Update contact balance and create payment record for guest
      if (invoiceToSave.contactId) {
        setContacts(prev => {
          const updated = prev.map(c => {
            if (c.id === invoiceToSave.contactId) {
              const isPaid = invoiceToSave.status === 'paid';
              const isPartial = invoiceToSave.status === 'partially-paid';
              const paidAmount = isPaid ? total : (isPartial ? (invoiceToSave.paidAmount || 0) : 0);
              const remainingAmount = total - paidAmount;
              
              return { 
                ...c, 
                totalInvoices: (c.totalInvoices || 0) + total,
                totalPaid: (c.totalPaid || 0) + paidAmount,
                totalBalance: (c.totalBalance || 0) + remainingAmount
              };
            }
            return c;
          });
          localStorage.setItem('gn_contacts', JSON.stringify(updated));
          return updated;
        });

        const isPaid = invoiceToSave.status === 'paid';
        const isPartial = invoiceToSave.status === 'partially-paid';
        const paidAmount = isPaid ? total : (isPartial ? (invoiceToSave.paidAmount || 0) : 0);

        if (paidAmount > 0) {
          // Check if payment already exists for this invoice locally
          const guestPayments = JSON.parse(localStorage.getItem('gn_payments') || '[]');
          const alreadyPaid = guestPayments.some((p: any) => p.invoiceId === currentId);
          
          if (!alreadyPaid) {
            const newPayment: Payment = {
              id: generateId(),
              contactId: invoiceToSave.contactId,
              invoiceId: currentId,
              amount: paidAmount,
              method: 'cash',
              date: new Date().toISOString(),
              note: `Automated payment for ${invoiceToSave.serialNumber}${isPartial ? ' (Partial)' : ''}`
            };
            setPayments(prev => {
              const updated = [newPayment, ...prev];
              localStorage.setItem('gn_payments', JSON.stringify(updated));
              return updated;
            });
          }
        }
      }
      
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
      return;
    }

    setIsSavingToFirestore(true);
    console.log("[Firestore] Attempting to save invoice...", invoiceToSave.id);
    try {
      const { id, ...dataToSave } = invoiceToSave;
      const cleanedData = {
        ...dataToSave,
        userId: user.uid,
        updatedAt: serverTimestamp()
      };
      
      const isActuallyFirestoreId = invoiceData.id && !invoiceData.id.includes('-') && invoiceData.id.length > 5;

      if (isActuallyFirestoreId) {
        console.log("[Firestore] Updating existing invoice:", invoiceData.id);
        const docRef = doc(db, "invoices", invoiceData.id!);
        await updateDoc(docRef, cleanedData);

        // Check if we need to add a payment record if status changed to paid
        if (invoiceToSave.status === 'paid' && invoiceToSave.contactId) {
           const paymentsRef = collection(db, "payments");
           const q = query(paymentsRef, where("invoiceId", "==", invoiceData.id), where("userId", "==", user.uid));
           const existingPayments = await getDocs(q);
           
           if (existingPayments.empty) {
             console.log("[Firestore] Creating payment record for paid invoice");
             await addDoc(paymentsRef, {
               userId: user.uid,
               contactId: invoiceToSave.contactId,
               invoiceId: invoiceData.id,
               amount: total,
               method: 'cash',
               date: serverTimestamp(),
               note: `Automated payment for ${invoiceToSave.serialNumber}`
             });

             // Update contact Paid/Balance if we just created a payment
             const contactRef = doc(db, "clients", invoiceToSave.contactId);
             const contactSnap = await getDoc(contactRef);
             if (contactSnap.exists()) {
               const currentData = contactSnap.data();
               await updateDoc(contactRef, {
                  totalPaid: (currentData.totalPaid || 0) + total,
                  totalBalance: Math.max(0, (currentData.totalBalance || 0) - total),
                  updatedAt: serverTimestamp()
               });
             }
           }
        }
      } else {
        console.log("[Firestore] Adding new invoice");
        const docRef = await addDoc(collection(db, "invoices"), cleanedData);
        setInvoiceData(prev => ({ ...prev, id: docRef.id }));
        console.log("[Firestore] Invoice added with ID:", docRef.id);
        
        // Update contact balance if associated
        const totalAmount = invoiceToSave.totalAmount || total;
        if (invoiceToSave.contactId) {
          const contactRef = doc(db, "clients", invoiceToSave.contactId);
          const contactSnap = await getDoc(contactRef);
          if (contactSnap.exists()) {
            const currentData = contactSnap.data();
            const updates: any = { 
              updatedAt: serverTimestamp(),
              totalInvoices: (currentData.totalInvoices || 0) + totalAmount
            };
            
            const isPaid = invoiceToSave.status === 'paid';
            const isPartial = invoiceToSave.status === 'partially-paid';
            const paidAmount = isPaid ? totalAmount : (isPartial ? (invoiceToSave.paidAmount || 0) : 0);
            const remainingAmount = totalAmount - paidAmount;

            updates.totalPaid = (currentData.totalPaid || 0) + paidAmount;
            updates.totalBalance = (currentData.totalBalance || 0) + remainingAmount;
            
            if (paidAmount > 0) {
              // Create automated payment record
              await addDoc(collection(db, "payments"), {
                userId: user.uid,
                contactId: invoiceToSave.contactId,
                invoiceId: docRef.id,
                amount: paidAmount,
                method: 'cash',
                date: serverTimestamp(),
                note: `Automated payment for ${invoiceToSave.serialNumber}${isPartial ? ' (Partial)' : ''}`
              });
            }
            
            await updateDoc(contactRef, updates);
            console.log("[Firestore] Updated contact stats and created payment record");
          }
        }
      }
      
      // Explicit success feedback for the user
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
      
    } catch (err) {
      console.error("[Firestore] Error saving invoice:", err);
      setLastFirebaseError(err instanceof Error ? err.message : String(err));
      alert(lang === 'en' ? "Error saving to cloud. Please check your connection." : "خطأ في الحفظ السحابي. يرجى التحقق من الاتصال.");
    } finally {
      setIsSavingToFirestore(false);
    }
  };

  const handleMarkAsPaid = async (invoice: InvoiceData) => {
    if (invoice.status === 'paid') return;
    
    const paidAmount = invoice.paidAmount || 0;
    const remainingToPay = invoice.totalAmount - paidAmount;
    const updatedInvoice: InvoiceData = { ...invoice, status: 'paid', paidAmount: invoice.totalAmount, updatedAt: new Date().toISOString() as any };

    if (!user) {
      setSavedInvoices(prev => {
        const updated = prev.map(inv => inv.id === invoice.id ? updatedInvoice : inv);
        localStorage.setItem('gn_invoice_history', JSON.stringify(updated));
        return updated;
      });

      if (invoice.contactId) {
        setContacts(prev => {
          const updated = prev.map(c => {
            if (c.id === invoice.contactId) {
              return {
                ...c,
                totalPaid: (c.totalPaid || 0) + remainingToPay,
                totalBalance: Math.max(0, (c.totalBalance || 0) - remainingToPay)
              };
            }
            return c;
          });
          localStorage.setItem('gn_contacts', JSON.stringify(updated));
          return updated;
        });

        // Add to local payments
        const newPayment: Payment = {
          id: generateId(),
          contactId: invoice.contactId,
          invoiceId: invoice.id,
          amount: remainingToPay,
          method: 'cash',
          date: new Date().toISOString(),
          note: `Automated payment for ${invoice.serialNumber} (Completion)`
        };
        setPayments(prev => {
          const updated = [newPayment, ...prev];
          localStorage.setItem('gn_payments', JSON.stringify(updated));
          return updated;
        });
      }
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      return;
    }

    try {
      const invoiceRef = doc(db, "invoices", invoice.id!);
      await updateDoc(invoiceRef, { 
        status: 'paid', 
        paidAmount: invoice.totalAmount,
        updatedAt: serverTimestamp() 
      });
      
      if (invoice.contactId) {
        // Add payment record
        await addDoc(collection(db, "payments"), {
          userId: user.uid,
          contactId: invoice.contactId,
          invoiceId: invoice.id,
          amount: remainingToPay,
          method: 'cash',
          date: serverTimestamp(),
          note: `Automated payment for ${invoice.serialNumber} (Completion)`
        });

        // Update contact stats
        const contactRef = doc(db, "clients", invoice.contactId);
        const contactSnap = await getDoc(contactRef);
        if (contactSnap.exists()) {
          const currentData = contactSnap.data();
          await updateDoc(contactRef, {
            totalPaid: (currentData.totalPaid || 0) + remainingToPay,
            totalBalance: Math.max(0, (currentData.totalBalance || 0) - remainingToPay),
            updatedAt: serverTimestamp()
          });
        }
      }
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      console.error("Error marking as paid:", err);
      alert(lang === 'en' ? "Failed to update invoice status." : "فشل في تحديث حالة الفاتورة.");
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteInvoice = async () => {
    if (!deletingId) return;
    const id = deletingId;
    setShowDeleteConfirm(false);
    setDeletingId(null);

    if (!user) {
      setSavedInvoices(prev => {
        const updated = prev.filter(inv => inv.id !== id);
        localStorage.setItem('gn_invoice_history', JSON.stringify(updated));
        
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
        
        return updated;
      });
      return;
    }

    try {
      await deleteDoc(doc(db, "invoices", id));
    } catch (error) {
      console.error("Firestore delete error:", error);
    }
  };

  const handleSaveContact = async (contactData: Omit<Contact, 'id' | 'userId' | 'totalBalance' | 'totalPaid' | 'createdAt'>) => {
    if (!user) {
      if (editingContactId) {
        setContacts(prev => {
          const updated = prev.map(c => c.id === editingContactId ? { ...c, ...contactData } : c);
          localStorage.setItem('gn_contacts', JSON.stringify(updated));
          return updated;
        });
        setEditingContactId(null);
      } else {
        const newContact: Contact = {
          ...contactData,
          id: generateId(),
          totalBalance: 0,
          totalPaid: 0,
          createdAt: new Date().toISOString()
        };
        setContacts(prev => {
          const updated = [newContact, ...prev];
          localStorage.setItem('gn_contacts', JSON.stringify(updated));
          return updated;
        });
      }
      return;
    }
    
    try {
      if (editingContactId) {
        console.log(`[Firestore] Updating contact: ${editingContactId}`);
        const docRef = doc(db, "clients", editingContactId);
        await updateDoc(docRef, {
          ...contactData,
          updatedAt: serverTimestamp()
        });
        setEditingContactId(null);
      } else {
        console.log(`[Firestore] Adding contact for UID: ${user.uid}`);
        const newContact: Omit<Contact, 'id'> = {
          ...contactData,
          userId: user.uid,
          totalBalance: 0,
          totalPaid: 0,
          createdAt: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, "clients"), newContact);
        console.log(`[Firestore] Contact added with ID: ${docRef.id}`);
      }
    } catch (err) {
      console.error("Error saving contact:", err);
      setLastFirebaseError(err instanceof Error ? err.message : String(err));
    }
  };

  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;
    const id = clientToDelete;
    setClientToDelete(null);

    if (!user) {
      setContacts(prev => {
        const updated = prev.filter(c => c.id !== id);
        localStorage.setItem('gn_contacts', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      await deleteDoc(doc(db, "clients", id));
      if (selectedContactId === id) setSelectedContactId(null);
    } catch (err) {
      console.error("Error deleting contact:", err);
      setLastFirebaseError(err instanceof Error ? err.message : String(err));
      alert(lang === 'en' ? "Error deleting client" : "خطأ أثناء حذف العميل");
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, type: 'payment' | 'expense' } | null>(null);

  const handleDeletePayment = async (paymentId: string) => {
    console.log("[Payments] Attempting to delete:", paymentId);
    
    const paymentToDelete = payments.find(p => p.id === paymentId);
    if (!paymentToDelete) {
      console.warn("[Payments] Payment not found in state:", paymentId);
      return;
    }

    // Optimistic update
    setPayments(prev => prev.filter(p => p.id !== paymentId));

    if (!user) {
      console.log("[Payments] Deleting local payment");
      localStorage.setItem('gn_payments', JSON.stringify(payments.filter(p => p.id !== paymentId)));

      // Update contact balance locally
      setContacts(prev => {
        const updated = prev.map(c => {
          if (c.id === paymentToDelete.contactId) {
            return {
              ...c,
              totalPaid: (c.totalPaid || 0) - paymentToDelete.amount,
              totalBalance: (c.totalBalance || 0) + paymentToDelete.amount
            };
          }
          return c;
        });
        localStorage.setItem('gn_contacts', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      console.log("[Payments] Deleting Firestore payment:", paymentId);
      await deleteDoc(doc(db, "payments", paymentId));
      
      // Update contact balance
      if (paymentToDelete.contactId) {
        console.log("[Payments] Updating contact balance for:", paymentToDelete.contactId);
        const contactRef = doc(db, "clients", paymentToDelete.contactId);
        const contactSnap = await getDoc(contactRef);
        if (contactSnap.exists()) {
          const currentData = contactSnap.data();
          await updateDoc(contactRef, {
            totalPaid: Math.max(0, (currentData.totalPaid || 0) - paymentToDelete.amount),
            totalBalance: (currentData.totalBalance || 0) + paymentToDelete.amount,
            updatedAt: serverTimestamp()
          });
        }
      }
      console.log("[Payments] Delete sequence completed");
    } catch (err) {
      console.error("Error deleting payment:", err);
      alert(lang === 'en' ? "Failed to delete payment." : "فشل في حذف الدفعة.");
    }
  };

  const handleAddPayment = async (data: any) => {
    if (!data.contactId || isNaN(data.amount) || data.amount <= 0) return;

    if (!user) {
      const payment: Payment = {
        id: generateId(),
        ...data,
        date: new Date().toISOString()
      };
      
      setPayments(prev => {
        const updated = [payment, ...prev];
        localStorage.setItem('gn_payments', JSON.stringify(updated));
        return updated;
      });

      setContacts(prev => {
        const updated = prev.map(c => {
          if (c.id === data.contactId) {
            return {
              ...c,
              totalBalance: Math.max(0, (c.totalBalance || 0) - parseFloat(data.amount)),
              totalPaid: (c.totalPaid || 0) + parseFloat(data.amount)
            };
          }
          return c;
        });
        localStorage.setItem('gn_contacts', JSON.stringify(updated));
        return updated;
      });

      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10B981', '#3B82F6', '#F59E0B'] });
      return;
    }

    try {
      const payment: Omit<Payment, 'id'> = {
        userId: user.uid,
        ...data,
        date: serverTimestamp()
      };
      await addDoc(collection(db, "payments"), payment);
      
      // Update contact balance
      const contactRef = doc(db, "clients", data.contactId);
      const contactSnap = await getDoc(contactRef);
      if (contactSnap.exists()) {
        const currentBalance = contactSnap.data().totalBalance || 0;
        const currentPaid = contactSnap.data().totalPaid || 0;
        await updateDoc(contactRef, {
          totalBalance: Math.max(0, currentBalance - parseFloat(data.amount)),
          totalPaid: currentPaid + parseFloat(data.amount)
        });
      }
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#F59E0B']
      });
    } catch (error) {
      console.error("Error adding payment:", error);
    }
  };

  const handleAddExpense = async (data: any) => {
    if (isNaN(data.amount) || data.amount <= 0) return;

    if (!user) {
      const expense: Expense = {
        id: generateId(),
        ...data,
        amount: parseFloat(data.amount),
        date: new Date().toISOString()
      };
      setExpenses(prev => {
        const updated = [expense, ...prev];
        localStorage.setItem('gn_expenses', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      const expense: Omit<Expense, 'id'> = {
        userId: user.uid,
        ...data,
        amount: parseFloat(data.amount),
        date: serverTimestamp()
      };
      await addDoc(collection(db, "expenses"), expense);
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    console.log("[Expenses] Attempting to delete:", expenseId);
    
    // Optimistic update
    setExpenses(prev => prev.filter(e => e.id !== expenseId));

    if (!user) {
      console.log("[Expenses] Deleting local expense");
      localStorage.setItem('gn_expenses', JSON.stringify(expenses.filter(e => e.id !== expenseId)));
      return;
    }

    try {
      console.log("[Expenses] Deleting Firestore document:", expenseId);
      await deleteDoc(doc(db, "expenses", expenseId));
      console.log("[Expenses] Delete successful");
    } catch (err) {
      console.error("Error deleting expense:", err);
      // Revert optimistic update if needed, but for simplicity we'll just alert
      alert(lang === 'en' ? "Failed to delete expense." : "فشل في حذف المصروف.");
    }
  };

  const handleSyncData = async () => {
    if (!user) return;
    setIsSavingToFirestore(true);
    console.log("[Sync] Starting data sync to cloud...");
    
    try {
      // Sync Contacts
      const localContactsStr = localStorage.getItem('gn_contacts');
      if (localContactsStr) {
        const localContacts = JSON.parse(localContactsStr);
        for (const c of localContacts) {
          const { id, ...data } = c;
          await addDoc(collection(db, "clients"), {
            ...data,
            userId: user.uid,
            createdAt: serverTimestamp()
          });
        }
        localStorage.removeItem('gn_contacts');
      }

      // Sync Invoices
      const localInvoicesStr = localStorage.getItem('gn_invoice_history');
      if (localInvoicesStr) {
        const localInvoices = JSON.parse(localInvoicesStr);
        for (const inv of localInvoices) {
          const { id, ...data } = inv;
          await addDoc(collection(db, "invoices"), {
            ...data,
            userId: user.uid,
            savedAt: data.savedAt || new Date().toISOString()
          });
        }
        localStorage.removeItem('gn_invoice_history');
      }

      // Sync Expenses
      const localExpensesStr = localStorage.getItem('gn_expenses');
      if (localExpensesStr) {
        const localExpenses = JSON.parse(localExpensesStr);
        for (const ex of localExpenses) {
          const { id, ...data } = ex;
          await addDoc(collection(db, "expenses"), {
            ...data,
            userId: user.uid,
            date: serverTimestamp()
          });
        }
        localStorage.removeItem('gn_expenses');
      }

       // Sync Payments
       const localPaymentsStr = localStorage.getItem('gn_payments');
       if (localPaymentsStr) {
         const localPayments = JSON.parse(localPaymentsStr);
         for (const p of localPayments) {
           const { id, ...data } = p;
           await addDoc(collection(db, "payments"), {
             ...data,
             userId: user.uid,
             date: serverTimestamp()
           });
         }
         localStorage.removeItem('gn_payments');
       }
      
      console.log("[Sync] Finished data sync successfully");
    } catch (err) {
      console.error("[Sync] Error during sync:", err);
      setLastFirebaseError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSavingToFirestore(false);
    }
  };

  const hasLocalData = localStorage.getItem('gn_contacts') || localStorage.getItem('gn_invoice_history');


  const handleAddItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { id: generateId(), description: '', price: 0 }]
    }));
  };

  const handleRemoveItem = (id: string) => {
    if (invoiceData.items.length === 1) return;
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoiceData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = () => {
    console.log("Generating invoice...");
    setFormError(null);
    
    // Filter out items that are completely empty
    const validItems = invoiceData.items.filter(item => 
      item.description.trim() !== '' || (item.price !== 0 && !isNaN(item.price))
    );

    if (validItems.length === 0) {
      const errorMsg = lang === 'en' 
        ? "Please add at least one item with a description or price." 
        : "يرجى إضافة عنصر واحد على الأقل يحتوي على وصف أو سعر.";
      setFormError(errorMsg);
      console.warn("Generation failed: No valid items.");
      return;
    }

    setIsGenerating(true);
    
    // Update with cleaned items
    setInvoiceData(prev => ({ ...prev, items: validItems }));

    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      setIsGenerating(false);
      setIsPreviewMode(true);
      console.log("Preview mode activated.");
      try {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#1A1A1A', '#666666', '#D4AF37', '#FFFFFF'],
          ticks: 200
        });
      } catch (e) {
        console.error("Confetti error:", e);
      }
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!invoiceRef.current) return;
    
    setIsDownloadingImage(true);
    try {
      // Wait for all images to load
      const images = Array.from(invoiceRef.current.getElementsByTagName('img')) as HTMLImageElement[];
      await Promise.all(images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>(resolve => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      }));

      // Small delay for any final rendering
      await new Promise(resolve => setTimeout(resolve, 800));

      const dataUrl = await htmlToImage.toJpeg(invoiceRef.current, {
        quality: 0.8,
        pixelRatio: 1.5,
        backgroundColor: isDarkMode ? '#060B16' : '#FFFFFF',
        skipFonts: true,
        style: {
          borderRadius: '24px',
          boxShadow: 'none',
          border: isDarkMode ? '2px solid rgba(255,255,255,0.2)' : '2px solid #1A1A1A',
        }
      });
      
      const link = document.createElement('a');
      link.download = `invoice-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Error generating image:', err);
      alert(lang === 'en' ? "Failed to generate image. Please try printing instead." : "فشل إنشاء الصورة. يرجى محاولة الطباعة بدلاً من ذلك.");
    } finally {
      setIsDownloadingImage(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;
    
    setIsGenerating(true);
    try {
      // Wait for all images to load
      const images = Array.from(invoiceRef.current.getElementsByTagName('img')) as HTMLImageElement[];
      await Promise.all(images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>(resolve => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      }));

      // Small delay for any final rendering
      await new Promise(resolve => setTimeout(resolve, 800));

      const dataUrl = await htmlToImage.toJpeg(invoiceRef.current, {
        quality: 0.8,
        pixelRatio: 1.5,
        backgroundColor: isDarkMode ? '#060B16' : '#FFFFFF',
        skipFonts: true,
        style: {
          borderRadius: '24px',
          boxShadow: 'none',
          border: isDarkMode ? '2px solid rgba(255,255,255,0.2)' : '2px solid #1A1A1A',
        }
      });
      
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [img.width, img.height],
        compress: true
      });
      
      pdf.addImage(dataUrl, 'JPEG', 0, 0, img.width, img.height, undefined, 'FAST');
      pdf.save(`invoice-${Date.now()}.pdf`);

    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadInvoice = (invoice: InvoiceData) => {
    setInvoiceData(invoice);
    setSaveNameInput(invoice.invoiceTitle || '');
    setActiveTab('invoices');
    setIsPreviewMode(false);
    setShowHistory(false);
  };

  const handleViewInvoice = (invoice: InvoiceData) => {
    setInvoiceData(invoice);
    setActiveTab('invoices');
    setIsPreviewMode(true);
    setShowHistory(false);
  };

  const handleDownloadHistoryInvoice = async (invoice: InvoiceData) => {
    setInvoiceData(invoice);
    setActiveTab('invoices');
    setIsPreviewMode(true);
    setShowHistory(false);
    setSelectedContactId(null);
    
    // Give time for the preview to render high-quality assets
    setTimeout(async () => {
      await handleDownloadPdf();
    }, 800);
  };

  const activityDisplay = invoiceData.activityIndex === t.activities.length - 1 
    ? invoiceData.customActivity 
    : t.activities[invoiceData.activityIndex];

  const SidebarNavItem = ({ icon, label, active, onClick, className }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, className?: string }) => (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 active:scale-95",
        active 
          ? "bg-brand-primary shadow-lg shadow-brand-primary/20 text-white" 
          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5",
        className
      )}
    >
      <span className={cn("transition-colors", active ? "text-white" : "text-slate-400")}>
        {icon}
      </span>
      <span className="text-sm">{label}</span>
    </button>
  );

  const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    );
  };

  const handleCreateInvoiceForContact = async (contact: Contact) => {
    // Generate serial number for the new invoice
    const lastSerial = savedInvoices.length > 0 
      ? Math.max(...savedInvoices.map(inv => {
          const match = inv.serialNumber?.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        }), 0)
      : 0;
    const serialNumber = `INV-${String(lastSerial + 1).padStart(4, '0')}`;

    const newInvoice: InvoiceData = {
      invoiceTitle: lang === 'ar' ? translations.ar.invoiceTitleDefault : translations.en.invoiceTitleDefault,
      serialNumber,
      serviceProvider: invoiceData.serviceProvider || '',
      clientName: contact.name,
      contactId: contact.id,
      activityIndex: invoiceData.activityIndex || 0,
      customActivity: invoiceData.customActivity || '',
      logo: invoiceData.logo || null,
      phoneNumber: invoiceData.phoneNumber || '',
      items: [{ id: generateId(), description: '', price: 0 }],
      totalAmount: 0,
      status: 'pending',
      savedAt: new Date().toISOString()
    };

    // Auto-save to database if user is logged in
    if (user) {
       try {
         const { id, ...dataToSave } = newInvoice;
         const docRef = await addDoc(collection(db, "invoices"), {
           ...dataToSave,
           userId: user.uid,
           updatedAt: serverTimestamp()
         });
         newInvoice.id = docRef.id;
         console.log("[Firestore] Auto-saved new invoice draft:", docRef.id);
       } catch (err) {
         console.error("Auto-save failed:", err);
       }
    } else {
      // Local save
      setSavedInvoices(prev => {
        const updated = [newInvoice, ...prev];
        localStorage.setItem('gn_invoice_history', JSON.stringify(updated));
        return updated;
      });
    }

    setInvoiceData(newInvoice);
    setActiveTab('invoices');
    setIsPreviewMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ContactsView = () => {
    const selectedContact = contactsWithAggregatedDebt.find(c => c.id === selectedContactId);

    if (selectedContactId && selectedContact) {
      const contactInvoices = savedInvoices.filter(i => i.contactId === selectedContactId);
      const totalInvoiced = selectedContact.totalInvoiced || 0;
      const totalPaid = selectedContact.totalPaid || 0;
      const debt = selectedContact.aggregatedDebt || 0;

      return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
           <button onClick={() => setSelectedContactId(null)} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:gap-3 transition-all">
             <ArrowLeft size={16} /> {lang === 'en' ? 'Back to Clients' : 'العودة للعملاء'}
           </button>

           <div className="bg-white dark:bg-white/5 border-2 border-[#1A1A1A]/5 dark:border-white/10 p-8 rounded-[40px] shadow-sm">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
               <div className="flex items-center gap-6">
                 <div className="w-20 h-20 rounded-[24px] bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-3xl">
                   {selectedContact.name[0]}
                 </div>
                 <div>
                   <h2 className="text-3xl font-black">{selectedContact.name}</h2>
                   <div className="flex items-center gap-4 mt-2 text-[#666666] dark:text-[#94A3B8] font-bold">
                     <span className="flex items-center gap-1"><Phone size={14} /> {selectedContact.phone}</span>
                     {selectedContact.email && <span className="flex items-center gap-1 text-xs"><Briefcase size={14} /> {selectedContact.email}</span>}
                   </div>
                 </div>
               </div>
               
               <div className="flex flex-wrap gap-4">
                 <Button onClick={() => handleCreateInvoiceForContact(selectedContact)} className="gap-2 bg-blue-600 hover:bg-blue-700 h-[unset] px-6 py-4 text-white font-bold rounded-2xl shadow-lg">
                   <Plus size={18} /> {t.newInvoice}
                 </Button>
                 <div className="bg-slate-50 dark:bg-white/5 p-4 px-6 rounded-2xl border border-slate-100 dark:border-white/5">
                   <p className="text-[10px] font-black uppercase text-[#999999] mb-1">{lang === 'en' ? 'Remaining Debt' : 'المديونية المتبقية'}</p>
                   <p className={cn("text-2xl font-black", debt > 0 ? "text-red-500" : "text-emerald-500")}>
                     {t.currencySymbol}{debt.toLocaleString()}
                   </p>
                 </div>
               </div>
             </div>

             <div className="grid gap-6 md:grid-cols-3 mb-12">
                <div className="p-6 rounded-3xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10">
                  <p className="text-xs font-bold text-blue-600/60 uppercase mb-2">{lang === 'en' ? 'Total Invoiced' : 'إجمالي الفواتير'}</p>
                  <p className="text-2xl font-black text-blue-600">{t.currencySymbol}{totalInvoiced.toLocaleString()}</p>
                </div>
                <div className="p-6 rounded-3xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10">
                  <p className="text-xs font-bold text-emerald-600/60 uppercase mb-2">{lang === 'en' ? 'Total Paid' : 'إجمالي المدفوع'}</p>
                  <p className="text-2xl font-black text-emerald-600">{t.currencySymbol}{totalPaid.toLocaleString()}</p>
                </div>
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">{lang === 'en' ? 'Transactions' : 'عدد المعاملات'}</p>
                  <p className="text-2xl font-black">{contactInvoices.length}</p>
                </div>
             </div>

             <h3 className="text-xl font-black mb-6">{lang === 'en' ? 'Invoice History' : 'سجل الفواتير'}</h3>
             <div className="space-y-3">
               {contactInvoices.map(invoice => (
                 <div key={invoice.id} className="flex items-center justify-between p-5 rounded-2xl bg-[#F9F9F9] dark:bg-white/5 border border-transparent hover:border-blue-500/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-3 rounded-xl", invoice.status === 'paid' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600")}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{invoice.invoiceTitle || t.invoiceTitleDefault}</p>
                          {invoice.serialNumber && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded text-slate-600 dark:text-slate-400">
                              {invoice.serialNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#999999]">{invoice.savedAt ? new Date(invoice.savedAt).toLocaleDateString() : '---'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="hidden group-hover:flex items-center gap-2">
                        {invoice.status !== 'paid' && (
                          <button 
                            onClick={() => handleMarkAsPaid(invoice)} 
                            className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-200 transition-colors"
                          >
                            {lang === 'en' ? 'Mark Paid' : 'تم الدفع'}
                          </button>
                        )}
                        <button onClick={() => handleEditInvoice(invoice)} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 rounded-lg transition-colors" title={lang === 'en' ? 'Edit' : 'تعديل'}>
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDownloadHistoryInvoice(invoice)} className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 rounded-lg transition-colors" title={lang === 'en' ? 'Download' : 'تنزيل'}>
                          <Download size={16} />
                        </button>
                        <button onClick={() => confirmDelete(invoice.id!)} className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 rounded-lg transition-colors" title={lang === 'en' ? 'Delete' : 'حذف'}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg">{t.currencySymbol}{invoice.totalAmount.toLocaleString()}</p>
                        <p className={cn("text-[10px] font-black uppercase", 
                          invoice.status === 'paid' ? "text-emerald-500" : 
                          invoice.status === 'partially-paid' ? "text-blue-500" :
                          "text-amber-500")}>
                          {invoice.status === 'paid' ? (lang === 'en' ? 'Paid' : 'مدفوعة') : 
                           invoice.status === 'partially-paid' ? (lang === 'en' ? 'Partial' : 'باقي') :
                           (lang === 'en' ? 'Pending' : 'قيد الانتظار')}
                        </p>
                      </div>
                    </div>
                 </div>
               ))}
               {contactInvoices.length === 0 && (
                 <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-3xl">
                   <p className="text-[#999999] font-bold">{lang === 'en' ? 'No invoices for this client' : 'لا يوجد فواتير لهذا العميل'}</p>
                 </div>
               )}
             </div>
           </div>
        </motion.div>
      );
    }

    return (
      <motion.div 
         key="contacts"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         className="space-y-8"
      >
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
             <h2 className="text-3xl font-black tracking-tight">{t.clients}</h2>
             <p className="text-[#666666] dark:text-[#94A3B8]">{lang === 'en' ? 'Manage your customer accounts' : 'إدارة حسابات عملائك'}</p>
           </div>
           <Button onClick={() => setShowAddContact(true)} className="gap-2">
             <UserPlus size={18} /> {t.addClient}
           </Button>
         </div>

         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
           {contactsWithAggregatedDebt.map(contact => (
             <div 
               key={contact.id} 
               onClick={() => setSelectedContactId(contact.id || null)}
               className="bg-white dark:bg-white/5 border-2 border-[#1A1A1A]/5 dark:border-white/10 p-6 rounded-2xl hover:border-blue-500 transition-all group relative overflow-hidden cursor-pointer"
             >
               <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-xl">
                   {contact.name[0]}
                 </div>
                 <div className="flex-1">
                   <h3 className="font-bold text-lg leading-none mb-1">{contact.name}</h3>
                   <p className="text-xs text-[#666666] dark:text-[#94A3B8]">{contact.phone}</p>
                 </div>
                 <div className="flex items-center gap-1">
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       setEditingContactId(contact.id || null);
                       setNewContactData({
                         name: contact.name,
                         phone: contact.phone,
                         email: contact.email || '',
                         address: contact.address || ''
                       });
                       setShowAddContact(true);
                     }}
                     className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 transition-colors"
                   >
                     <Edit size={16} />
                   </button>
                   <button 
                     type="button"
                     onClick={(e) => {
                       e.stopPropagation();
                       setClientToDelete(contact.id || null);
                     }}
                     className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 transition-colors relative z-10"
                   >
                     <Trash2 size={16} />
                   </button>
                   <ChevronRight size={18} className="text-[#999999] opacity-0 group-hover:opacity-100 transition-all" />
                 </div>
               </div>
               <div className="pt-4 border-t border-[#1A1A1A]/5 dark:border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#666666] uppercase tracking-wider">{lang === 'en' ? 'Debt' : 'المديونية'}</span>
                  <span className={cn("font-black text-lg", (contact.aggregatedDebt || 0) > 0 ? "text-red-500" : "text-emerald-500")}>
                    {t.currencySymbol}{(contact.aggregatedDebt || 0).toLocaleString()}
                  </span>
               </div>
             </div>
           ))}
           {contactsWithAggregatedDebt.length === 0 && (
             <div className="md:col-span-2 lg:col-span-3 py-20 text-center">
               <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Users size={32} className="text-[#999999]" />
               </div>
               <h3 className="text-xl font-bold mb-2">{t.noClients}</h3>
               <Button variant="outline" onClick={() => setShowAddContact(true)}>{t.addClient}</Button>
             </div>
           )}
         </div>
      </motion.div>
    );
  };

  const DashboardView = () => {
      // Generate chart data from payments and paid invoices
      const combinedRevenue = [
        ...payments.map(p => ({
          date: p.date?.toDate ? p.date.toDate() : (p.date ? new Date(p.date) : new Date()),
          amount: Number(p.amount) || 0
        })),
        ...savedInvoices.filter(i => i.status === 'paid').map(i => ({
          date: i.savedAt ? new Date(i.savedAt) : new Date(),
          amount: Number(i.totalAmount) || 0
        }))
      ];

      const chartData = combinedRevenue
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .reduce((acc: any[], item) => {
          const dateLabel = item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const existing = acc.find(entry => entry.date === dateLabel);
          if (existing) {
            existing.amount += item.amount;
          } else {
            acc.push({ date: dateLabel, amount: item.amount });
          }
          return acc;
        }, [])
        .slice(-7);

      const paymentsTotal = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const invoicesTotal = savedInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0);
      const totalRevenue = paymentsTotal + invoicesTotal;
      const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const netProfit = totalRevenue - totalExpenses;

      const dashboardInvoices = savedInvoices.slice(0, 4);
      
      // Derive top clients derived from paid revenue
      const clientStats = contacts.map(c => {
        const clientPaid = payments.filter(p => p.contactId === c.id).reduce((sum, p) => sum + (Number(p.amount) || 0), 0) +
                           savedInvoices.filter(i => i.contactId === c.id && i.status === 'paid').reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0);
        return { name: c.name, paid: clientPaid };
      }).sort((a, b) => b.paid - a.paid).slice(0, 3);

      return (
        <motion.div 
           key="dashboard"
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="space-y-10 pb-20"
        >
           {/* Header Context */}
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
             <div>
               <h2 className="text-4xl font-black tracking-tight">{lang === 'en' ? 'Financial Overview' : 'نظرة عامة مالية'}</h2>
               <p className="text-[#666666] dark:text-[#94A3B8] font-medium mt-1">{lang === 'en' ? 'Track your business performance in real-time' : 'تتبع أداء عملك في الوقت الفعلي'}</p>
             </div>
             <div className="flex items-center gap-3">
               <div className="px-4 py-2 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'en' ? 'Live Data' : 'بيانات حية'}</span>
               </div>
             </div>
           </div>

           {/* Top Stats - Bento Style */}
           <div className="grid gap-6 md:grid-cols-4">
             <div className="bg-brand-primary text-white p-8 rounded-[40px] relative overflow-hidden flex flex-col justify-between min-h-[200px] shadow-2xl shadow-brand-primary/20 group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl group-hover:bg-white/30 transition-all" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
                    <TrendingUp size={24} className="text-white" />
                  </div>
                  <span className="text-[10px] font-black text-white bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-md uppercase tracking-widest">+{lang === 'en' ? '12% MoM' : '١٢٪ نمو'}</span>
                </div>
                <div className="relative z-10">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70 mb-1">{lang === 'en' ? 'Net Profit' : 'صافي الربح'}</p>
                  <h3 className="text-4xl font-black">{t.currencySymbol}{netProfit.toLocaleString()}</h3>
                </div>
             </div>
             
             <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 rounded-[40px] flex flex-col justify-between group hover:border-brand-tertiary/20 transition-all min-h-[200px]">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-brand-tertiary/5 dark:bg-brand-tertiary/10">
                    <Clock size={24} className="text-brand-tertiary" />
                  </div>
                  <span className="text-[10px] font-black text-brand-tertiary uppercase tracking-widest">{lang === 'en' ? 'Pending' : 'معلقة'}</span>
                </div>
                <div>
                   <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{t.totalReceivable}</p>
                   <h3 className="text-4xl font-black text-brand-tertiary">{t.currencySymbol}{contactsWithAggregatedDebt.reduce((sum, c) => sum + (c.aggregatedDebt || 0), 0).toLocaleString()}</h3>
                </div>
             </div>

             <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 rounded-[40px] flex flex-col justify-between group hover:border-brand-secondary/20 transition-all min-h-[200px]">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-brand-secondary/5 dark:bg-brand-secondary/10">
                    <ArrowDownLeft size={24} className="text-brand-secondary" />
                  </div>
                </div>
                <div>
                   <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{lang === 'en' ? 'Total Expenses' : 'إجمالي المصاريف'}</p>
                   <h3 className="text-4xl font-black text-brand-secondary">{t.currencySymbol}{totalExpenses.toLocaleString()}</h3>
                </div>
             </div>

             <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 rounded-[40px] flex flex-col justify-between group hover:border-brand-primary/20 transition-all min-h-[200px]">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-brand-primary/5 dark:bg-brand-primary/10">
                    <FileText size={24} className="text-brand-primary" />
                  </div>
                </div>
                <div>
                   <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{lang === 'en' ? 'Pending Invoices' : 'الفواتير المعلقة'}</p>
                   <h3 className="text-4xl font-black text-brand-primary">{savedInvoices.filter(i => i.status === 'pending').length}</h3>
                </div>
             </div>
           </div>

           {/* Middle Grid */}
           <div className="grid gap-8 lg:grid-cols-12">
             <div className="lg:col-span-8 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-10 rounded-[48px] shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">{lang === 'en' ? 'Revenue Flow' : 'تدفق الإيرادات'}</h3>
                    <p className="text-xs text-slate-400 font-medium">{lang === 'en' ? 'Weekly revenue tracking' : 'تتبع الإيرادات الأسبوعية'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5 text-slate-500 rounded-full">{lang === 'en' ? 'Weekly' : 'أسبوعي'}</button>
                    <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest bg-brand-primary text-white rounded-full shadow-lg shadow-brand-primary/20">{lang === 'en' ? 'Monthly' : 'شهري'}</button>
                  </div>
                </div>
                <div className="h-[320px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dashboardGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#004ac6" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#004ac6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#94A3B8" opacity={0.15} />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                        dy={15}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '16px', 
                          border: 'none', 
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          backgroundColor: '#1e293b',
                          color: '#fff'
                        }}
                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#004ac6" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#dashboardGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* Quick Actions & Top Clients */}
             <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-900 text-white p-8 rounded-[40px] relative overflow-hidden group">
                  <div className="relative z-10">
                    <h3 className="text-lg font-black mb-6">{lang === 'en' ? 'Quick Actions' : 'إجراءات سريعة'}</h3>
                    <div className="grid gap-3">
                      <button 
                        onClick={() => { setActiveTab('invoices'); setIsPreviewMode(false); }}
                        className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <Plus size={18} className="text-white" />
                          <span className="text-xs font-black uppercase tracking-widest">{lang === 'en' ? 'New Invoice' : 'فاتورة جديدة'}</span>
                        </div>
                        <ChevronRight size={16} className="text-white/40 group-hover:translate-x-1" />
                      </button>
                      <button 
                         onClick={() => setShowAddContact(true)}
                         className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group"
                      >
                         <div className="flex items-center gap-3">
                           <UserPlus size={18} className="text-white" />
                           <span className="text-xs font-black uppercase tracking-widest">{lang === 'en' ? 'Add Client' : 'إضافة عميل'}</span>
                         </div>
                         <ChevronRight size={16} className="text-white/40 group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 rounded-[40px] flex-1">
                   <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-on-surface dark:text-white">
                     <ChartPie size={20} className="text-brand-primary" />
                     {lang === 'en' ? 'Top Clients' : 'أهم العملاء'}
                   </h3>
                   <div className="space-y-5">
                     {clientStats.map((client, i) => (
                       <div key={i} className="flex items-center gap-4 group">
                         <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center font-black text-brand-primary border border-slate-100 dark:border-white/10 group-hover:bg-brand-primary group-hover:text-white transition-all">
                           {(i + 1).toString().padStart(2, '0')}
                         </div>
                         <div className="flex-1">
                           <p className="text-sm font-black truncate text-on-surface dark:text-white">{client.name}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase">{t.currencySymbol}{client.paid.toLocaleString()}</p>
                         </div>
                       </div>
                     ))}
                     {clientStats.length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">{lang === 'en' ? 'No data yet' : 'لا توجد بيانات بعد'}</p>}
                   </div>
                </div>
             </div>
           </div>

           {/* Bottom Section: Recent Activities */}
           <div className="space-y-6">
             <div className="flex items-center justify-between px-2">
               <h3 className="text-2xl font-black tracking-tight">{lang === 'en' ? 'Recent Invoices' : 'آخر الفواتير'}</h3>
               <button onClick={() => setActiveTab('history')} className="text-xs font-black uppercase tracking-widest text-brand-primary hover:underline">{lang === 'en' ? 'View All' : 'عرض الكل'}</button>
             </div>
             <div className="grid gap-4">
               {dashboardInvoices.map((inv) => (
                 <div 
                   key={inv.id} 
                   onClick={() => handleViewInvoice(inv)}
                   className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-5 rounded-3xl flex items-center justify-between group hover:border-brand-primary/30 transition-all cursor-pointer"
                 >
                   <div className="flex items-center gap-5">
                     <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-all">
                       <FileText size={24} />
                     </div>
                     <div>
                       <h4 className="font-black text-sm uppercase tracking-tight text-on-surface dark:text-white">{inv.invoiceTitle || t.invoiceTitleDefault}</h4>
                       <p className="text-[10px] text-slate-400 font-bold">{inv.clientName} • {inv.savedAt ? new Date(inv.savedAt).toLocaleDateString() : ''}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-10">
                     <div className={cn(
                       "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                       inv.status === 'paid' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-brand-tertiary/10 text-brand-tertiary border border-brand-tertiary/20"
                     )}>
                        {inv.status === 'paid' ? (lang === 'en' ? 'Paid' : 'مدفوعة') : (lang === 'en' ? 'Pending' : 'معلقة')}
                     </div>
                     <div className="text-left w-24">
                       <p className="text-xl font-black text-on-surface dark:text-white">{t.currencySymbol}{(inv.totalAmount || 0).toLocaleString()}</p>
                     </div>
                     <ChevronRight size={18} className="text-slate-200 group-hover:text-brand-primary transition-all" />
                   </div>
                 </div>
               ))}
               {dashboardInvoices.length === 0 && (
                 <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-white/10 rounded-[40px]">
                   <Search size={40} className="mx-auto mb-4 text-slate-200" />
                   <p className="text-slate-400 font-bold">{lang === 'en' ? 'No recent business activity' : 'لا يوجد نشاط تجاري مؤخراً'}</p>
                 </div>
               )}
             </div>
           </div>
        </motion.div>
      );
    };

    const PaymentsView = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black">{lang === 'en' ? 'Payments' : 'المدفوعات'}</h2>
          <p className="text-[#666666] dark:text-[#94A3B8]">{lang === 'en' ? 'Log of incoming revenue' : 'سجل الإيرادات الواردة'}</p>
        </div>
        <Button onClick={() => setShowAddPayment(true)} className="gap-2">
          <Wallet size={18} /> {lang === 'en' ? 'Record Payment' : 'تسجيل دفعة'}
        </Button>
      </div>

      <div className="bg-white dark:bg-white/5 border border-[#1A1A1A]/5 dark:border-white/10 rounded-[32px] overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="border-b border-[#1A1A1A]/5 dark:border-white/5">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#999999]">{lang === 'en' ? 'Date' : 'التاريخ'}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#999999]">{lang === 'en' ? 'Client' : 'العميل'}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#999999]">{lang === 'en' ? 'Method' : 'الطريقة'}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#999999] text-right">{lang === 'en' ? 'Amount' : 'المبلغ'}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#999999] text-center">{lang === 'en' ? 'Actions' : 'إجراءات'}</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => {
              const contact = contacts.find(c => c.id === p.contactId);
              return (
                <tr key={p.id} className="border-b border-[#1A1A1A]/5 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="px-6 py-4 font-bold text-sm">
                    {p.date?.toDate ? p.date.toDate().toLocaleDateString() : new Date(p.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-sm">{contact?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-blue-600">{p.method}</td>
                  <td className="px-6 py-4 font-black text-emerald-500 text-right">{t.currencySymbol}{p.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <Button 
                      variant="danger" 
                      size="icon" 
                      onClick={(evt) => {
                        evt.stopPropagation();
                        setDeleteConfirm({ id: p.id, type: 'payment' });
                      }} 
                      className="h-10 w-10"
                    >
                       <Trash2 size={20} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const toggleUserApproval = async (uid: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users_profiles", uid), {
        isApproved: !currentStatus
      });
    } catch (err) {
      console.error("Error updating user status:", err);
    }
  };

  const SubscribersView = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-on-surface dark:text-white uppercase leading-none mb-1">
            {lang === 'en' ? 'Subscribers' : 'المشتركين'}
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            {lang === 'en' ? 'Manage user access and subscriptions' : 'إدارة وصول المستخدمين والاشتراكات'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-[40px] border border-slate-100 dark:border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/10">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{lang === 'en' ? 'User' : 'المستخدم'}</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{lang === 'en' ? 'Joined' : 'انضم في'}</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">{lang === 'en' ? 'Status' : 'الحالة'}</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">{lang === 'en' ? 'Action' : 'إجراء'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-white/5">
            {allUsers.map((u) => (
              <tr key={u.uid} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <img src={u.photoURL} alt="" className="w-10 h-10 rounded-full border-2 border-brand-primary" />
                    <div>
                      <div className="font-black text-sm uppercase tracking-tight">{u.displayName}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-xs font-bold text-slate-400">
                  {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-8 py-6">
                  <div className="flex justify-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight",
                      u.isApproved 
                        ? "bg-emerald-500/10 text-emerald-500" 
                        : "bg-red-500/10 text-red-500"
                    )}>
                      {u.isApproved ? (lang === 'en' ? 'Approved' : 'مقبول') : (lang === 'en' ? 'Pending' : 'معلق')}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <Button 
                    variant={u.isApproved ? "danger" : "primary"}
                    size="sm"
                    onClick={() => toggleUserApproval(u.uid, u.isApproved)}
                    disabled={u.email === ADMIN_EMAIL}
                    className="h-10 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                  >
                    {u.isApproved 
                      ? (lang === 'en' ? 'Revoke' : 'إلغاء') 
                      : (lang === 'en' ? 'Approve' : 'قبول')}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const ExpensesView = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black">{lang === 'en' ? 'Expenses' : 'المصاريف'}</h2>
          <p className="text-[#666666] dark:text-[#94A3B8]">{lang === 'en' ? 'Track your business spending' : 'تتبع نفقات عملك'}</p>
        </div>
        <Button onClick={() => setShowAddExpense(true)} className="gap-2 bg-red-600 hover:bg-red-700">
          <ArrowDownLeft size={18} /> {lang === 'en' ? 'Add Expense' : 'إضافة مصروف'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {expenses.map(exp => (
          <div key={exp.id} className="bg-white dark:bg-white/5 border-2 border-[#1A1A1A]/5 dark:border-white/10 p-6 rounded-3xl relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 px-3 py-1 rounded-full">{exp.category}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#999999]">
                  {exp.date?.toDate ? exp.date.toDate().toLocaleDateString() : new Date(exp.date).toLocaleDateString()}
                </span>
                <Button 
                  variant="danger" 
                  size="icon" 
                  onClick={(evt) => {
                    evt.stopPropagation();
                    console.log("[UI] Delete button clicked for:", exp.id);
                    setDeleteConfirm({ id: exp.id, type: 'expense' });
                  }} 
                  className="h-10 w-10 shadow-none border-none"
                >
                  <Trash2 size={20} />
                </Button>
              </div>
            </div>
            <h4 className="font-bold text-lg mb-1">{exp.description}</h4>
            <p className="text-2xl font-black">{t.currencySymbol}{exp.amount.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const HistoryContent = () => (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#060B16] p-4 border border-[#F0F0F0] dark:border-white/5">
        {!user ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2 text-blue-600 dark:text-blue-400">
                <CloudOff size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A1A1A] dark:text-[#E2E8F0]">
                  {lang === 'ar' ? 'المزامنة السحابية غير مفعلة' : 'Cloud Sync Disabled'}
                </p>
                <p className="text-[10px] text-[#666666] dark:text-[#94A3B8]">
                  {lang === 'ar' ? 'سجل دخولك لحفظ فواتيرك للأبد' : 'Login to save your invoices across devices'}
                </p>
              </div>
            </div>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto text-xs"
            >
              {t.login}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2 text-green-600 dark:text-green-400">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A1A1A] dark:text-[#E2E8F0]">
                  {lang === 'ar' ? 'تم تفعيل المزامنة السحابية' : 'Cloud Sync Enabled'}
                </p>
                <p className="text-[10px] text-[#666666] dark:text-[#94A3B8]">
                  {lang === 'ar' ? `مرحباً ${user.displayName}` : `Welcome ${user.displayName}`}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-500">
              {t.logout}
            </Button>
          </div>
        )}
      </div>

      {savedInvoices.length === 0 ? (
        <div className="py-12 text-center text-[#999999] dark:text-[#94A3B8]">
          <History size={48} className="mx-auto mb-4 opacity-20" />
          <p>{t.noHistory}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {savedInvoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between rounded-2xl border border-[#F0F0F0] dark:border-white/5 p-4 transition-colors hover:bg-[#F9F9F9] dark:hover:bg-[#060B16]">
              <div className="flex-1">
                <h3 className="font-bold text-[#1A1A1A] dark:text-[#E2E8F0]">{inv.invoiceTitle}</h3>
                <p className="text-xs text-[#999999] dark:text-[#94A3B8]">
                  {t.savedAt}: {new Date(inv.savedAt!).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                </p>
                <p className="mt-1 text-sm text-[#666666] dark:text-[#94A3B8]">
                  {inv.serviceProvider || (inv.activityIndex !== undefined && inv.activityIndex === t.activities.length - 1 ? inv.customActivity : (inv.activityIndex !== undefined ? t.activities[inv.activityIndex] : ''))}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {inv.status !== 'paid' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleMarkAsPaid(inv)}
                    className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 font-bold h-9 text-[10px] uppercase tracking-widest"
                  >
                    {lang === 'en' ? 'Mark Paid' : 'تم الدفع'}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => handleLoadInvoice(inv)} className="h-9 text-[10px] uppercase tracking-widest">
                  {t.edit}
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleDownloadHistoryInvoice(inv)} className="h-9 w-9 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20">
                  <Download size={18} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => confirmDelete(inv.id!)} className="h-10 w-10 text-red-400 hover:text-red-600">
                  <Trash2 size={20} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ProfileView = () => {
    const [localInfo, setLocalInfo] = useState<BusinessInfo>(businessInfo || { 
      name: '', 
      phone: '01553251011', 
      whatsapp: '01553251011',
      telegram: '@GN_OA',
      logo: null, 
      activityIndex: 0, 
      customActivity: '' 
    });
    const [isSaving, setIsSaving] = useState(false);
    const profileFileRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
      setIsSaving(true);
      if (user) {
        try {
          // Using userId as doc ID for business info to keep it simple and unique per user
          await setDoc(doc(db, "businessInfo", user.uid), {
            ...localInfo,
            userId: user.uid,
            updatedAt: serverTimestamp()
          });
          
          setBusinessInfo({ ...localInfo, id: user.uid });
          setInvoiceData(prev => ({
            ...prev,
            serviceProvider: localInfo.name || prev.serviceProvider,
            phoneNumber: localInfo.phone || prev.phoneNumber,
            telegram: localInfo.telegram || prev.telegram,
            whatsapp: localInfo.whatsapp || prev.whatsapp,
            logo: localInfo.logo || prev.logo,
            activityIndex: localInfo.activityIndex ?? prev.activityIndex,
            customActivity: localInfo.customActivity || prev.customActivity
          }));
          alert(lang === 'ar' ? 'تم حفظ البيانات بنجاح' : 'Data saved successfully');
        } catch (err) {
          console.error("Save profile error:", err);
        }
      } else {
        localStorage.setItem('gn_business_info', JSON.stringify(localInfo));
        setBusinessInfo(localInfo);
        setInvoiceData(prev => ({
          ...prev,
          serviceProvider: localInfo.name || prev.serviceProvider,
          phoneNumber: localInfo.phone || prev.phoneNumber,
          telegram: localInfo.telegram || prev.telegram,
          whatsapp: localInfo.whatsapp || prev.whatsapp,
          logo: localInfo.logo || prev.logo,
          activityIndex: localInfo.activityIndex ?? prev.activityIndex,
          customActivity: localInfo.customActivity || prev.customActivity
        }));
        alert(lang === 'ar' ? 'تم الحفظ محلياً' : 'Saved locally');
      }
      setIsSaving(false);
    };

    const handleProfileLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          alert(lang === 'ar' ? 'حجم الملف كبير جداً (الأقصى ٢ ميجابايت)' : 'File too large (max 2MB)');
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          setLocalInfo(prev => ({ ...prev, logo: event.target?.result as string }));
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-8 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black mb-2">{lang === 'en' ? 'Business Profile' : 'بيانات العمل'}</h2>
          <p className="text-[#666666] dark:text-[#94A3B8]">{lang === 'en' ? 'These details will appear on your invoices automatically' : 'هذه التفاصيل ستظهر في فواتيرك تلقائياً'}</p>
        </div>

        <div className="bg-white dark:bg-white/5 border-2 border-[#1A1A1A]/5 dark:border-white/10 p-8 rounded-[40px] shadow-sm space-y-8">
          <div className="flex flex-col items-center gap-4">
             <Label>{t.businessLogo}</Label>
             <div 
               onClick={() => profileFileRef.current?.click()}
               className="w-32 h-32 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-blue-500 transition-all"
             >
               {localInfo.logo ? (
                 <img src={localInfo.logo} alt="Logo" className="w-full h-full object-contain p-2" />
               ) : (
                 <ImageIcon className="text-slate-400 group-hover:scale-110 transition-transform" size={40} />
               )}
               <input type="file" ref={profileFileRef} className="hidden" accept="image/*" onChange={handleProfileLogo} />
             </div>
             <p className="text-[10px] text-slate-400 font-bold uppercase">{t.logoDesc}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 text-right">
            <div className={lang === 'ar' ? 'order-1' : ''}>
              <Label>{t.serviceProviderLabel}</Label>
              <Input 
                value={localInfo.name} 
                onChange={(e) => setLocalInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t.serviceProviderPlaceholder}
              />
            </div>
            <div className={lang === 'ar' ? 'order-2' : ''}>
              <Label>{t.contactPhone}</Label>
              <Input 
                value={localInfo.phone} 
                onChange={(e) => setLocalInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder={t.phonePlaceholder}
              />
            </div>
            <div className={lang === 'ar' ? 'order-3' : ''}>
              <Label>{t.whatsapp}</Label>
              <Input 
                value={localInfo.whatsapp} 
                onChange={(e) => setLocalInfo(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="01..."
              />
            </div>
            <div className={lang === 'ar' ? 'order-4' : ''}>
              <Label>{t.telegram}</Label>
              <Input 
                value={localInfo.telegram} 
                onChange={(e) => setLocalInfo(prev => ({ ...prev, telegram: e.target.value }))}
                placeholder="@..."
              />
            </div>
            <div className="md:col-span-2 text-right">
              <Label>{t.businessActivity}</Label>
              <select
                value={localInfo.activityIndex}
                onChange={(e) => setLocalInfo(prev => ({ ...prev, activityIndex: parseInt(e.target.value) || 0 }))}
                className="flex h-11 w-full rounded-lg border border-[#E5E5E5] bg-white dark:bg-[#121212] dark:border-[#333333] dark:text-white px-3 py-2 text-sm focus:outline-none"
              >
                {t.activities.map((activity, idx) => (
                  <option key={activity} value={idx}>{activity}</option>
                ))}
              </select>
            </div>
            {localInfo.activityIndex === t.activities.length - 1 && (
              <div className="md:col-span-2">
                <Label>{t.customActivity}</Label>
                <Input 
                  value={localInfo.customActivity} 
                  onChange={(e) => setLocalInfo(prev => ({ ...prev, customActivity: e.target.value }))}
                  placeholder={t.customActivityPlaceholder}
                />
              </div>
            )}
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20">
            {isSaving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ البيانات' : 'Save Profile')}
          </Button>
        </div>
      </motion.div>
    );
  };

  const isAr = lang === 'ar';

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#060B16]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-600/20 border-t-blue-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="font-black text-blue-600 tracking-widest text-sm animate-pulse uppercase">
            {isAr ? 'جاري التحقق من الهوية...' : 'Authenticating...'}
          </p>
        </div>
      </div>
    );
  }

  // --- ACCESS GATE ---
  if (user && isApproved === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#060B16] p-8 text-center">
        <div className="w-24 h-24 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mb-8">
            <UserMinus size={48} />
        </div>
        <h1 className="text-3xl font-black mb-4 uppercase tracking-tight">
            {isAr ? 'بانتظار الموافقة' : 'Pending Approval'}
        </h1>
        <p className="max-w-md text-[#666666] dark:text-[#94A3B8] font-bold text-lg mb-10">
            {isAr 
                ? 'مرحباً! لقد سجلت بنجاح، ولكن يجب أن يوافق المالك على حسابك قبل البدء في استخدامه. يرجى التواصل مع المالك للاشتراك.' 
                : 'Hi there! You logged in successfully, but the owner needs to approve your account before you can start using it. Please contact the owner to subscribe.'}
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
            <Button onClick={() => window.open('https://t.me/GN_OA', '_blank')} className="py-4 bg-[#0088cc] hover:bg-[#007dab] text-white flex items-center justify-center gap-2">
                <Send size={18} />
                {isAr ? 'تواصل عبر تيليجرام (@GN_OA)' : 'Contact via Telegram (@GN_OA)'}
            </Button>
            <Button onClick={() => window.open('https://wa.me/201553251011', '_blank')} className="py-4 bg-[#25D366] hover:bg-[#20bd5c] text-white flex items-center justify-center gap-2 border-none">
                <MessageSquare size={18} />
                {isAr ? 'تواصل عبر واتساب (01553251011)' : 'Contact via WhatsApp (01553251011)'}
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="py-4">
                {isAr ? 'تسجيل الخروج' : 'Logout'}
            </Button>
        </div>
      </div>
    );
  }

  const DebugPanel = () => (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-xs bg-black/90 text-[10px] text-white p-4 rounded-2xl border border-white/20 font-mono shadow-2xl backdrop-blur-xl">
      <div className="flex justify-between items-center mb-2">
        <span className="font-black text-blue-400">DEBUG PANEL</span>
        <button onClick={() => setShowDebug(false)} className="hover:text-red-500">CLOSE</button>
      </div>
      <p className="mb-1"><span className="text-gray-400">EMAIL:</span> {user?.email || 'Guest'}</p>
      <p className="mb-1 overflow-hidden text-ellipsis"><span className="text-gray-400">UID:</span> {user?.uid || 'N/A'}</p>
      <p className="mb-1"><span className="text-gray-400">PATH:</span> clients</p>
      <p className="mb-1"><span className="text-gray-400">COUNT:</span> {contacts.length}</p>
      {lastFirebaseError && <p className="mt-2 text-red-500 border-t border-red-500/30 pt-1">ERR: {lastFirebaseError}</p>}
    </div>
  );

  return (
    <div 
      className={cn(
        "min-h-screen bg-surface-bg dark:bg-[#060B16] text-on-surface dark:text-[#E2E8F0] transition-colors duration-300 selection:bg-brand-primary selection:text-white pb-10", 
        lang === 'ar' ? 'font-arabic' : 'font-sans'
      )} 
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {showDebug && <DebugPanel />}
      
      {/* Sidebar Navigation */}
      <aside className={cn(
        "no-print fixed top-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 z-50 transition-all duration-300 hidden lg:flex flex-col shadow-xl",
        lang === 'ar' ? 'right-0 border-l' : 'left-0 border-r'
      )}>
        <div className="p-8 flex flex-col items-center border-b border-slate-50 dark:border-white/5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20 mb-4">
            <FileText size={28} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-brand-primary">{t.title}</span>
          <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{lang === 'en' ? 'Invoice Master' : 'نظام إدارة الفواتير'}</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-6">
          <SidebarNavItem icon={<LayoutDashboard size={20} />} label={t.dashboard} active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsPreviewMode(false); }} />
          <SidebarNavItem icon={<FileText size={20} />} label={lang === 'en' ? 'Invoices' : 'الفواتير'} active={activeTab === 'history'} onClick={() => { setActiveTab('history'); setIsPreviewMode(false); }} />
          <SidebarNavItem icon={<Users size={20} />} label={t.clients} active={activeTab === 'contacts'} onClick={() => { setActiveTab('contacts'); setIsPreviewMode(false); }} />
          <SidebarNavItem icon={<Wallet size={20} />} label={lang === 'en' ? 'Payments' : 'المدفوعات'} active={activeTab === 'payments'} onClick={() => { setActiveTab('payments'); setIsPreviewMode(false); }} />
          <SidebarNavItem icon={<ArrowDownLeft size={20} />} label={lang === 'en' ? 'Expenses' : 'المصاريف'} active={activeTab === 'expenses'} onClick={() => { setActiveTab('expenses'); setIsPreviewMode(false); }} />
          {isSuperAdmin && (
            <SidebarNavItem 
              icon={<Users size={20} className="text-brand-primary" />} 
              label={lang === 'en' ? 'Subscribers' : 'المشتركين'} 
              active={activeTab === 'subscribers'} 
              onClick={() => { setActiveTab('subscribers'); setIsPreviewMode(false); }} 
            />
          )}
        </nav>

        <div className="p-6 border-t border-slate-50 dark:border-white/5 space-y-2">
          <button 
            onClick={() => { setActiveTab('invoices'); setIsPreviewMode(false); }}
            className="w-full bg-brand-primary text-white py-4 rounded-2xl font-black text-sm mb-4 hover:shadow-lg shadow-brand-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            {lang === 'en' ? 'New Invoice' : 'فاتورة جديدة'}
          </button>
          <SidebarNavItem icon={<Settings size={20} />} label={lang === 'en' ? 'Settings' : 'الإعدادات'} active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); setIsPreviewMode(false); }} />
          <SidebarNavItem icon={<LogOut size={20} />} label={t.logout} active={false} onClick={handleLogout} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5" />
        </div>
      </aside>

      {/* Persistence Notice (Sticky overlay) */}
      {!user && (
        <div className={cn("no-print fixed top-0 left-0 right-0 z-[100] bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-900/10 p-2 text-center", lang === 'ar' ? 'lg:mr-64' : 'lg:ml-64')}>
          <p className="text-[10px] md:text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center justify-center gap-2">
            <CloudOff size={14} />
            {lang === 'en' 
              ? 'Guest Mode: Login to sync with cloud.' 
              : 'وضع الزائر: سجل دخولك للمزامنة السحابية.'}
            <button onClick={() => navigate('/login')} className="underline ml-1 cursor-pointer font-black">{t.login}</button>
          </p>
        </div>
      )}

      {/* Main Content Area */}
      <div className={cn(
        "transition-all duration-300",
        lang === 'ar' ? 'lg:mr-64' : 'lg:ml-64'
      )}>
        {/* Top bar Header */}
        <header className="no-print sticky top-0 z-40 bg-white/80 dark:bg-[#060B16]/80 backdrop-blur-md border-b border-slate-100 dark:border-white/5">
          <div className="px-6 h-16 flex items-center justify-between">
            {/* Mobile Nav Toggle / Search */}
            <div className="flex items-center gap-4 flex-1">
              <div className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/5">
                <FileText size={24} className="text-brand-primary" />
              </div>
              <div className="relative max-w-md w-full hidden md:block">
                <Search size={18} className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", lang === 'ar' ? 'right-3' : 'left-3')} />
                <input 
                  type="text" 
                  placeholder={lang === 'en' ? 'Search records...' : 'بحث في السجلات...'} 
                  className={cn("w-full py-2 bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all", lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4')}
                />
              </div>
            </div>

            {/* Profile & Tools */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)} className="h-10 w-10 border border-transparent hover:border-slate-100 dark:hover:border-white/10 rounded-full">
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="h-10 w-10 border border-transparent hover:border-slate-100 dark:hover:border-white/10 rounded-full font-black text-xs">
                  {lang === 'en' ? 'AR' : 'EN'}
                </Button>
                {user && (
                  <Button variant="ghost" size="icon" onClick={() => setShowDebug(!showDebug)} className="h-10 w-10 border border-transparent hover:border-slate-100 dark:hover:border-white/10 rounded-full text-brand-primary/60">
                    <Settings size={20} />
                  </Button>
                )}
              </div>

              <div className="h-8 w-[1px] bg-slate-100 dark:bg-white/10 mx-2" />

              {user ? (
                <div className="flex items-center gap-3 cursor-pointer group px-2 py-1 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black leading-tight">{user.displayName || user.email?.split('@')[0]}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'en' ? 'Account Admin' : 'مدير الحساب'}</p>
                  </div>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border-2 border-brand-primary/10 group-hover:border-brand-primary transition-all" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center font-black text-brand-primary">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              ) : (
                <Button size="sm" onClick={() => navigate('/login')} className="rounded-xl bg-brand-primary font-black text-xs px-4">
                  {t.login}
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Global Persistence Notification if syncing */}
        {user && hasLocalData && (
          <div className="no-print bg-blue-600/10 dark:bg-blue-600/5 p-3 flex items-center justify-center gap-3 border-b border-blue-100 dark:border-blue-900/10">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-400">
              {lang === 'en' 
                ? 'You have unsynced guest data.' 
                : 'لديك بيانات غير متزامنة من وضع الزائر.'}
            </p>
            <Button size="sm" onClick={handleSyncData} disabled={isSavingToFirestore} className="bg-blue-600 text-white h-7 text-[10px] px-3 font-black rounded-lg">
              {isSavingToFirestore ? (isAr ? 'جاري...' : 'Syncing...') : (isAr ? 'دمج البيانات' : 'Sync Now')}
            </Button>
          </div>
        )}

        <main className="px-6 py-10 md:px-10 lg:py-12">
          <AnimatePresence mode="wait">
          {activeTab === 'invoices' ? (
            !isPreviewMode ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-3xl"
            >
              <div className="mb-12 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#F5F5F5] dark:bg-[#0F172A] px-3 py-1 text-xs font-semibold text-[#666666] dark:text-[#94A3B8] mb-4"
                >
                  <Sparkles size={16} />
                  {t.subtitle}
                </motion.div>
                <h1 className="text-4xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#E2E8F0] md:text-5xl">
                  {t.heroTitle}
                </h1>
                <p className="mt-4 text-lg text-[#666666] dark:text-[#94A3B8]">
                  {t.heroDesc}
                </p>
              </div>

              <div className="rounded-3xl border-2 border-[#1A1A1A] bg-white dark:bg-[#0F172A] dark:border-white/10 p-6 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] dark:shadow-none md:p-10">
                <div className="grid gap-8">
                  {/* Business Info Section */}
                  <section className="grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2 relative">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="mb-0">{t.invoiceTitle}</Label>
                        {invoiceData.serialNumber && (
                          <span className="text-xs font-black text-blue-600 bg-blue-100 dark:bg-blue-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                            {invoiceData.serialNumber}
                          </span>
                        )}
                      </div>
                      <Input 
                        placeholder={t.invoiceTitlePlaceholder}
                        value={invoiceData.invoiceTitle}
                        onChange={(e) => handleFieldChangeWithSuggestions('invoiceTitle', e.target.value)}
                        onBlur={() => setTimeout(() => setActiveSuggestionField(null), 200)}
                      />
                      {activeSuggestionField === 'invoiceTitle' && filteredSuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#0F172A] border border-[#1A1A1A]/10 dark:border-white/10 rounded-xl shadow-xl overflow-hidden">
                          {filteredSuggestions.map((s, i) => (
                            <button 
                              key={i} 
                              onClick={() => selectSuggestion(s)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-[#F5F5F5] dark:hover:bg-white/5 transition-colors"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="relative">
                      <Label>{t.serviceProviderLabel}</Label>
                      <Input 
                        placeholder={t.serviceProviderPlaceholder}
                        value={invoiceData.serviceProvider}
                        onChange={(e) => handleFieldChangeWithSuggestions('serviceProvider', e.target.value)}
                        onBlur={() => setTimeout(() => setActiveSuggestionField(null), 200)}
                      />
                      {activeSuggestionField === 'serviceProvider' && filteredSuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#0F172A] border border-[#1A1A1A]/10 dark:border-white/10 rounded-xl shadow-xl overflow-hidden">
                          {filteredSuggestions.map((s, i) => (
                            <button 
                              key={i} 
                              onClick={() => selectSuggestion(s)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-[#F5F5F5] dark:hover:bg-white/5 transition-colors"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <Label>{t.clientNameLabel}</Label>
                      {contacts.length > 0 && (
                        <div className="mb-2 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {contacts.slice(0, 5).map(c => (
                            <button 
                              key={c.id} 
                              onClick={() => setInvoiceData(prev => ({ ...prev, clientName: c.name, contactId: c.id }))}
                              className={cn(
                                "whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-black border transition-all",
                                invoiceData.contactId === c.id 
                                  ? "bg-blue-600 text-white border-blue-600" 
                                  : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-[#666666]"
                              )}
                            >
                              {c.name}
                            </button>
                          ))}
                        </div>
                      )}
                      <Input 
                        placeholder={t.clientNamePlaceholder}
                        value={invoiceData.clientName}
                        onChange={(e) => {
                          handleFieldChangeWithSuggestions('clientName', e.target.value);
                        }}
                        onBlur={() => setTimeout(() => setActiveSuggestionField(null), 200)}
                      />
                      {activeSuggestionField === 'clientName' && filteredSuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#0F172A] border border-[#1A1A1A]/10 dark:border-white/10 rounded-xl shadow-xl overflow-hidden">
                          {filteredSuggestions.map((s, i) => (
                            <button 
                              key={i} 
                              onClick={() => selectSuggestion(s)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-[#F5F5F5] dark:hover:bg-white/5 transition-colors"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>{t.businessActivity}</Label>
                        <select
                          value={invoiceData.activityIndex}
                          onChange={(e) => setInvoiceData(prev => ({ ...prev, activityIndex: parseInt(e.target.value) || 0 }))}
                          className="flex h-11 w-full rounded-lg border border-[#E5E5E5] bg-white dark:bg-[#121212] dark:border-[#333333] dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5 focus:border-[#1A1A1A] transition-all"
                        >
                          {t.activities.map((activity, idx) => (
                            <option key={activity} value={idx}>{activity}</option>
                          ))}
                        </select>
                      </div>
                      {invoiceData.activityIndex === t.activities.length - 1 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="overflow-hidden"
                        >
                          <Label>{t.customActivity}</Label>
                          <Input 
                            placeholder={t.customActivityPlaceholder}
                            value={invoiceData.customActivity}
                            onChange={(e) => setInvoiceData(prev => ({ ...prev, customActivity: e.target.value }))}
                          />
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>{t.contactPhone}</Label>
                        <div className="relative">
                          <Phone className={cn("absolute top-1/2 -translate-y-1/2 text-[#999999]", lang === 'ar' ? 'right-3' : 'left-3')} size={20} />
                          <Input 
                            placeholder={t.phonePlaceholder}
                            className={lang === 'ar' ? 'pr-12' : 'pl-12'}
                            value={invoiceData.phoneNumber}
                            onChange={(e) => handleFieldChangeWithSuggestions('phoneNumber', e.target.value)}
                            onBlur={() => setTimeout(() => setActiveSuggestionField(null), 200)}
                          />
                          {activeSuggestionField === 'phoneNumber' && filteredSuggestions.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#0F172A] border border-[#1A1A1A]/10 dark:border-white/10 rounded-xl shadow-xl overflow-hidden">
                              {filteredSuggestions.map((s, i) => (
                                <button 
                                  key={i} 
                                  onClick={() => selectSuggestion(s)}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-[#F5F5F5] dark:hover:bg-white/5 transition-colors"
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <Label>{lang === 'en' ? 'Invoice Status' : 'حالة الفاتورة'}</Label>
                        <div className="flex gap-2">
                          {(['pending', 'paid', 'overdue', 'partially-paid'] as const).map(s => (
                            <button 
                              key={s}
                              onClick={() => {
                                setInvoiceData(prev => {
                                  const newData = { ...prev, status: s };
                                  if (s === 'partially-paid' && (prev.paidAmount === undefined || prev.paidAmount === total)) {
                                    // If switching to partial and no specific paid amount yet,
                                    // default to half or just trigger the input visibility
                                    newData.paidAmount = total > 0 ? total : 0;
                                  } else if (s === 'paid') {
                                    newData.paidAmount = total;
                                  } else if (s === 'pending' || s === 'overdue') {
                                    newData.paidAmount = 0;
                                  }
                                  return newData;
                                });
                              }}
                              className={cn(
                                "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                invoiceData.status === s
                                  ? (s === 'paid' ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" : 
                                     s === 'pending' ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20" : 
                                     s === 'partially-paid' ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20" :
                                     "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20")
                                  : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-[#666666]"
                              )}
                            >
                              {s === 'paid' ? (lang === 'en' ? 'Paid' : 'مدفوعة') : 
                               s === 'pending' ? (lang === 'en' ? 'Pending' : 'قيد الانتظار') : 
                               s === 'partially-paid' ? (lang === 'en' ? 'Partial' : 'باقي') :
                               (lang === 'en' ? 'Overdue' : 'متأخرة')}
                            </button>
                          ))}
                        </div>

                        {invoiceData.status === 'partially-paid' && (
                          <div className="mt-4 p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 active-glow">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                                  <Wallet size={20} />
                                </div>
                                <div>
                                  <Label className="text-blue-900 dark:text-blue-100 mb-0 text-base font-black leading-none">{t.remainingAmount}</Label>
                                  <p className="text-[9px] text-blue-600/70 dark:text-blue-400/70 font-bold uppercase tracking-widest mt-1">
                                    {lang === 'en' ? 'CLIENT DEBT' : 'مديونية العميل'}
                                  </p>
                                </div>
                              </div>
                              <div className="relative w-full md:w-48">
                                <span className={cn("absolute top-1/2 -translate-y-1/2 text-blue-400 font-black", lang === 'ar' ? 'right-4 text-sm' : 'left-4 text-sm')}>
                                  {t.currencySymbol}
                                </span>
                                <input 
                                  type="number"
                                  value={total - (invoiceData.paidAmount ?? total)}
                                  onChange={(e) => {
                                    const remaining = Math.max(0, Number(e.target.value) || 0);
                                    const paid = Math.max(0, total - remaining);
                                    setInvoiceData(prev => ({ ...prev, paidAmount: paid }));
                                  }}
                                  className={cn(
                                    "w-full py-3 rounded-xl bg-white dark:bg-[#0F172A] border-2 border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 font-black text-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all",
                                    lang === 'ar' ? 'pr-10 pl-4 text-left' : 'pl-10 pr-4'
                                  )}
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Logo Section */}
                  <section>
                    <Label>{t.businessLogo}</Label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "group relative flex h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E5E5E5] dark:border-white/10 bg-[#F9F9F9] dark:bg-[#060B16] transition-all hover:border-[#1A1A1A] dark:hover:border-[#E2E8F0] hover:bg-[#F5F5F5] dark:hover:bg-[#0F172A]",
                        invoiceData.logo && "border-solid border-[#F0F0F0] dark:border-white/5 bg-white dark:bg-[#0F172A]"
                      )}
                    >
                      {invoiceData.logo ? (
                        <div className="relative h-full w-full p-4">
                          <img 
                            src={invoiceData.logo} 
                            alt="Logo preview" 
                            className="h-full w-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 rounded-2xl">
                            <span className="text-sm font-medium text-white">{t.changeLogo}</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="mb-3 rounded-full bg-white dark:bg-[#0F172A] p-3 shadow-sm transition-transform group-hover:scale-110">
                            <ImageIcon className="text-[#666666] dark:text-[#94A3B8]" size={32} />
                          </div>
                          <p className="text-sm font-medium text-[#1A1A1A] dark:text-[#E2E8F0]">{t.uploadLogo}</p>
                          <p className="mt-1 text-xs text-[#999999] dark:text-[#94A3B8]">{t.logoDesc}</p>
                        </>
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                    </div>
                  </section>

                  {/* Items Section */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="mb-0">{t.invoiceItems}</Label>
                      <span className="text-xs font-medium text-[#999999] dark:text-[#94A3B8]">{t.total}: {t.currencySymbol}{total.toLocaleString()}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <AnimatePresence initial={false}>
                        {invoiceData.items.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="flex items-end gap-3"
                          >
                            <div className="flex-1 relative">
                              {index === 0 && <Label className="text-[10px] opacity-50">{t.description}</Label>}
                              <Input 
                                placeholder={t.descPlaceholder}
                                value={item.description}
                                onChange={(e) => handleFieldChangeWithSuggestions('description', e.target.value, index)}
                                onBlur={() => setTimeout(() => {
                                  setActiveSuggestionField(null);
                                  setActiveItemIndex(null);
                                }, 200)}
                              />
                              {activeSuggestionField === 'description' && activeItemIndex === index && filteredSuggestions.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#0F172A] border border-[#1A1A1A]/10 dark:border-white/10 rounded-xl shadow-xl overflow-hidden">
                                  {filteredSuggestions.map((s, i) => (
                                    <button 
                                      key={i} 
                                      onClick={() => selectSuggestion(s)}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-[#F5F5F5] dark:hover:bg-white/5 transition-colors"
                                    >
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="w-32">
                              {index === 0 && <Label className="text-[10px] opacity-50">{t.price}</Label>}
                              <Input 
                                type="number"
                                placeholder="0.00"
                                value={item.price || ''}
                                onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <Button 
                              variant="ghost" 
                              onClick={() => handleRemoveItem(item.id)}
                              className="h-11 w-11 p-0 text-red-400 hover:text-red-600"
                              disabled={invoiceData.items.length === 1}
                            >
                              <Trash2 size={22} />
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    <Button 
                      variant="outline" 
                      onClick={handleAddItem}
                      className="w-full border-dashed border-[#E5E5E5] dark:border-white/10 py-6 text-[#666666] dark:text-[#94A3B8] hover:border-[#1A1A1A] dark:hover:border-[#E2E8F0] hover:text-[#1A1A1A] dark:hover:text-[#E2E8F0]"
                    >
                      <Plus size={20} className={lang === 'ar' ? 'ml-2' : 'mr-2'} /> {t.addItem}
                    </Button>
                  </section>

                  <div className="mt-6 border-t border-[#F0F0F0] dark:border-white/5 pt-8">
                    {formError && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                      >
                        {formError}
                      </motion.div>
                    )}
                    {showSaveSuccess && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl flex items-center gap-2 border border-emerald-100 dark:border-emerald-500/20 font-bold"
                      >
                        <CheckCircle2 size={18} />
                        {lang === 'ar' ? 'تم الحفظ بنجاح!' : 'Saved successfully!'}
                      </motion.div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex-1 py-7 text-base font-bold tracking-wide uppercase"
                      >
                        {isGenerating ? (
                          <div className="flex items-center gap-3">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            {t.generating}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {t.generate} <ChevronRight size={22} className={lang === 'ar' ? 'rotate-180' : ''} />
                          </div>
                        )}
                      </Button>

                      <Button 
                        variant="secondary"
                        onClick={() => invoiceData.id ? handleSaveToHistory() : setShowSaveModal(true)}
                        disabled={isSavingToFirestore}
                        className="flex-1 py-7 text-base font-bold tracking-wide uppercase bg-slate-100 dark:bg-white/10 text-[#1A1A1A] dark:text-white border-none hover:bg-slate-200 dark:hover:bg-white/20"
                      >
                        <div className="flex items-center gap-2">
                          <Save size={20} />
                          {invoiceData.id ? t.saveChanges : t.saveToHistory}
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-4xl"
            >
              <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-4">
                <Button variant="ghost" onClick={() => setIsPreviewMode(false)} className="gap-2">
                  <ArrowLeft size={20} className={lang === 'ar' ? 'rotate-180' : ''} /> {t.backToEditor}
                </Button>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={openSaveModal} className="gap-2">
                    <Save size={20} /> {t.saveToHistory}
                  </Button>
                  <Button variant="outline" onClick={handlePrint} disabled={isGenerating} className="gap-2">
                    <Printer size={20} /> {t.print}
                  </Button>
                  <Button variant="outline" onClick={handleDownloadImage} disabled={isDownloadingImage} className="gap-2">
                    {isDownloadingImage ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1A1A1A] border-t-transparent" /> : <DownloadCloud size={20} />}
                    {t.downloadPng}
                  </Button>
                  <Button onClick={handleDownloadPdf} disabled={isGenerating} className="gap-2">
                    {isGenerating ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <Download size={20} />
                    )}
                    {t.download}
                  </Button>
                </div>
              </div>

              {/* Invoice Template */}
              <div ref={invoiceRef} className="invoice-container relative overflow-hidden rounded-3xl border-2 border-[#1A1A1A] dark:border-white/20 bg-white dark:bg-[#0F172A] p-8 shadow-2xl shadow-[#1A1A1A]/5 md:p-16">
                <div className="relative z-10 bg-white dark:bg-[#0F172A]">
                  {/* Decorative Elements */}
                  <div className={cn("absolute top-0 h-32 w-32 bg-[#F9F9F9] dark:bg-[#060B16] rounded-bl-[100px] -mt-10", lang === 'ar' ? 'left-0 -ml-10 rounded-br-[100px] rounded-bl-none' : 'right-0 -mr-10')} />
                  
                  <div className="relative z-10">
                  {/* Invoice Header */}
                  <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
                    <div>
                      {invoiceData.logo ? (
                        <img 
                          src={invoiceData.logo} 
                          alt="Business Logo" 
                          className="h-16 w-auto object-contain mb-6"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F5F5] dark:bg-[#060B16] text-[#CCCCCC]">
                          <ImageIcon size={32} />
                        </div>
                      )}
                      <h2 className={cn("text-xs font-bold uppercase text-[#999999] dark:text-[#94A3B8] mb-1", lang === 'en' && "tracking-[0.2em]")}>{t.businessActivity}</h2>
                      <p className="text-xl font-semibold text-[#1A1A1A] dark:text-[#E2E8F0]">{activityDisplay}</p>
                    </div>
                    
                    <div className={cn("text-left", lang === 'ar' ? 'md:text-left' : 'md:text-right')}>
                      <h1 className={cn("text-5xl font-black text-[#1A1A1A] dark:text-[#E2E8F0] uppercase", lang === 'en' ? "tracking-tighter mb-2" : "mb-10")}>{t.invoice}</h1>
                      <p className={cn("text-sm font-bold text-[#666666] dark:text-[#94A3B8] uppercase", lang === 'en' ? "tracking-widest mb-4" : "mb-6")}>{invoiceData.invoiceTitle || t.invoiceTitlePlaceholder}</p>
                      <div className="space-y-1 text-sm text-[#666666] dark:text-[#94A3B8]">
                        <p className="font-medium">{t.date}: {new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG-u-ca-gregory' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        <p>{t.invoiceNo}: #INV-{Math.floor(100000 + Math.random() * 900000)}</p>
                      </div>
                      {!isGenerating && (
                        <div className={cn("mt-4 flex no-print", lang === 'ar' ? 'justify-start' : 'justify-end')}>
                          <span className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm",
                            invoiceData.status === 'paid' ? "bg-emerald-500 text-white" : 
                            invoiceData.status === 'pending' ? "bg-orange-500 text-white" : 
                            invoiceData.status === 'partially-paid' ? "bg-blue-500 text-white" :
                            "bg-red-500 text-white"
                          )}>
                            {invoiceData.status === 'paid' ? (lang === 'en' ? 'Paid' : 'مدفوعة') : 
                             invoiceData.status === 'pending' ? (lang === 'en' ? 'Pending' : 'قيد الانتظار') : 
                             invoiceData.status === 'partially-paid' ? (lang === 'en' ? 'Partial' : 'باقي') :
                             (lang === 'en' ? 'Overdue' : 'متأخرة')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="my-16 h-px w-full bg-[#F0F0F0] dark:bg-white/5" />

                  {/* Contact Section */}
                  <div className="grid gap-12 md:grid-cols-2">
                    <div>
                      <h3 className={cn("text-xs font-bold uppercase text-[#999999] dark:text-[#94A3B8] mb-4", lang === 'en' && "tracking-[0.2em]")}>{t.billedFrom}</h3>
                      <div className="space-y-2">
                        <p className="text-lg font-bold text-[#1A1A1A] dark:text-[#E2E8F0]">{invoiceData.serviceProvider || activityDisplay}</p>
                        <p className="text-sm text-[#666666] dark:text-[#94A3B8]">{activityDisplay}</p>
                        {invoiceData.phoneNumber && (
                          <div className="flex items-center gap-2 text-[#666666] dark:text-[#94A3B8]">
                            <Phone size={14} />
                            <span className="text-sm">{invoiceData.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={cn("", lang === 'ar' ? 'md:text-left' : 'md:text-right')}>
                      <h3 className={cn("text-xs font-bold uppercase text-[#999999] dark:text-[#94A3B8] mb-4", lang === 'en' && "tracking-[0.2em]")}>{t.billedTo}</h3>
                      <p className="text-lg font-bold text-[#1A1A1A] dark:text-[#E2E8F0]">{invoiceData.clientName || t.client}</p>
                      <p className="text-sm text-[#666666] dark:text-[#94A3B8]">{t.recipient}</p>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="mt-16">
                    <div className={cn("grid grid-cols-12 border-b-2 border-[#1A1A1A] dark:border-[#E2E8F0] pb-4 text-xs font-bold uppercase text-[#1A1A1A] dark:text-[#E2E8F0]", lang === 'en' && "tracking-widest")}>
                      <div className="col-span-8 md:col-span-9">{t.description}</div>
                      <div className={cn("col-span-4 md:col-span-3", lang === 'ar' ? 'text-left' : 'text-right')}>{t.amount}</div>
                    </div>
                    
                    <div className="divide-y divide-[#F5F5F5] dark:divide-white/5">
                      {invoiceData.items.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 py-6">
                          <div className="col-span-8 md:col-span-9">
                            <p className="text-base font-medium text-[#1A1A1A] dark:text-[#E2E8F0]">{item.description}</p>
                          </div>
                          <div className={cn("col-span-4 text-base font-bold text-[#1A1A1A] dark:text-[#E2E8F0] md:col-span-3", lang === 'ar' ? 'text-left' : 'text-right')}>
                            {t.currencySymbol}{Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className={cn("mt-8 flex flex-col", lang === 'ar' ? 'items-start' : 'items-end')}>
                    <div className="w-full max-w-xs space-y-4">
                      <div className="flex justify-between text-sm text-[#666666] dark:text-[#94A3B8]">
                        <span>{t.subtotal}</span>
                        <span className="font-medium text-[#1A1A1A] dark:text-[#E2E8F0]">{t.currencySymbol}{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="h-px bg-[#F0F0F0] dark:bg-white/5" />
                       <div className="flex justify-between pt-2">
                        <span className="text-lg font-bold text-[#1A1A1A] dark:text-[#E2E8F0]">{t.totalAmount}</span>
                        <span className="text-2xl font-black text-[#1A1A1A] dark:text-[#E2E8F0]">{t.currencySymbol}{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      
                      {invoiceData.status === 'partially-paid' && (
                        <div className="space-y-2 mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-white/10 text-right">
                          <div className="flex justify-between text-sm text-[#666666] dark:text-[#94A3B8]">
                            <span>{t.paidAmount}</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{t.currencySymbol}{(invoiceData.paidAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between text-sm text-[#666666] dark:text-[#94A3B8]">
                            <span>{t.remainingAmount}</span>
                            <span className="font-bold text-red-600 dark:text-red-400">{t.currencySymbol}{(total - (invoiceData.paidAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Bottom */}
                  {(invoiceData.phoneNumber || invoiceData.whatsapp || invoiceData.telegram) && (
                    <div className="mt-24 flex flex-col items-center justify-center gap-6 border-t-2 border-[#F0F0F0] dark:border-white/5 pt-16">
                      <div className="flex flex-wrap items-center justify-center gap-8">
                        {invoiceData.phoneNumber && (
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-[#666666] dark:text-[#94A3B8] uppercase tracking-widest">
                               {lang === 'ar' ? 'الجوال:' : 'Phone:'}
                            </span>
                            <span className="text-2xl font-black text-[#1A1A1A] dark:text-[#E2E8F0] tracking-tighter">
                               {invoiceData.phoneNumber}
                            </span>
                          </div>
                        )}
                        {invoiceData.whatsapp && (
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-[#666666] dark:text-[#94A3B8] uppercase tracking-widest">
                               {lang === 'ar' ? 'واتساب:' : 'WhatsApp:'}
                            </span>
                            <span className="text-2xl font-black text-[#1A1A1A] dark:text-[#E2E8F0] tracking-tighter">
                               {invoiceData.whatsapp}
                            </span>
                          </div>
                        )}
                        {invoiceData.telegram && (
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-[#666666] dark:text-[#94A3B8] uppercase tracking-widest">
                               {lang === 'ar' ? 'تلجرام:' : 'Telegram:'}
                            </span>
                            <span className="text-2xl font-black text-[#1A1A1A] dark:text-[#E2E8F0] tracking-tighter">
                               {invoiceData.telegram}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Actions & QR - Outside of invoice container to prevent appearing in print/export */}
            <div className="mt-12 space-y-8 no-print">
              <div className="rounded-[40px] bg-white dark:bg-white/5 border-2 border-[#1A1A1A]/10 dark:border-white/10 p-12 text-center shadow-xl shadow-[#1A1A1A]/5">
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-3xl shadow-xl mb-6">
                    <QRCodeSVG 
                      value={window.location.href + `?invoice=${invoiceData.id}`} 
                      size={120}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#999999] mb-8">
                    {lang === 'en' ? 'Scan to view digital version' : 'امسح الرمز للمعاملة الرقمية'}
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold" onClick={() => {
                      navigator.clipboard.writeText(window.location.href + `?invoice=${invoiceData.id}`);
                      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
                    }}>
                      <LinkIcon size={18} className={lang === 'ar' ? 'ml-2' : 'mr-2'} />
                      {lang === 'en' ? 'Copy Link' : 'نسخ الرابط'}
                    </Button>
                    <Button onClick={() => window.print()} className="rounded-2xl h-12 px-6 font-bold bg-[#1A1A1A] hover:bg-black dark:bg-white dark:text-[#1A1A1A]">
                      <Printer size={18} className={lang === 'ar' ? 'ml-2' : 'mr-2'} />
                      {lang === 'en' ? 'Print Invoice' : 'طباعة الفاتورة'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-[#999999]">
                <Briefcase size={18} />
                <span>{t.poweredBy}</span>
              </div>
            </div>
          </motion.div>
          )
          ) : activeTab === 'contacts' ? (
            <ContactsView />
          ) : activeTab === 'payments' ? (
            <PaymentsView />
          ) : activeTab === 'expenses' ? (
            <ExpensesView />
          ) : activeTab === 'subscribers' ? (
            <SubscribersView />
          ) : activeTab === 'profile' ? (
            <ProfileView />
          ) : activeTab === 'history' ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black">{t.history}</h2>
                  <p className="text-[#666666] dark:text-[#94A3B8]">{lang === 'en' ? 'Manage and track all your recorded business transactions' : 'إدارة وتتبع جميع معاملاتك التجارية المسجلة'}</p>
                </div>
                <Button onClick={() => { setActiveTab('invoices'); setIsPreviewMode(false); }} className="gap-2">
                  <Plus size={18} /> {lang === 'en' ? 'New Invoice' : 'فاتورة جديدة'}
                </Button>
              </div>
              <div className="bg-white dark:bg-[#0F172A] border-2 border-[#1A1A1A] dark:border-white/10 rounded-[40px] p-8 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] dark:shadow-none">
                <HistoryContent />
              </div>
            </div>
          ) : (
            <DashboardView />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-[#F0F0F0] dark:border-white/5 py-12">
        <div className="container mx-auto px-4 text-center md:px-8">
          <div className="mb-6 flex flex-wrap justify-center gap-6 text-sm font-bold text-[#666666] dark:text-[#94A3B8]">
            <a href="https://t.me/GN_OA" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-500 transition-colors">
               <Send size={18} />
               <span>GN_OA</span>
            </a>
            <a href="https://wa.me/201553251011" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-emerald-500 transition-colors">
               <MessageSquare size={18} />
               <span>01553251011</span>
            </a>
          </div>
          <p className="text-sm text-[#999999] dark:text-[#94A3B8]">
            © 2026 {t.title}. {t.allRightsReserved}
          </p>
        </div>
      </footer>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white dark:bg-[#0F172A] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#F0F0F0] dark:border-white/5 p-6">
                <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-[#E2E8F0]">{t.history}</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)} className="rounded-full">
                  <X size={20} />
                </Button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-6">
                <HistoryContent />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modals Container */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSaveModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0F172A] p-8 shadow-2xl border border-[#1A1A1A]/10 dark:border-white/10">
              <h2 className="text-2xl font-black text-[#1A1A1A] dark:text-[#E2E8F0] mb-2">{lang === 'ar' ? 'حفظ الفاتورة' : 'Save Invoice'}</h2>
              <p className="text-sm text-[#666666] dark:text-[#94A3B8] mb-6">{t.saveNamePrompt}</p>
              <Input 
                autoFocus
                placeholder={t.saveNamePlaceholder} 
                value={saveNameInput} 
                onChange={(e) => setSaveNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveToHistory()}
                className="mb-8 h-14 text-lg font-bold"
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowSaveModal(false)} className="flex-1 py-4">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
                <Button onClick={handleSaveToHistory} className="flex-1 py-4 gap-2" disabled={isSavingToFirestore}>
                  {isSavingToFirestore ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      {user && <Cloud size={18} className="text-white/70" />}
                      <span>{lang === 'ar' ? 'تأكيد الحفظ السحابي' : 'Confirm Cloud Save'}</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {clientToDelete && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setClientToDelete(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-sm rounded-[32px] bg-white dark:bg-[#0F172A] p-8 shadow-2xl text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">{lang === 'en' ? 'Delete Client?' : 'حذف العميل؟'}</h3>
              <p className="text-[#666666] dark:text-[#94A3B8] text-sm mb-8">
                {lang === 'en' 
                  ? 'This will permanently remove the client and all associated record links.' 
                  : 'سيؤدي هذا إلى حذف العميل نهائياً وجميع روابط السجلات المرتبطة به.'}
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setClientToDelete(null)} className="flex-1 py-4">
                  {lang === 'en' ? 'Cancel' : 'إلغاء'}
                </Button>
                <Button onClick={confirmDeleteClient} className="flex-1 py-4 bg-red-500 hover:bg-red-600 border-none text-white font-bold">
                  {lang === 'en' ? 'Delete' : 'حذف'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteConfirm(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#0F172A] p-8 shadow-2xl border border-red-100 dark:border-red-900/30">
              <div className="mx-auto w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 mb-6">
                <Trash2 size={32} />
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-[#E2E8F0] text-center mb-2">{lang === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?'}</h2>
              <p className="text-sm text-[#666666] dark:text-[#94A3B8] text-center mb-8">{lang === 'ar' ? 'سيتم حذف هذه الفاتورة نهائياً من السجل.' : 'This invoice will be permanently deleted from history.'}</p>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-4">{lang === 'ar' ? 'تراجع' : 'Cancel'}</Button>
                <Button variant="primary" onClick={handleDeleteInvoice} className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white border-none shadow-none">{lang === 'ar' ? 'حذف الآن' : 'Delete Now'}</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddContact && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowAddContact(false); setEditingContactId(null); setNewContactData({ name: '', phone: '', email: '', address: '' }); }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg rounded-[32px] bg-white dark:bg-[#0F172A] p-8 shadow-2xl border border-blue-100 dark:border-blue-900/10">
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-black">{editingContactId ? (lang === 'en' ? 'Edit Client' : 'تعديل العميل') : t.addClient}</h2>
                 <button onClick={() => { setShowAddContact(false); setEditingContactId(null); setNewContactData({ name: '', phone: '', email: '', address: '' }); }} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5">
                   <X size={20} />
                 </button>
               </div>

               <div className="space-y-6">
                 <div>
                   <Label>{t.clientName}</Label>
                   <Input 
                     value={newContactData.name}
                     onChange={e => setNewContactData(prev => ({ ...prev, name: e.target.value }))}
                     placeholder={lang === 'en' ? 'Full Name' : 'الاسم الكامل'}
                     className="h-12 bg-slate-50 dark:bg-white/5 border-none font-bold"
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <Label>{t.phone}</Label>
                     <Input 
                       value={newContactData.phone}
                       onChange={e => setNewContactData(prev => ({ ...prev, phone: e.target.value }))}
                       placeholder="05..."
                       className="h-12 bg-slate-50 dark:bg-white/5 border-none font-bold"
                     />
                   </div>
                   <div>
                     <Label>{t.email}</Label>
                     <Input 
                       value={newContactData.email}
                       onChange={e => setNewContactData(prev => ({ ...prev, email: e.target.value }))}
                       placeholder="example@..."
                       className="h-12 bg-slate-50 dark:bg-white/5 border-none font-bold"
                     />
                   </div>
                 </div>
                 <div>
                   <h2 className="text-sm font-bold text-[#666666] mb-3">{t.address}</h2>
                   <textarea 
                     value={newContactData.address}
                     onChange={e => setNewContactData(prev => ({ ...prev, address: e.target.value }))}
                     className="w-full min-h-[100px] p-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold transition-all"
                     placeholder={lang === 'en' ? 'Business address...' : 'عنوان العمل...'}
                   />
                 </div>
                 
                 <Button 
                   onClick={() => {
                     handleSaveContact(newContactData);
                     setShowAddContact(false);
                     setNewContactData({ name: '', phone: '', email: '', address: '' });
                   }}
                   className="w-full py-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black"
                 >
                   {editingContactId ? (lang === 'en' ? 'Update Client' : 'تحديث العميل') : t.saveClient}
                 </Button>
               </div>
            </motion.div>
          </div>
        )}

        {showAddPayment && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddPayment(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg rounded-[32px] bg-white dark:bg-[#0F172A] p-8 shadow-2xl border border-blue-100 dark:border-blue-900/10">
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-black">{lang === 'en' ? 'Record Payment' : 'تسجيل دفعة'}</h2>
                 <Button variant="ghost" size="icon" onClick={() => setShowAddPayment(false)} className="rounded-full">
                   <X size={20} />
                 </Button>
               </div>

               <div className="space-y-6">
                 <div>
                   <Label>{lang === 'en' ? 'Select Client' : 'اختر العميل'}</Label>
                   <select 
                     className="w-full h-12 bg-slate-50 dark:bg-white/5 border-none rounded-xl px-4 outline-none font-bold"
                     value={newPaymentData.contactId}
                     onChange={e => setNewPaymentData(prev => ({ ...prev, contactId: e.target.value }))}
                   >
                     <option value="">{lang === 'en' ? 'Select...' : 'اختر...'}</option>
                     {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <Label>{lang === 'en' ? 'Amount' : 'المبلغ'}</Label>
                     <Input 
                       type="number"
                       value={newPaymentData.amount}
                       onChange={e => setNewPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                       className="h-12 bg-slate-50 dark:bg-white/5 border-none font-bold"
                     />
                   </div>
                   <div>
                     <Label>{lang === 'en' ? 'Method' : 'الطريقة'}</Label>
                     <select 
                        className="w-full h-12 bg-slate-50 dark:bg-white/5 border-none rounded-xl px-4 outline-none font-bold text-xs"
                        value={newPaymentData.method}
                        onChange={e => setNewPaymentData(prev => ({ ...prev, method: e.target.value as any }))}
                     >
                       <option value="cash">Cash</option>
                       <option value="bank">Bank Transfer</option>
                       <option value="card">Card</option>
                     </select>
                   </div>
                 </div>
                 
                 <Button 
                   onClick={() => {
                     handleAddPayment(newPaymentData);
                     setShowAddPayment(false);
                     setNewPaymentData({ contactId: '', amount: 0, method: 'cash' });
                   }}
                   className="w-full py-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black"
                 >
                   {lang === 'en' ? 'Confirm Payment' : 'تأكيد الدفع'}
                 </Button>
               </div>
            </motion.div>
          </div>
        )}

        {showAddExpense && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddExpense(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg rounded-[32px] bg-white dark:bg-[#0F172A] p-8 shadow-2xl border border-blue-100 dark:border-blue-900/10">
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-black">{lang === 'en' ? 'Add Expense' : 'إضافة مصروف'}</h2>
                 <Button variant="ghost" size="icon" onClick={() => setShowAddExpense(false)} className="rounded-full">
                   <X size={20} />
                 </Button>
               </div>

               <div className="space-y-6">
                 <div>
                   <Label>{lang === 'en' ? 'Description' : 'الوصف'}</Label>
                   <Input 
                     value={newExpenseData.description}
                     onChange={e => setNewExpenseData(prev => ({ ...prev, description: e.target.value }))}
                     className="h-12 bg-slate-50 dark:bg-white/5 border-none font-bold"
                     placeholder={lang === 'en' ? 'Rent, Marketing, etc.' : 'إيجار، تسويق، إلخ.'}
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <Label>{lang === 'en' ? 'Amount' : 'المبلغ'}</Label>
                     <Input 
                       type="number"
                       value={newExpenseData.amount}
                       onChange={e => setNewExpenseData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                       className="h-12 bg-slate-50 dark:bg-white/5 border-none font-bold"
                     />
                   </div>
                   <div>
                     <Label>{lang === 'en' ? 'Category' : 'الفئة'}</Label>
                     <select 
                        className="w-full h-12 bg-slate-50 dark:bg-white/5 border-none rounded-xl px-4 outline-none font-bold"
                        value={newExpenseData.category}
                        onChange={e => setNewExpenseData(prev => ({ ...prev, category: e.target.value }))}
                     >
                       <option value="Rent">Rent</option>
                       <option value="Materials">Materials</option>
                       <option value="Shipping">Shipping</option>
                       <option value="Marketing">Marketing</option>
                       <option value="Other">Other</option>
                     </select>
                   </div>
                 </div>
                 
                 <Button 
                   onClick={() => {
                     handleAddExpense(newExpenseData);
                     setShowAddExpense(false);
                     setNewExpenseData({ category: 'Rent', amount: 0, description: '' });
                   }}
                   className="w-full py-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black"
                 >
                   {lang === 'en' ? 'Save Expense' : 'حفظ المصروف'}
                 </Button>
               </div>
            </motion.div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
              onClick={() => setDeleteConfirm(null)} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl space-y-6 border border-slate-100 dark:border-white/5"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-50/50 dark:ring-red-500/5">
                  <Trash2 size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-2">{lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}</h3>
                  <p className="text-[#666666] dark:text-[#94A3B8] font-medium px-4">
                    {lang === 'ar' ? 'هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this record? This action cannot be undone.'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  variant="danger" 
                  onClick={() => {
                    if (deleteConfirm.type === 'payment') {
                      handleDeletePayment(deleteConfirm.id);
                    } else {
                      handleDeleteExpense(deleteConfirm.id);
                    }
                    setDeleteConfirm(null);
                  }} 
                  className="w-full py-4 text-lg bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-500/30"
                >
                  {lang === 'ar' ? 'حذف السجل' : 'Delete Record'}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setDeleteConfirm(null)} 
                  className="w-full py-4 text-slate-400 font-bold"
                >
                  {lang === 'ar' ? 'تراجع' : 'Cancel'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
}

export default function App() {
  const [lang, setLang] = useState<'en' | 'ar'>(() => {
    const saved = localStorage.getItem('gn_invoice_lang');
    return (saved as 'en' | 'ar') || 'en';
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('gn_invoice_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('gn_invoice_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    localStorage.setItem('gn_invoice_theme', theme);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage lang={lang} setLang={setLang} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />} />
        <Route path="/login" element={<LoginPage lang={lang} isDarkMode={isDarkMode} />} />
        <Route path="/invoice" element={<InvoicePage lang={lang} setLang={setLang} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />} />
      </Routes>
    </BrowserRouter>
  );
}
