import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useProject } from '../../context/ProjectContext';
import { MultiStepForm, StepItem } from '../ui/multistep-form';
import { AuthEmailInput } from './AuthEmailInput';
import { AdaptivePrismBackground } from './AdaptivePrismBackground';
import { cn } from '../../lib/utils';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Check, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Orbit,
  User,
  Globe
} from 'lucide-react';
import StrandsLoader from '../loading/StrandsLoader';

export interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialMode?: 'auto' | 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen = true,
}) => {
  const { 
    login, 
    register, 
    loginWithGoogleData, 
  } = useProject();

  // Authentication page is permanently dark mode, with Persian/English localization toggle
  const [authLocale, setAuthLocale] = useState<'fa' | 'en'>('fa');

  const isRtl = authLocale !== 'en';
  const ArrowForward = isRtl ? ArrowLeft : ArrowRight;

  // Apply dark mode & locale to the document root only for the active auth screen
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');

    const dir = authLocale === 'fa' ? 'rtl' : 'ltr';
    root.setAttribute('dir', dir);
    root.setAttribute('lang', authLocale);
    document.body.style.direction = dir;
    document.body.style.textAlign = authLocale === 'fa' ? 'right' : 'left';
  }, [authLocale]);

  const toggleAuthLocale = () => {
    setAuthLocale((prev) => (prev === 'fa' ? 'en' : 'fa'));
  };

  // Flow State Machine
  // 'email_entry' -> 'login_password' OR 'register_stepper' | 'pending_success' | 'forgot_password'
  const [currentFlow, setCurrentFlow] = useState<'email_entry' | 'login_password' | 'register_stepper' | 'pending_success' | 'forgot_password'>('email_entry');
  const [regStep, setRegStep] = useState<number>(1);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration MultiStep Form Data
  const [formData, setFormData] = useState<Record<string, string>>({
    name: '',
    phone: '',
    password: '',
  });

  // Recovery States
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newRecoveryPassword, setNewRecoveryPassword] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'verify'>('request');

  // Existing User snippet for login screen
  const [existingUserSnippet, setExistingUserSnippet] = useState<{
    name?: string;
    avatar?: string;
    role?: string;
  } | null>(null);

  // Local Loading & Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'error' | 'success' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  // Listen to Google/GitHub OAuth popup messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { token, user } = event.data;
        if (token && user) {
          loginWithGoogleData(token, user);
        }
      }
      if (event.data?.type === 'OAUTH_AUTH_BLOCKED') {
        setFeedback({ 
          type: 'info', 
          message: event.data.message || (isRtl ? 'حساب کاربری شما در انتظار تایید مدیریت است.' : 'Your account is pending administrator approval.') 
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [loginWithGoogleData, isRtl]);

  const clearFeedback = () => setFeedback({ type: null, message: '' });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Step 0: Check Email / Username / Phone Existence (Dynamic Resolver)
  const handleResolvedEmailSubmit = async (resolvedInput: string) => {
    clearFeedback();

    const rawInput = resolvedInput.trim();
    if (!rawInput) {
      setFeedback({
        type: 'error',
        message: isRtl ? 'لطفاً نشانی ایمیل، نام کاربری یا شماره همراه را وارد نمایید.' : 'Please enter your email, username, or phone number.'
      });
      return;
    }

    setEmail(rawInput);
    const normalizedInput = rawInput.toLowerCase();
    const isEmail = rawInput.includes('@');
    const isPhone = /^0?9\d{9}$/.test(rawInput);
    const isUsername = /^@?[a-zA-Z0-9_]{3,30}$/.test(rawInput);

    // Prepopulate fields for registration stepper
    if (isUsername && !isEmail) {
      const cleanU = rawInput.replace(/^@/, '').toLowerCase();
      setFormData(prev => ({ ...prev, username: cleanU }));
    } else if (isPhone) {
      const cleanP = rawInput.replace(/\D/g, '').replace(/^0/, '');
      setFormData(prev => ({ ...prev, phone: cleanP }));
    } else if (isEmail) {
      const localPart = rawInput.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 30);
      setFormData(prev => ({ ...prev, username: prev.username || localPart }));
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/check-identifier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: normalizedInput,
          email: normalizedInput,
          username: normalizedInput.replace(/^@/, ''),
          phone: rawInput
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.exists && data.user) {
          setExistingUserSnippet(data.user);
          if (data.user.email) {
            setEmail(data.user.email);
          }
          setPassword('');
          setCurrentFlow('login_password');
        } else {
          setExistingUserSnippet(null);
          setPassword('');
          setRegStep(1);
          setCurrentFlow('register_stepper');
        }
      } else {
        // Fallback to login
        setCurrentFlow('login_password');
      }
    } catch {
      // Offline fallback: prompt password
      setCurrentFlow('login_password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    handleResolvedEmailSubmit(email);
  };

  // Flow 1: Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!password) {
      setFeedback({
        type: 'error',
        message: isRtl ? 'لطفاً رمز عبور را وارد کنید.' : 'Please enter your password.'
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email.trim(), password);
      if (!success) {
        setFeedback({
          type: 'error',
          message: isRtl ? 'شناسه کاربری، ایمیل یا کلمه عبور وارد شده نادرست است.' : 'Invalid email, username, or password.'
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: isRtl ? 'خطا در برقراری ارتباط با سرور.' : 'Failed to connect to authentication server.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Flow 2: Multi-step Registration Stepper Definition
  const registrationSteps: StepItem[] = [
    {
      id: 1,
      field: 'name',
      label: isRtl ? 'مشخصات و نام کاربری' : 'Profile & Username',
      title: isRtl ? 'مشخصات و نام کاربری' : 'Profile & Username',
      placeholder: isRtl ? 'نام و نام خانوادگی' : 'Full Name',
      description: isRtl ? 'شناسه یکتای اختصاصی جهت یافتن شما در فضاهای کاری' : 'Unique handle & name'
    },
    {
      id: 2,
      field: 'phone',
      label: isRtl ? 'شماره تلفن همراه' : 'Phone Number',
      title: isRtl ? 'شماره تلفن همراه' : 'Phone Number',
      placeholder: '9 - -   - - -   - - - -',
      description: isRtl ? 'شماره همراه را بدون صفر اول وارد کنید' : 'Enter without leading zero'
    },
    {
      id: 3,
      field: 'password',
      label: isRtl ? 'تعیین گذرواژه' : 'Create Password',
      title: isRtl ? 'تعیین گذرواژه' : 'Create Password',
      placeholder: '••••••••',
      description: isRtl ? 'حداقل ۸ کاراکتر امنیتی شامل حروف بزرگ، کوچک، عدد و نماد' : 'Must meet all security criteria'
    }
  ];

  const handleRegisterStepNext = async () => {
    clearFeedback();

    if (regStep === 1) {
      const nameVal = (formData.name || '').trim();
      const rawUser = (formData.username || '').replace(/^@/, '').trim();
      if (!nameVal || nameVal.length < 3) {
        setFeedback({
          type: 'error',
          message: isRtl ? 'نام و نام خانوادگی باید حداقل ۳ حرف باشد.' : 'Full name must be at least 3 characters.'
        });
        return;
      }
      if (!rawUser || !/^[a-zA-Z0-9_]{3,20}$/.test(rawUser)) {
        setFeedback({
          type: 'error',
          message: isRtl ? 'نام کاربری باید ۳ تا ۲۰ کاراکتر انگلیسی، اعداد یا _ باشد.' : 'Username must be 3-20 chars (a-z, 0-9, _).'
        });
        return;
      }
      setRegStep(2);
      return;
    }

    if (regStep === 2) {
      const cleanPhone = (formData.phone || '').replace(/\D/g, '').replace(/^0/, '').slice(0, 10);
      if (cleanPhone.length !== 10) {
        setFeedback({
          type: 'error',
          message: isRtl ? 'شماره تلفن همراه باید دقیقاً ۱۰ رقم (بدون صفر اول) باشد.' : 'Phone number must be exactly 10 digits without leading zero.'
        });
        return;
      }
      setRegStep(3);
      return;
    }

    if (regStep === 3) {
      const passVal = formData.password || '';
      const isLengthValid = passVal.length >= 8;
      const isCaseValid = /[a-z]/.test(passVal) && /[A-Z]/.test(passVal);
      const isNumberValid = /[0-9]/.test(passVal);
      const isSpecialValid = /[!@#$%^&*(),.?":{}|<>]/.test(passVal);

      if (!isLengthValid || !isCaseValid || !isNumberValid || !isSpecialValid) {
        setFeedback({
          type: 'error',
          message: isRtl ? 'لطفاً تمامی الزامات امنیتی گذرواژه را رعایت فرمایید.' : 'Please fulfill all password security rules.'
        });
        return;
      }

      setIsLoading(true);
      try {
        const cleanPhone = (formData.phone || '').replace(/\D/g, '').replace(/^0/, '').slice(0, 10);
        let userEmail = email.trim().toLowerCase();
        if (!userEmail.includes('@')) {
          userEmail = `${(formData.username || 'user').toLowerCase().replace(/[^a-z0-9_]/g, '')}@workspace.local`;
        }

        const result = await register(
          userEmail,
          passVal,
          (formData.name || '').trim(),
          cleanPhone,
          'OWNER',
          (formData.username || '').replace(/^@/, '').trim()
        );

        if (result && result.success) {
          setFeedback({
            type: 'success',
            message: isRtl ? 'فضای کاری شما با موفقیت ایجاد شد!' : 'Workspace created successfully!'
          });
        } else {
          setFeedback({
            type: 'error',
            message: isRtl ? 'ثبت نام انجام نشد. نشانی ایمیل یا نام کاربری ممکن است تکراری باشد.' : 'Registration failed. Email or username may already be registered.'
          });
        }
      } catch {
        setFeedback({
          type: 'error',
          message: isRtl ? 'خطای غیرمنتظره در ثبت‌نام.' : 'Unexpected error during registration.'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Google OAuth Trigger
  const handleGoogleAuth = async () => {
    clearFeedback();
    try {
      const redirectUri = encodeURIComponent(`${window.location.origin}/auth/google-callback`);
      const response = await fetch(`/api/auth/google/url?redirect_uri=${redirectUri}`);
      if (!response.ok) throw new Error('Failed to get Google OAuth URL');
      const { url } = await response.json();

      const width = 540;
      const height = 640;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        url,
        'google_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      );

      if (!popup) {
        setFeedback({
          type: 'error',
          message: isRtl ? 'لطفا باز شدن پاپ‌آپ را در مرورگر مجاز کنید.' : 'Please allow popups in your browser.'
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || (isRtl ? 'خطا در اتصال به گوگل.' : 'Failed to connect to Google OAuth.')
      });
    }
  };

  // GitHub OAuth Trigger
  const handleGithubAuth = async () => {
    clearFeedback();
    handleGoogleAuth();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen p-4 overflow-y-auto select-none text-neutral-100"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ fontFeatureSettings: '"ss01" 1' }}
    >
      {/* ========================================================
          ISOLATED FLOATING CONTROLS (Language Switcher Only - Permanently Top-Right)
         ======================================================== */}
      <div
        className="fixed top-5 right-5 z-50 flex items-center p-1 rounded-full border border-white/[0.12] bg-[#11131d]/70 backdrop-blur-xl transition-all shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
      >
        {/* Language switch */}
        <button
          type="button"
          onClick={toggleAuthLocale}
          className="h-8 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer text-white/85 hover:text-white hover:bg-white/10"
          title={isRtl ? 'تغییر زبان به انگلیسی' : 'Switch language to Persian'}
        >
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span>{authLocale === 'fa' ? 'فارسی' : 'EN'}</span>
        </button>
      </div>

      {/* ========================================================
          LAYER 0 & 1: ADAPTIVE PRISM 3D BACKGROUND
         ======================================================== */}
      <AdaptivePrismBackground />

      {/* ========================================================
          LAYER 2: LIQUID GLASS AUTHENTICATION CARD
         ======================================================== */}
      <div 
        className="relative z-10 w-full max-w-[460px] p-8 md:p-10 rounded-[36px] bg-white/[0.05] dark:bg-black/[0.25] border border-white/20 dark:border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_2px_rgba(0,0,0,0.5)] flex flex-col items-center text-center backdrop-blur-2xl md:backdrop-blur-3xl transition-all duration-300 my-auto text-neutral-100"
      >
        
        {/* Feedback Alert Pill */}
        <AnimatePresence>
          {feedback.message && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              className={`mb-6 p-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 border backdrop-blur-md shadow-sm ${
                feedback.type === 'error'
                  ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                  : feedback.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-blue-950/40 border-blue-500/30 text-blue-300'
              }`}
            >
              {feedback.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              ) : feedback.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <Clock className="w-4 h-4 shrink-0 text-blue-400" />
              )}
              <span>{feedback.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* ========================================================
              SCREEN 1: LIQUID GLASS AUTH VIEW (Email Entry & Social)
             ======================================================== */}
          {currentFlow === 'email_entry' && (
            <motion.div
              key="email_entry"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center w-full"
            >
              {/* 1. Top TS Squircle Brand Badge */}
              <div className="h-14 w-14 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-1 ring-white/25 border border-white/20">
                <span className="text-xl font-black tracking-wider text-white font-sans">TS</span>
              </div>

              {/* 2. Welcome Headline & Subtitle */}
              <h1 className="text-2xl md:text-3xl font-bold text-white/95 tracking-tight mb-2">
                {isRtl ? 'خوش آمدید به TS Orbit' : 'Welcome to TS Orbit'}
              </h1>

              <p className="text-xs md:text-sm text-white/60 font-medium mb-6">
                {isRtl ? 'برای ورود یا عضویت در سامانه، ایمیل خود را وارد کنید' : 'Sign in or create an account to get started'}
              </p>

              {/* 3. Liquid Glass OAuth Buttons (Google & GitHub) */}
              <div className="flex items-center justify-center gap-3 w-full">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="h-11 px-5 rounded-full bg-white/[0.055] hover:bg-white/[0.10] border border-white/[0.12] shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-md text-white/90 text-sm font-medium flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer flex-1"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleGithubAuth}
                  className="h-11 px-5 rounded-full bg-white/[0.055] hover:bg-white/[0.10] border border-white/[0.12] shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-md text-white/90 text-sm font-medium flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer flex-1"
                >
                  <svg className="w-4 h-4 shrink-0 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              {/* 4. Transparent Gradient Divider */}
              <div className="relative w-full flex items-center justify-center my-6">
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="absolute px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider backdrop-blur-none bg-transparent">
                  {isRtl ? 'یا' : 'OR'}
                </span>
              </div>

              {/* 5. Smart Email Input with Optional Domain Badge Pill */}
              <div className="w-full">
                <AuthEmailInput
                  onSubmit={handleResolvedEmailSubmit}
                  loading={isLoading}
                  isRtl={isRtl}
                  initialValue={email}
                />
              </div>
            </motion.div>
          )}

          {/* ========================================================
              SCREEN 2: EXISTING USER PASSWORD PROMPT
             ======================================================== */}
          {currentFlow === 'login_password' && (
            <motion.div
              key="login_password"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center w-full"
            >
              {/* Brand Logo Badge */}
              <div className="h-14 w-14 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-1 ring-white/25 border border-white/20">
                <span className="text-xl font-black tracking-wider text-white font-sans">TS</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-white/95 tracking-tight mb-2">
                {isRtl ? 'رمز عبور خود را وارد کنید' : 'Enter your password'}
              </h1>

              {/* User Snippet Pill */}
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.055] border border-white/[0.12] shadow-sm backdrop-blur-md mb-6">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-bold">
                  {existingUserSnippet?.name ? existingUserSnippet.name.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
                </div>
                <span className="text-xs font-semibold text-white/80">
                  {existingUserSnippet?.name || email}
                </span>
              </div>

              {/* Password Input */}
              <form onSubmit={handleLoginSubmit} className="w-full space-y-4">
                <div
                  className={cn(
                    'w-full h-14 px-4 rounded-xl flex items-center gap-3 transition-all duration-200 backdrop-blur-md',
                    'bg-white/[0.055] border border-white/[0.12]',
                    'focus-within:bg-white/[0.09] focus-within:border-blue-500/60 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'
                  )}
                >
                  <Lock className="w-5 h-5 shrink-0 text-white/50" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none text-base font-mono text-white placeholder-white/40 px-0"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-white/45 hover:text-white transition-colors cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading || !password}
                  aria-busy={isLoading}
                  className={cn(
                    'relative h-12 w-full rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.99] overflow-hidden',
                    isLoading
                      ? '!bg-[#05060b] !border-[#1d63ff]/40 text-white shadow-[0_0_24px_rgba(29,99,255,0.25)] opacity-100 cursor-wait'
                      : password
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 border border-blue-400/30'
                      : 'bg-white/10 text-white/30 border border-white/5 cursor-not-allowed'
                  )}
                >
                  <span className={cn('flex items-center justify-center gap-2', isLoading ? 'opacity-0 invisible pointer-events-none' : 'opacity-100')}>
                    <span>{isRtl ? 'ورود به محیط کارگاه' : 'Log in to Workspace'}</span>
                    <ArrowForward className="w-4 h-4" strokeWidth={2.2} />
                  </span>
                  {isLoading && <StrandsLoader variant="button" />}
                </button>

                {/* Links */}
                <div className="flex items-center justify-between text-xs text-white/55 pt-2 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      clearFeedback();
                      setCurrentFlow('email_entry');
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    {isRtl ? '← تغییر نشانی ایمیل' : '← Change email'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      clearFeedback();
                      setCurrentFlow('forgot_password');
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    {isRtl ? 'فراموشی کلمه عبور؟' : 'Forgot password?'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ========================================================
              SCREEN 3: 3-STEP REGISTRATION STEPPER
             ======================================================== */}
          {currentFlow === 'register_stepper' && (
            <motion.div
              key="register_stepper"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center w-full"
            >
              <MultiStepForm
                steps={registrationSteps}
                currentStep={regStep}
                formData={formData}
                onInputChange={handleInputChange}
                onNext={handleRegisterStepNext}
                onBack={() => {
                  if (regStep === 1) {
                    setCurrentFlow('email_entry');
                  } else {
                    setRegStep((prev) => prev - 1);
                  }
                }}
                onStepClick={(s) => setRegStep(s)}
                isRtl={isRtl}
                isLoading={isLoading}
                submitLabel={isRtl ? 'تکمیل و ارسال درخواست عضویت' : 'Complete Registration'}
                nextLabel={isRtl ? 'ادامه' : 'Continue'}
                backLabel={isRtl ? (regStep === 1 ? 'بازگشت به ابتدا' : 'مرحله قبل') : 'Go back'}
              />
            </motion.div>
          )}

          {/* ========================================================
              SCREEN 4: COMPLETION / PENDING APPROVAL QUEUE
             ======================================================== */}
          {currentFlow === 'pending_success' && (
            <motion.div
              key="pending_success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center text-center space-y-5 py-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <Check className="w-8 h-8" strokeWidth={2.5} />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl md:text-3xl font-serif text-white/95 tracking-tight font-normal">
                  {isRtl ? 'حساب کاربری شما ایجاد شد' : "You're all set"}
                </h2>
                <p className="text-xs text-white/60 leading-relaxed max-w-sm mx-auto">
                  {isRtl
                    ? 'اطلاعات شما با موفقیت ثبت گردید. درخواست عضویت در صف تایید مدیریت سامانه قرار گرفت و به زودی فعال خواهد شد.'
                    : 'Your account has been registered and submitted to the workspace admin for verification.'}
                </p>
              </div>

              {/* Status Details Card */}
              <div className="p-4 rounded-2xl bg-white/[0.055] border border-white/[0.12] shadow-sm backdrop-blur-md w-full text-start space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-white/55">
                  <span>{isRtl ? 'نام کاربر:' : 'User:'}</span>
                  <span className="font-bold text-white/90">{formData.name}</span>
                </div>
                <div className="flex justify-between items-center text-white/55">
                  <span>{isRtl ? 'شناسه ایمیل:' : 'Email:'}</span>
                  <span className="font-mono text-white/90" dir="ltr">{email}</span>
                </div>
                <div className="flex justify-between items-center text-white/55">
                  <span>{isRtl ? 'وضعیت دسترسی:' : 'Status:'}</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    {isRtl ? 'در انتظار تایید مدیر' : 'Pending Approval'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  clearFeedback();
                  setCurrentFlow('email_entry');
                }}
                className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition-all cursor-pointer text-xs shadow-md mt-2 border border-blue-400/30"
              >
                {isRtl ? 'بازگشت به صفحه ورود' : 'Return to Login'}
              </button>
            </motion.div>
          )}

          {/* ========================================================
              PASSWORD RECOVERY FLOW
             ======================================================== */}
          {currentFlow === 'forgot_password' && (
            <motion.div
              key="forgot_password"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center w-full"
            >
              <h2 className="text-2xl font-serif text-white/95 mb-2 font-normal">
                {isRtl ? 'بازیابی کلمه عبور' : 'Reset Password'}
              </h2>
              <p className="text-xs text-white/60 mb-6">
                {isRtl
                  ? 'کد تایید به ایمیل شما ارسال خواهد شد.'
                  : 'A verification code will be sent to your email.'}
              </p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  clearFeedback();
                  setIsLoading(true);
                  try {
                    const res = await fetch('/api/auth/forgot-password', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: email.trim().toLowerCase() })
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setFeedback({
                        type: 'success',
                        message: `${isRtl ? 'کد تایید صادر شد: ' : 'Recovery Code: '} ${data.code || '123456'}`
                      });
                      setRecoveryStep('verify');
                    } else {
                      setFeedback({ type: 'error', message: data.message || 'Error sending code' });
                    }
                  } catch {
                    setFeedback({ type: 'error', message: 'Failed to connect to server' });
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="w-full space-y-4"
              >
                <div
                  className={cn(
                    'w-full h-14 px-4 rounded-xl flex items-center gap-3 transition-all duration-200 backdrop-blur-md',
                    'bg-white/[0.055] border border-white/[0.12]',
                    'focus-within:bg-white/[0.09] focus-within:border-blue-500/60 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'
                  )}
                >
                  <Mail className="w-5 h-5 shrink-0 text-white/50" />
                  <input
                    type="email"
                    required
                    dir="ltr"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none text-base font-mono text-white placeholder-white/40 px-0"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                </div>

                {recoveryStep === 'verify' && (
                  <>
                    <div
                      className={cn(
                        'w-full h-14 px-4 rounded-xl flex items-center gap-3 transition-all duration-200 backdrop-blur-md',
                        'bg-white/[0.055] border border-white/[0.12]',
                        'focus-within:bg-white/[0.09] focus-within:border-blue-500/60 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'
                      )}
                    >
                      <input
                        type="text"
                        required
                        dir="ltr"
                        maxLength={6}
                        autoComplete="off"
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none placeholder:text-white/40 text-base font-mono text-center tracking-widest text-white px-0"
                        style={{ outline: 'none', boxShadow: 'none' }}
                      />
                    </div>

                    <div
                      className={cn(
                        'w-full h-14 px-4 rounded-xl flex items-center gap-3 transition-all duration-200 backdrop-blur-md',
                        'bg-white/[0.055] border border-white/[0.12]',
                        'focus-within:bg-white/[0.09] focus-within:border-blue-500/60 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'
                      )}
                    >
                      <Lock className="w-5 h-5 shrink-0 text-white/50" />
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        value={newRecoveryPassword}
                        onChange={(e) => setNewRecoveryPassword(e.target.value)}
                        placeholder={isRtl ? 'رمز عبور جدید' : 'New Password'}
                        className="w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none placeholder:text-white/40 text-base font-mono text-white px-0"
                        style={{ outline: 'none', boxShadow: 'none' }}
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  aria-busy={isLoading}
                  className={cn(
                    'relative h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.99] border border-blue-400/30 overflow-hidden',
                    isLoading && '!bg-[#05060b] !border-[#1d63ff]/40 shadow-[0_0_24px_rgba(29,99,255,0.25)] cursor-wait'
                  )}
                >
                  <span className={cn('flex items-center justify-center gap-2', isLoading ? 'opacity-0 invisible pointer-events-none' : 'opacity-100')}>
                    <span>
                      {recoveryStep === 'request'
                        ? (isRtl ? 'ارسال کد بازیابی' : 'Send Recovery Code')
                        : (isRtl ? 'تغییر رمز و ورود' : 'Reset & Login')}
                    </span>
                  </span>
                  {isLoading && <StrandsLoader variant="button" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearFeedback();
                    setCurrentFlow('email_entry');
                  }}
                  className="text-xs text-white/55 hover:text-white transition-colors cursor-pointer pt-1"
                >
                  {isRtl ? 'بازگشت به صفحه ورود' : 'Back to Login'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthModal;
