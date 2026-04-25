import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Moon, 
  Sun, 
  ArrowRight, 
  FileText, 
  Zap, 
  ShieldCheck, 
  Share2,
  Languages
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface LandingPageProps {
  lang: 'en' | 'ar';
  setLang: (l: 'en' | 'ar') => void;
  isDarkMode: boolean;
  setIsDarkMode: (d: boolean) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ lang, setLang, isDarkMode, setIsDarkMode }) => {
  const t = {
    en: {
      navStart: "Start",
      heroTitle: "Create Professional",
      heroTitleGradient: "Invoices in Seconds",
      heroDesc: "Turn your freelance or online business into a professional brand with clean, elegant invoices. No complex software, just simple invoicing.",
      ctaPrimary: "Start Creating Invoice",
      ctaSecondary: "View Sample",
      feature1Title: "Fast & Easy",
      feature1Desc: "Generate invoices in under a minute with our intuitive interface.",
      feature2Title: "Professional Design",
      feature2Desc: "Impress your clients with high-end, modern invoice templates.",
      feature3Title: "Secure & Private",
      feature3Desc: "Your data stays in your browser. We don't store your invoices.",
      feature4Title: "Easy Sharing",
      feature4Desc: "Download as PDF or PNG and share with your clients instantly.",
      footerDesc: "The premium invoicing solution for modern freelancers and digital businesses.",
      rights: "All rights reserved.",
      login: "Login"
    },
    ar: {
      navStart: "ابدأ الآن",
      heroTitle: "أنشئ فواتير",
      heroTitleGradient: "احترافية في ثوانٍ",
      heroDesc: "حول عملك الحر أو نشاطك التجاري عبر الإنترنت إلى علامة تجارية احترافية بفواتير نظيفة وأنيقة. لا برامج معقدة، فقط فوترة بسيطة.",
      ctaPrimary: "ابدأ بإنشاء فاتورة",
      ctaSecondary: "عرض نموذج",
      feature1Title: "سريع وسهل",
      feature1Desc: "أنشئ فواتير في أقل من دقيقة من خلال واجهتنا البديهية.",
      feature2Title: "تصميم احترافي",
      feature2Desc: "أبهر عملائك بنماذج فواتير عصرية وعالية الجودة.",
      feature3Title: "آمن وخاص",
      feature3Desc: "بياناتك تبقى في متصفحك. نحن لا نخزن فواتيرك.",
      feature4Title: "سهولة المشاركة",
      feature4Desc: "حملها كـ PDF أو PNG وشاركها مع عملائك على الفور.",
      footerDesc: "حل الفوترة المتميز للمستقلين والشركات الرقمية الحديثة.",
      rights: "جميع الحقوق محفوظة.",
      login: "تسجيل الدخول"
    }
  }[lang];

  return (
    <div className="min-h-screen transition-colors duration-300 bg-[#F8FAFC] dark:bg-[#060B16] text-[#0F172A] dark:text-[#E2E8F0] font-sans selection:bg-blue-500/30">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#0B1220] dark:text-[#E2E8F0]">
                GN Invoice
              </span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/login">
                <button className="hidden sm:inline-flex text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t.login}
                </button>
              </Link>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-400"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-400 flex items-center gap-2"
              >
                <Languages className="w-5 h-5" />
                <span className="text-xs font-bold uppercase hidden sm:inline">{lang === 'en' ? 'AR' : 'EN'}</span>
              </button>
              <Link to="/invoice">
                <button className="px-5 py-2 bg-[#0B1220] dark:bg-blue-600 text-white rounded-full font-medium hover:opacity-90 transition-opacity">
                  {t.navStart}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

        {/* Hero Section */}
        <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-[#0B1220] dark:text-[#E2E8F0] mb-6 leading-[1.1]">
                {t.heroTitle} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400">
                  {t.heroTitleGradient}
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-[#94A3B8] mb-10 max-w-2xl mx-auto leading-relaxed">
                {t.heroDesc}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/invoice">
                  <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-105 flex items-center justify-center gap-2">
                    {t.ctaPrimary}
                    <ArrowRight className={cn("w-5 h-5", lang === 'ar' && "rotate-180")} />
                  </button>
                </Link>
                <Link to="/login">
                  <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-white/5 border-2 border-[#1A1A1A] dark:border-white/20 text-[#1A1A1A] dark:text-white rounded-full font-bold text-lg hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                    <svg viewBox="0 0 24 24" className="w-6 h-6">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {lang === 'ar' ? 'سجل بجوجل' : 'Sign in with Google'}
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Visual Element: Invoice Mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-20 relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-2xl blur opacity-20"></div>
              <div className="relative bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden max-w-3xl mx-auto">
                {/* Mockup Header */}
                <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-start">
                  <div className={cn("text-left", lang === 'ar' && "text-right")}>
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <FileText className="text-white w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold dark:text-[#E2E8F0]">GN Invoice</h3>
                    <p className="text-sm text-slate-500 dark:text-[#94A3B8]">Professional Invoicing</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-300 dark:text-slate-700">Invoice</h2>
                    <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1">#INV-2026-001</p>
                  </div>
                </div>
                
                {/* Mockup Body */}
                <div className="p-8">
                  <div className="grid grid-cols-2 gap-8 mb-10">
                    <div className={cn("text-left", lang === 'ar' && "text-right")}>
                      <p className="text-xs font-bold uppercase text-slate-400 mb-2">Billed To</p>
                      <p className="font-semibold dark:text-[#E2E8F0]">Alex Thompson</p>
                      <p className="text-sm text-slate-500 dark:text-[#94A3B8]">alex@example.com</p>
                    </div>
                    <div className={cn("text-right", lang === 'ar' && "text-left")}>
                      <p className="text-xs font-bold uppercase text-slate-400 mb-2">Date Issued</p>
                      <p className="font-semibold dark:text-[#E2E8F0]">March 26, 2026</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-10">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                      <span className="text-sm font-medium dark:text-[#E2E8F0]">UI/UX Design Services</span>
                      <span className="font-semibold dark:text-[#E2E8F0]">$1,200.00</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                      <span className="text-sm font-medium dark:text-[#E2E8F0]">Frontend Development</span>
                      <span className="font-semibold dark:text-[#E2E8F0]">$2,400.00</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="w-48 p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-500 dark:text-[#94A3B8]">Subtotal</span>
                        <span className="text-sm font-medium dark:text-[#E2E8F0]">$3,600.00</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-white/10">
                        <span className="text-sm font-bold dark:text-[#E2E8F0]">Total</span>
                        <span className="text-lg font-bold text-blue-600">$3,600.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Minimal Features */}
        <section className="py-20 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#060B16]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-600/10 rounded-full flex items-center justify-center mb-4">
                  <Zap className="text-blue-600 w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold mb-2 dark:text-[#E2E8F0]">{t.feature1Title}</h4>
                <p className="text-slate-500 dark:text-[#94A3B8] text-sm">{t.feature1Desc}</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-600/10 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="text-cyan-600 w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold mb-2 dark:text-[#E2E8F0]">{t.feature2Title}</h4>
                <p className="text-slate-500 dark:text-[#94A3B8] text-sm">{t.feature2Desc}</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-600/10 rounded-full flex items-center justify-center mb-4">
                  <Share2 className="text-indigo-600 w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold mb-2 dark:text-[#E2E8F0]">{t.feature4Title}</h4>
                <p className="text-slate-500 dark:text-[#94A3B8] text-sm">{t.feature4Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-slate-200 dark:border-white/10 bg-[#F8FAFC] dark:bg-[#060B16]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <FileText className="text-white w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#0B1220] dark:text-[#E2E8F0]">
                GN Invoice
              </span>
            </div>
            <p className="text-slate-500 dark:text-[#94A3B8] text-sm">
              {t.footerDesc} <br />
              © 2026 GN Invoice. {t.rights}
            </p>
          </div>
        </footer>

    </div>
  );
};

export default LandingPage;
