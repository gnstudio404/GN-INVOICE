import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  LogIn, 
  ArrowLeft,
  ShieldCheck,
  Zap,
  History,
  Cloud,
  Mail,
  Lock,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, googleProvider } from '../lib/firebase';
import { 
  signInWithPopup, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { cn } from '../lib/utils';

interface LoginPageProps {
  lang: 'en' | 'ar';
  isDarkMode: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ lang, isDarkMode }) => {
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = {
    en: {
      title: "Welcome Back",
      signupTitle: "Create Your Account",
      subtitle: "Login to sync your invoices across all your devices securely.",
      signupSubtitle: "Join GN Invoice to manage your professional invoices anywhere.",
      loginBtn: "Continue with Google",
      backBtn: "Back",
      feature1: "Automatic Cloud Sync",
      feature2: "Invoice History",
      feature3: "Secure Data Protection",
      footer: "Professional invoicing for the modern digital era.",
      email: "Email Address",
      password: "Password",
      signIn: "Sign In",
      signUp: "Sign Up",
      or: "OR CONTINUING WITH",
      haveAccount: "Already have an account?",
      noAccount: "Don't have an account?",
      emailPlaceholder: "your@email.com",
      passwordPlaceholder: "••••••••",
      error: "Error",
      success: "Success",
      loginAction: "Logging in...",
      signupAction: "Creating account..."
    },
    ar: {
      title: "مرحباً بك مجدداً",
      signupTitle: "أنشئ حسابك الجديد",
      subtitle: "سجل دخولك لمزامنة فواتيرك عبر جميع أجهزتك بأمان.",
      signupSubtitle: "انضم إلى GN Invoice لإدارة فواتيرك الاحترافية في أي مكان.",
      loginBtn: "المتابعة باستخدام جوجل",
      backBtn: "عودة",
      feature1: "مزامنة سحابية تلقائية",
      feature2: "سجل كامل للفواتير",
      feature3: "حماية بيانات آمنة",
      footer: "فوترة احترافية للعصر الرقمي الحديث.",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      signIn: "تسجيل الدخول",
      signUp: "إنشاء حساب",
      or: "أو المتابعة من خلال",
      haveAccount: "لديك حساب بالفعل؟",
      noAccount: "ليس لديك حساب؟",
      emailPlaceholder: "your@email.com",
      passwordPlaceholder: "••••••••",
      error: "خطأ",
      success: "نجاح",
      loginAction: "جاري الدخول...",
      signupAction: "جاري إنشاء الحساب..."
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

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setErrorMessage(error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FDFDFD] dark:bg-[#060B16] transition-colors duration-300">
      {/* Sidebar Content (Desktop) */}
      <div className="hidden md:flex md:w-1/2 bg-[#1A1A1A] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        
        <Link 
          to="/" 
          className="flex items-center gap-3 text-white group"
        >
          <div className="h-10 w-10 flex items-center justify-center bg-white rounded-xl text-[#1A1A1A]">
            <FileText size={24} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black tracking-widest uppercase group-hover:tracking-[0.2em] transition-all duration-300">
            GN Invoice
          </span>
        </Link>

        <div>
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-8">
            {isSignup ? t.signupTitle : t.title}
          </h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-white/70">
              <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/10 border border-white/20">
                <Cloud size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-white uppercase tracking-wider">{t.feature1}</p>
                <p className="text-xs text-white/50">{lang === 'en' ? 'Access your data everywhere' : 'الوصول لبياناتك من اي مكان'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white/70">
              <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/10 border border-white/20">
                <History size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-white uppercase tracking-wider">{t.feature2}</p>
                <p className="text-xs text-white/50">{lang === 'en' ? 'Track all your previous work' : 'تتبع جميع اعمالك السابقة'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white/70">
              <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/10 border border-white/20">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-white uppercase tracking-wider">{t.feature3}</p>
                <p className="text-xs text-white/50">{lang === 'en' ? 'Military-grade encryption' : 'تشفير بمستوى عالٍ من الامان'}</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">
          {t.footer}
        </p>
      </div>

      {/* Main Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <Link 
          to="/" 
          className="md:hidden self-start mb-8 flex items-center gap-2 text-sm font-bold text-[#666666] hover:text-[#1A1A1A] dark:text-[#94A3B8] transition-colors"
        >
          <ArrowLeft size={18} className={cn(lang === 'ar' && "rotate-180")} />
          {t.backBtn}
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-black tracking-tight text-[#1A1A1A] dark:text-[#E2E8F0] mb-3">
              {isSignup ? t.signUp : t.signIn}
            </h1>
            <p className="text-[#666666] dark:text-[#94A3B8] opacity-80 text-sm">
              {isSignup ? t.signupSubtitle : t.subtitle}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[#1A1A1A] dark:text-[#E2E8F0]">
                {t.email}
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999] group-focus-within:text-[#1A1A1A] dark:group-focus-within:text-[#E2E8F0] transition-colors" />
                <input 
                  type="email"
                  required
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-white dark:bg-[#0F172A] border-2 border-[#1A1A1A]/10 dark:border-white/10 rounded-2xl focus:border-[#1A1A1A] dark:focus:border-[#E2E8F0] outline-none transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[#1A1A1A] dark:text-[#E2E8F0]">
                {t.password}
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999] group-focus-within:text-[#1A1A1A] dark:group-focus-within:text-[#E2E8F0] transition-colors" />
                <input 
                  type="password"
                  required
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-white dark:bg-[#0F172A] border-2 border-[#1A1A1A]/10 dark:border-white/10 rounded-2xl focus:border-[#1A1A1A] dark:focus:border-[#E2E8F0] outline-none transition-all font-bold"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold"
                >
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-14 bg-[#1A1A1A] dark:bg-[#E2E8F0] text-white dark:text-[#060B16] rounded-2xl font-black uppercase tracking-[0.1em] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center shadow-lg shadow-black/10"
            >
              {isLoggingIn ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                isSignup ? t.signUp : t.signIn
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1A1A1A]/10 dark:border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em] bg-[#FDFDFD] dark:bg-[#060B16] px-4 text-[#999999]">
              {t.or}
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full h-14 flex items-center justify-center gap-3 bg-white dark:bg-white/5 text-[#1A1A1A] dark:text-white border-2 border-[#1A1A1A] dark:border-white/20 rounded-2xl font-black uppercase tracking-wide hover:bg-[#F5F5F5] dark:hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            {t.loginBtn}
          </button>

          <p className="mt-8 text-center text-sm font-bold text-[#666666] dark:text-[#94A3B8]">
            {isSignup ? t.haveAccount : t.noAccount}{' '}
            <button 
              onClick={() => setIsSignup(!isSignup)}
              className="text-[#1A1A1A] dark:text-[#E2E8F0] hover:underline cursor-pointer"
            >
              {isSignup ? t.signIn : t.signUp}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
