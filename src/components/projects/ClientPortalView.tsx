import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { PublicClientPortal } from '../PublicClientPortal';
import { ClientFeedback } from '../../types';
import { 
  ShieldCheck, 
  Copy, 
  RefreshCw, 
  Eye, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  Filter, 
  Sparkles,
  Lock,
  Globe,
  Share2,
  Check
} from 'lucide-react';

const toPersianDigits = (n: string | number): string => {
  if (n === null || n === undefined) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/[0-9]/g, (x) => farsiDigits[parseInt(x, 10)]);
};

export const ClientPortalView: React.FC = () => {
  const { 
    selectedProject, 
    projects, 
    toggleClientPortal, 
    regenerateClientToken, 
    updateFeedbackStatus 
  } = useProject();

  const activeProject = selectedProject || projects[0] || null;

  const [copied, setCopied] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');

  if (!activeProject) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold">
        لطفاً ابتدا یک پروژه فعال انتخاب کنید.
      </div>
    );
  }

  // Construct clean direct URL using portalToken parameter
  const portalTokenVal = activeProject.clientPortalToken || activeProject.portalToken || activeProject.id;
  const dynamicClientUrl = `${window.location.origin}${window.location.pathname}?portalToken=${portalTokenVal}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(dynamicClientUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleRegenerateToken = async () => {
    if (window.confirm('آیا از بازتولید توکن امنیتی مطمئن هستید؟ لینک قبلی برای کارفرما منقضی خواهد شد.')) {
      setIsRegenerating(true);
      await regenerateClientToken(activeProject.id);
      setIsRegenerating(false);
    }
  };

  const handleTogglePortal = async () => {
    const nextState = !activeProject.clientPortalEnabled;
    await toggleClientPortal(activeProject.id, nextState);
  };

  // Filter feedbacks
  const allFeedbacks: ClientFeedback[] = activeProject.clientFeedbacks || [];
  const filteredFeedbacks = allFeedbacks.filter(fb => {
    if (filterStatus === 'all') return true;
    return fb.status === filterStatus;
  });

  return (
    <div className="space-y-6 dir-rtl font-['Vazirmatn']">
      
      {/* 1. PORTAL MANAGEMENT & SECURITY HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xs space-y-5">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <ShieldCheck size={18} />
              </span>
              <h2 className="font-black text-sm text-slate-800 dark:text-slate-100">
                مدیریت پورتال اختصاصی کارفرما ({activeProject.clientName})
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              لینک امن بدون نیاز به لاگین برای ارائه گزارش پیشرفت و دریافت نظرات مستقیم کارفرما.
            </p>
          </div>

          {/* TOGGLE ACCESS SWITCH */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {activeProject.clientPortalEnabled !== false ? 'دسترسی عمومی فعال' : 'دسترسی عمومی مسدود'}
            </span>
            <button
              onClick={handleTogglePortal}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
                activeProject.clientPortalEnabled !== false ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span 
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-md ${
                  activeProject.clientPortalEnabled !== false ? 'right-1' : 'right-7'
                }`}
              />
            </button>
          </div>
        </div>

        {/* SHARE LINK & ACTION BAR */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="flex-1 relative flex items-center">
            <Globe size={16} className="absolute right-3.5 text-slate-400" />
            <input
              type="text"
              readOnly
              value={dynamicClientUrl}
              className="w-full pr-10 pl-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* COPY LINK BUTTON */}
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              <span>{copied ? 'لینک مستقیم کارفرما کپی شد' : 'کپی لینک کارفرما'}</span>
            </button>

            {/* REGENERATE TOKEN BUTTON */}
            <button
              onClick={handleRegenerateToken}
              disabled={isRegenerating}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              title="بازتولید توکن امنیتی"
            >
              <RefreshCw size={15} className={isRegenerating ? 'animate-spin' : ''} />
            </button>

            {/* PREVIEW BUTTON */}
            <button
              onClick={() => setIsPreviewModalOpen(true)}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Eye size={15} className="text-blue-600 dark:text-blue-400" />
              <span>پیش‌نمایش دیدگاه کارفرما</span>
            </button>

            {/* OPEN DIRECT LINK BUTTON */}
            <button
              onClick={() => window.open(dynamicClientUrl, '_blank')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="مشاهده مستقیم پورتال در تب جدید"
            >
              <ExternalLink size={15} />
              <span>مشاهده مستقیم پورتال</span>
            </button>
          </div>
        </div>

      </div>

      {/* 2. ADMIN FEEDBACK MANAGEMENT TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xs space-y-4">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-600 dark:text-blue-400" />
            <h3 className="font-black text-sm text-slate-800 dark:text-slate-100">
              مدیریت بازخوردهای دریافتی ({toPersianDigits(allFeedbacks.length)})
            </h3>
          </div>

          {/* FILTER TABS */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl shrink-0 border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              همه ({toPersianDigits(allFeedbacks.length)})
            </button>

            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'pending'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              در انتظار بررسی
            </button>

            <button
              onClick={() => setFilterStatus('resolved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'resolved'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              برطرف شده ✅
            </button>
          </div>
        </div>

        {/* FEEDBACK LIST */}
        {filteredFeedbacks.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <MessageSquare size={32} className="mx-auto text-slate-400" />
            <p className="text-xs text-slate-500 font-bold">هیچ بازخوردی با این وضعیت ثبت نشده است.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFeedbacks.map((fb) => (
              <div 
                key={fb.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-800 dark:text-slate-100">{fb.senderName}</span>
                    <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] rounded-lg font-bold">
                      {fb.category === 'design' ? 'طراحی' : fb.category === 'technical' ? 'فنی' : fb.category === 'content' ? 'محتوا' : 'عمومی'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">{fb.createdAt}</span>
                </div>

                <p className="font-bold text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {fb.message}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 font-bold">تغییر وضعیت سریع:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateFeedbackStatus(activeProject.id, fb.id, 'pending')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                        fb.status === 'pending'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      در انتظار
                    </button>

                    <button
                      onClick={() => updateFeedbackStatus(activeProject.id, fb.id, 'in_progress')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                        fb.status === 'in_progress'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      در حال بررسی
                    </button>

                    <button
                      onClick={() => updateFeedbackStatus(activeProject.id, fb.id, 'resolved')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                        fb.status === 'resolved'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      برطرف شده ✅
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* 3. PREVIEW MODAL */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
          <div className="bg-slate-950 w-full max-w-5xl h-[90vh] rounded-3xl overflow-hidden flex flex-col border border-slate-800 shadow-2xl">
            <div className="flex-1 overflow-y-auto">
              <PublicClientPortal 
                tokenParam={activeProject.clientPortalToken}
                isPreview={true}
                onClosePreview={() => setIsPreviewModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
