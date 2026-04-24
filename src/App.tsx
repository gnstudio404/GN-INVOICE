/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { db, auth, googleProvider } from './lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
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
  orderBy, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  Plus, 
  Trash2, 
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
  History,
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
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
    allRightsReserved: "All rights reserved. Professional invoicing for the modern digital era.",
    currencySymbol: "$",
    login: "Login with Google",
    logout: "Logout",
    saveError: "Failed to save invoice.",
    deleteSuccess: "Invoice deleted.",
    deleteError: "Failed to delete invoice.",
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
    allRightsReserved: "جميع الحقوق محفوظة. فوترة احترافية للعصر الرقمي الحديث.",
    currencySymbol: "$",
    login: "تسجيل الدخول باستخدام جوجل",
    logout: "تسجيل الخروج",
    saveError: "فشل حفظ الفاتورة.",
    deleteSuccess: "تم حذف الفاتورة.",
    deleteError: "فشل حذف الفاتورة.",
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
  invoiceTitle: string;
  serviceProvider: string;
  clientName: string;
  activityIndex: number;
  customActivity: string;
  logo: string | null;
  phoneNumber: string;
  items: InvoiceItem[];
  savedAt?: string;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSavingToFirestore, setIsSavingToFirestore] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveNameInput, setSaveNameInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
    items: [{ id: generateId(), description: '', price: 0 }]
  });

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

  // Firebase Auth and Firestore listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      const history = localStorage.getItem('gn_invoice_history');
      if (history) {
        try {
          setSavedInvoices(JSON.parse(history));
        } catch (e) {
          console.error("Failed to parse history", e);
        }
      } else {
        setSavedInvoices([]);
      }
      return;
    }

    const q = query(
      collection(db, "invoices"),
      where("userId", "==", user.uid),
      orderBy("savedAt", "desc")
    );

    const unsubFirestore = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as InvoiceData[];
      setSavedInvoices(docs);
    });

    return () => unsubFirestore();
  }, [user]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/popup-blocked') {
        alert(lang === 'ar' ? 'تم حظر المنبثقة! يرجى السماح بالمنبثقات لهذا الموقع.' : 'Popup blocked! Please allow popups for this site.');
      } else if (error.code === 'auth/unauthorized-domain') {
        alert(lang === 'ar' ? 'هذا النطاق غير مصرح به في Firebase Console.' : 'This domain is not authorized in Firebase Console.');
      } else {
        alert(lang === 'ar' ? 'فشل تسجيل الدخول: ' + error.message : 'Login failed: ' + error.message);
      }
    } finally {
      setIsLoggingIn(false);
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
      setInvoiceData(prev => ({ ...prev, [field]: value }));
    }
    
    setActiveSuggestionField(field);
    setFilteredSuggestions(getRecentSuggestions(field, value));
  };

  const selectSuggestion = (value: string) => {
    if (activeSuggestionField === 'description' && activeItemIndex !== null) {
      handleItemChange(invoiceData.items[activeItemIndex].id, 'description', value);
    } else if (activeSuggestionField) {
      setInvoiceData(prev => ({ ...prev, [activeSuggestionField]: value }));
    }
    setActiveSuggestionField(null);
    setFilteredSuggestions([]);
  };

  const openSaveModal = () => {
    const defaultTitle = invoiceData.invoiceTitle || (lang === 'ar' ? translations.ar.invoiceTitleDefault : translations.en.invoiceTitleDefault);
    setSaveNameInput(defaultTitle);
    setShowSaveModal(true);
  };

  const handleSaveToHistory = async () => {
    const finalTitle = saveNameInput.trim() || (lang === 'ar' ? translations.ar.invoiceTitleDefault : translations.en.invoiceTitleDefault);
    const currentId = invoiceData.id || generateId();

    const invoiceToSave = {
      ...invoiceData,
      id: currentId,
      invoiceTitle: finalTitle,
      savedAt: new Date().toISOString()
    };

    setInvoiceData(invoiceToSave);
    setShowSaveModal(false);

    if (!user) {
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
      // Show mini toast or simple state-based alert instead of blocking window.alert
      return;
    }

    setIsSavingToFirestore(true);
    try {
      const { id, ...dataToSave } = invoiceToSave;
      const cleanedData = {
        ...dataToSave,
        userId: user.uid,
        updatedAt: serverTimestamp()
      };
      
      const isFirestoreId = invoiceData.id && !invoiceData.id.includes('-');

      if (isFirestoreId) {
        const docRef = doc(db, "invoices", invoiceData.id!);
        await updateDoc(docRef, cleanedData);
      } else {
        const docRef = await addDoc(collection(db, "invoices"), cleanedData);
        setInvoiceData(prev => ({ ...prev, id: docRef.id }));
      }
    } catch (error) {
      console.error("Firestore save error:", error);
    } finally {
      setIsSavingToFirestore(false);
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

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('gn_invoice_history', JSON.stringify(savedInvoices));
  }, [savedInvoices]);

  const total = invoiceData.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

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
    setIsPreviewMode(false);
    setShowHistory(false);
  };

  const activityDisplay = invoiceData.activityIndex === t.activities.length - 1 
    ? invoiceData.customActivity 
    : t.activities[invoiceData.activityIndex];

  return (
    <div 
      className={cn(
        "min-h-screen bg-[#FDFDFD] dark:bg-[#060B16] text-[#1A1A1A] dark:text-[#E2E8F0] transition-colors duration-300 selection:bg-[#1A1A1A] selection:text-white", 
        lang === 'ar' ? 'font-arabic' : 'font-sans'
      )} 
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <header className="no-print sticky top-0 z-50 w-full border-b border-[#F0F0F0] dark:border-white/5 bg-white/80 dark:bg-[#060B16]/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A1A1A] dark:bg-[#E2E8F0] text-white dark:text-[#060B16] shadow-lg shadow-[#1A1A1A]/10">
              <FileText size={24} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#E2E8F0]">{t.title}</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 border-r border-[#F0F0F0] dark:border-white/5 pr-2 sm:pr-4 mr-2 sm:mr-4">
              <Button variant="ghost" size="icon" onClick={() => setShowHistory(true)} className="h-12 w-12 rounded-full">
                <History size={26} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)} className="h-12 w-12 rounded-full">
                {isDarkMode ? <Sun size={26} /> : <Moon size={26} />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="h-12 w-12 rounded-full">
                <Languages size={26} />
              </Button>
            </div>

            {isPreviewMode ? (
              <Button variant="ghost" onClick={() => setIsPreviewMode(false)} className="hidden sm:flex gap-2">
                <ArrowLeft size={20} className={lang === 'ar' ? 'rotate-180' : ''} /> {t.editForm}
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => {
                if(confirm(t.resetConfirm)) {
                  setInvoiceData({
                    invoiceTitle: t.invoiceTitleDefault,
                    serviceProvider: '',
                    clientName: '',
                    activityIndex: 0,
                    customActivity: '',
                    logo: null,
                    phoneNumber: '',
                    items: [{ id: generateId(), description: '', price: 0 }]
                  });
                }
              }} className="hidden sm:flex gap-2 text-[#999999]">
                {t.reset}
              </Button>
            )}
            <Button variant="outline" className="hidden sm:flex">{t.support}</Button>
            
            {user ? (
              <div className="flex items-center gap-3 ml-2 border-l border-[#F0F0F0] dark:border-white/5 pl-4">
                <div className="hidden md:block text-right">
                  <p className="text-xs font-bold text-[#1A1A1A] dark:text-[#E2E8F0] leading-none mb-1">{user.displayName}</p>
                  <p className="text-[10px] text-[#666666] dark:text-[#94A3B8] leading-none">{user.email}</p>
                </div>
                {user.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt="User Profile" 
                    className="h-9 w-9 rounded-full border border-[#1A1A1A] dark:border-white/20"
                    referrerPolicy="no-referrer"
                  />
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs font-bold">
                  {t.logout}
                </Button>
              </div>
            ) : (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => navigate('/login')} 
                className="ml-2 gap-2"
              >
                <Plus size={16} />
                {t.login}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:px-8 lg:py-20">
        <AnimatePresence mode="wait">
          {!isPreviewMode ? (
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
                      <Label>{t.invoiceTitle}</Label>
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
                      <Input 
                        placeholder={t.clientNamePlaceholder}
                        value={invoiceData.clientName}
                        onChange={(e) => handleFieldChangeWithSuggestions('clientName', e.target.value)}
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
                          onChange={(e) => setInvoiceData(prev => ({ ...prev, activityIndex: parseInt(e.target.value) }))}
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
                    <Button 
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="w-full py-7 text-base font-bold tracking-wide uppercase"
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
                    </div>
                  </div>

                  {/* Contact Bottom */}
                  {invoiceData.phoneNumber && (
                    <div className="mt-24 flex flex-col items-center justify-center gap-3 border-t-2 border-[#F0F0F0] dark:border-white/5 pt-16">
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-[#666666] dark:text-[#94A3B8]">
                          {lang === 'ar' ? 'للتواصل:' : 'Contact:'}
                        </span>
                        <span className="text-3xl font-black text-[#1A1A1A] dark:text-[#E2E8F0] tracking-tighter">
                          {invoiceData.phoneNumber}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-24 rounded-2xl bg-[#F9F9F9] dark:bg-[#060B16] p-8 text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="rounded-full bg-white dark:bg-[#0F172A] p-2 shadow-sm">
                        <CheckCircle2 className="text-[#1A1A1A] dark:text-[#E2E8F0]" size={24} />
                      </div>
                    </div>
                    <p className={cn("text-sm font-bold text-[#1A1A1A] dark:text-[#E2E8F0] mb-1 uppercase", lang === 'en' && "tracking-widest")}>{t.thankYou}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="no-print mt-12 flex items-center justify-center gap-2 text-sm text-[#999999]">
                <Briefcase size={18} />
                <span>{t.poweredBy}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-[#F0F0F0] dark:border-white/5 py-12">
        <div className="container mx-auto px-4 text-center md:px-8">
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
                            {inv.serviceProvider || (inv.activityIndex === t.activities.length - 1 ? inv.customActivity : t.activities[inv.activityIndex])}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleLoadInvoice(inv)}>
                            {t.edit}
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
                <Button onClick={handleSaveToHistory} className="flex-1 py-4" disabled={isSavingToFirestore}>
                  {isSavingToFirestore ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1A1A1A] border-t-transparent" /> : (lang === 'ar' ? 'تاكيد الحفظ' : 'Confirm Save')}
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
