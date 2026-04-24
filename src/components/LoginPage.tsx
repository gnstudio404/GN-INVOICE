import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  LogIn, 
  ArrowLeft,
  ShieldCheck,
  Zap,
  History,
  Cloud
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { cn } from '../lib/utils';

interface LoginPageProps {
  lang: 'en' | 'ar';
  isDarkMode: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ lang, isDarkMode }) => {
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const t = {
    en: {
      title: "Welcome Back",
      subtitle: "Login to sync your invoices across all your devices securely.",
      loginBtn: "Login with Google",
      backBtn: "Back to Home",
      feature1: "Automatic Cloud Sync",
      feature2: "Invoice History",
      feature3: "Secure Data Protection",
      footer: "Professional invoicing for the modern digital era."
    },
    ar: {
      title: "مرحباً بك مجدداً",
      subtitle: "سجل دخولك لمزامنة فواتيرك عبر جميع أجهزتك بأمان.",
      loginBtn: "تسجيل الدخول باستخدام جوجل",
      backBtn: "العودة للرئيسية",
      feature1: "مزامنة سحابية تلقائية",
      feature2: "سجل كامل للفواتير",
      feature3: "حماية بيانات آمنة",
      footer: "فوترة احترافية للعصر الرقمي الحديث."
    }
  }[lang];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/invoice');
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // Logic inside useEffect will handle navigation
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFD] dark:bg-[#060B16] px-4 py-12 transition-colors duration-300">
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-[#666666] hover:text-[#1A1A1A] dark:text-[#94A3B8] dark:hover:text-[#E2E8F0] transition-colors"
      >
        <ArrowLeft size={18} className={cn(lang === 'ar' && "rotate-180")} />
        {t.backBtn}
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1A1A1A] dark:bg-[#E2E8F0] text-white dark:text-[#060B16] shadow-xl">
            <FileText size={32} strokeWidth={2.5} />
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tight text-[#1A1A1A] dark:text-[#E2E8F0] mb-3">
            {t.title}
          </h1>
          <p className="text-[#666666] dark:text-[#94A3B8] opacity-80 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="rounded-3xl border-2 border-[#1A1A1A] bg-white dark:bg-[#0F172A] dark:border-white/10 p-8 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] dark:shadow-none">
          <div className="space-y-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <Cloud size={20} />
              </div>
              <span className="text-sm font-bold text-[#1A1A1A] dark:text-[#E2E8F0]">{t.feature1}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                <History size={20} />
              </div>
              <span className="text-sm font-bold text-[#1A1A1A] dark:text-[#E2E8F0]">{t.feature2}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                <ShieldCheck size={20} />
              </div>
              <span className="text-sm font-bold text-[#1A1A1A] dark:text-[#E2E8F0]">{t.feature3}</span>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white dark:bg-[#E2E8F0] text-[#1A1A1A] border-2 border-[#1A1A1A] dark:border-transparent rounded-xl font-black uppercase tracking-wide hover:bg-[#F5F5F5] transition-all shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] dark:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
          >
            {isLoggingIn ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1A1A1A] border-t-transparent" />
            ) : (
              <>
                <LogIn size={20} />
                {t.loginBtn}
              </>
            )}
          </button>
        </div>

        <p className="mt-12 text-center text-[10px] uppercase tracking-[0.2em] font-bold text-[#999999] dark:text-[#555555]">
          {t.footer}
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
