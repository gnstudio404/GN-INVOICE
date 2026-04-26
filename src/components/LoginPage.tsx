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
  signInWithRedirect,
  getRedirectResult,
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
  const [authLoading, setAuthLoading] = useState(true);
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
      signupAction: "Creating account...",
      redirecting: "Redirecting to Google...",
      completingLogin: "Completing secure sign-in..."
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
      signupAction: "جاري إنشاء الحساب...",
      redirecting: "جاري التحويل إلى جوجل...",
      completingLogin: "جاري إتمام تسجيل الدخول الآمن..."
    }
  }[lang];

  useEffect(() => {
    // 1. Handle redirect result
    const checkRedirect = async () => {
      try {
        console.log("[LoginPage] Checking redirect result...");
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("[LoginPage] Successful redirect login for:", result.user.email);
          navigate('/invoice', { replace: true });
          return;
        }
        console.log("[LoginPage] No redirect result found.");
      } catch (error: any) {
        console.error("[LoginPage] Redirect auth error:", error);
        setErrorMessage(error.message);
        setAuthLoading(false);
      }
    };
    
    checkRedirect();

    // 2. Handle standard auth state
    const unsub = onAuthStateChanged(auth, (user) => {
      console.log("[LoginPage] Auth state change:", user ? "Logged In" : "Logged Out");
      if (user) {
        navigate('/invoice', { replace: true });
      } else {
        // Only stop loading if we haven't found a user
        // We wait a bit to ensure redirect result had a chance if it's there
        setAuthLoading(false);
      }
    });

    return () => unsub();
  }, [navigate]);

  if (authLoading || isLoggingIn) {
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
            {isLoggingIn ? t.redirecting : t.completingLogin}
          </p>
        </div>
      </div>
    );
  }

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      // Try popup first as requested by user
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login error:", error);
      
      // If popup is blocked, fallback to redirect
      if (error.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr: any) {
          setIsLoggingIn(false);
          setErrorMessage(redirectErr.message);
        }
      } else if (error.code === 'auth/popup-closed-by-user') {
        setIsLoggingIn(false);
      } else {
        setIsLoggingIn(false);
        setErrorMessage(error.message);
      }
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
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#0B1220] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[120px]" />
        
        <Link 
          to="/" 
          className="flex items-center gap-3 text-white group"
        >
          <div className="h-12 w-12 flex items-center justify-center bg-white rounded-2xl text-[#1A1A1A] shadow-xl shadow-white/10 group-hover:scale-110 transition-transform">
            <FileText size={28} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-black tracking-widest uppercase group-hover:tracking-[0.25em] transition-all duration-300">
            GN Invoice
          </span>
        </Link>

        <div>
          <h2 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-10">
            {isSignup ? t.signupTitle : t.title}
          </h2>
          <div className="space-y-8">
            <div className="flex items-center gap-5 text-white/70">
              <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Cloud size={28} />
              </div>
              <div>
                <p className="text-base font-black text-white uppercase tracking-wider">{t.feature1}</p>
                <p className="text-sm text-white/50">{lang === 'en' ? 'Access your data everywhere' : 'الوصول لبياناتك من اي مكان'}</p>
              </div>
            </div>
            <div className="flex items-center gap-5 text-white/70">
              <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <History size={28} />
              </div>
              <div>
                <p className="text-base font-black text-white uppercase tracking-wider">{t.feature2}</p>
                <p className="text-sm text-white/50">{lang === 'en' ? 'Track all your previous work' : 'تتبع جميع اعمالك السابقة'}</p>
              </div>
            </div>
            <div className="flex items-center gap-5 text-white/70">
              <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ShieldCheck size={28} />
              </div>
              <div>
                <p className="text-base font-black text-white uppercase tracking-wider">{t.feature3}</p>
                <p className="text-sm text-white/50">{lang === 'en' ? 'Military-grade encryption' : 'تشفير بمستوى عالٍ من الامان'}</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-white/20 text-[11px] font-bold uppercase tracking-[0.4em]">
          {t.footer}
        </p>
      </div>

      {/* Main Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
        {/* Background decorative blobs for the form side */}
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-400/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-indigo-400/5 rounded-full blur-[100px] pointer-events-none" />

        <Link 
          to="/" 
          className="md:hidden self-start mb-8 flex items-center gap-2 text-sm font-bold text-[#666666] hover:text-[#1A1A1A] dark:text-[#94A3B8] transition-colors"
        >
          <ArrowLeft size={18} className={cn(lang === 'ar' && "rotate-180")} />
          {t.backBtn}
        </Link>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-sm relative z-10"
        >
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-black tracking-tight text-[#1A1A1A] dark:text-[#E2E8F0] mb-3">
              {isSignup ? t.signUp : t.signIn}
            </h1>
            <p className="text-[#666666] dark:text-[#94A3B8] opacity-80 text-sm font-medium">
              {isSignup ? t.signupSubtitle : t.subtitle}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1A]/50 dark:text-[#E2E8F0]/50 ml-1">
                {t.email}
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999] group-focus-within:text-blue-500 transition-all duration-300" />
                <input 
                  type="email"
                  required
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-white dark:bg-[#0F172A] border-2 border-[#1A1A1A]/5 dark:border-white/5 rounded-2xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold placeholder:font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1A]/50 dark:text-[#E2E8F0]/50 ml-1">
                {t.password}
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999] group-focus-within:text-indigo-500 transition-all duration-300" />
                <input 
                  type="password"
                  required
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-white dark:bg-[#0F172A] border-2 border-[#1A1A1A]/5 dark:border-white/5 rounded-2xl focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold placeholder:font-medium"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs font-bold border border-red-100 dark:border-red-900/20"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-lg shadow-indigo-500/10"
            >
              {isLoggingIn ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                isSignup ? t.signUp : t.signIn
              )}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1A1A1A]/10 dark:border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em] bg-[#FDFDFD] dark:bg-[#060B16] px-6 text-[#999999]">
              {t.or}
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full h-14 flex items-center justify-center gap-3 bg-white dark:bg-white/5 text-[#1A1A1A] dark:text-white border-2 border-[#1A1A1A]/10 dark:border-white/10 rounded-2xl font-bold uppercase tracking-wider text-xs hover:border-[#1A1A1A] dark:hover:border-white/30 hover:bg-[#F9F9F9] dark:hover:bg-white/10 transition-all disabled:opacity-50 cursor-pointer group shadow-sm"
          >
            <div className="w-6 h-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            {t.loginBtn}
          </button>

          <p className="mt-10 text-center text-sm font-bold text-[#666666] dark:text-[#94A3B8]">
            {isSignup ? t.haveAccount : t.noAccount}{' '}
            <button 
              onClick={() => setIsSignup(!isSignup)}
              className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer transition-colors"
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
