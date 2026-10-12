import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Trash2, 
  Share2, 
  Lock, 
  ShieldCheck, 
  Clock, 
  FileText, 
  FileSpreadsheet, 
  Sparkles, 
  FileCode, 
  FileCheck, 
  Users, 
  History, 
  Check 
} from 'lucide-react';
import { toPersianDigits, getFileExtension, getFileTypeStyle } from './utils';

interface AssetDetailDrawerProps {
  isOpen: boolean;
  asset: any | null;
  onClose: () => void;
  onDeleteAsset: (id: string) => void;
  onDownloadAsset?: (asset: any) => void;
}

export const AssetDetailDrawer: React.FC<AssetDetailDrawerProps> = ({
  isOpen,
  asset,
  onClose,
  onDeleteAsset,
  onDownloadAsset
}) => {
  const [permissionLevel, setPermissionLevel] = useState<'public' | 'team' | 'private'>('team');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !asset) return null;

  const ext = getFileExtension(asset.name || asset.title || 'DOCX');
  const style = getFileTypeStyle(asset.name || asset.title || 'DOCX', asset.category);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const renderFileIcon = () => {
    switch (ext) {
      case 'XLSX':
      case 'CSV':
        return <FileSpreadsheet size={54} className="text-emerald-600 dark:text-emerald-400" />;
      case 'FIG':
      case 'PNG':
      case 'JPG':
        return <Sparkles size={54} className="text-blue-600 dark:text-blue-400" />;
      case 'PDF':
        return <FileCheck size={54} className="text-amber-600 dark:text-amber-400" />;
      case 'SQL':
      case 'TS':
      case 'JS':
        return <FileCode size={54} className="text-cyan-600 dark:text-cyan-400" />;
      default:
        return <FileText size={54} className="text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-200 cursor-pointer"
        onClick={onClose}
      />

      {/* Slide-over Drawer on the Left Side (LTR/RTL standard layout overlay) */}
      <div className="fixed inset-y-0 left-0 w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-r border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300 font-sans">
        
        {/* Header Bar */}
        <div>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="بستن"
              >
                <X size={18} />
              </button>
              <span className="font-extrabold text-xs text-slate-700 dark:text-slate-200">
                مشخصات و دسترسی‌های فایل
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="کپی لینک مستقیم"
              >
                {copiedLink ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
              </button>
              <button
                type="button"
                onClick={() => onDeleteAsset(asset.id)}
                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                title="حذف فایل"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Large Preview Banner */}
          <div className="p-5 space-y-6">
            
            <div className={`h-40 bg-gradient-to-br ${style.bgGradient} rounded-2xl flex flex-col items-center justify-center relative border ${style.borderColor} shadow-xs`}>
              {renderFileIcon()}
              <span className={`mt-2 px-3 py-1 rounded-lg ${style.badgeBg} ${style.badgeText} text-xs font-black font-mono shadow-2xs`}>
                .{ext}
              </span>
            </div>

            {/* Title & Metadata */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-black text-sm text-slate-800 dark:text-slate-100 leading-snug">
                  {asset.name || asset.title || 'سند جدید'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[10px] font-black whitespace-nowrap">
                  نسخه {toPersianDigits(asset.version || 2)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                دسته‌بندی: <span className="text-slate-600 dark:text-slate-300 font-bold">{asset.category || 'عمومی'}</span>
              </p>
            </div>

            {/* File Metrics Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block">حجم ذخیره‌سازی</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 font-mono mt-0.5 block">
                  {toPersianDigits(asset.size || '۲.۴ مگابایت')}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block">تاریخ ثبت</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 font-mono mt-0.5 block">
                  {toPersianDigits(asset.uploadDate || '۱۴۰۳/۰۵/۰۱')}
                </span>
              </div>
            </div>

            {/* Access Permissions Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lock size={14} className="text-blue-500" />
                <span>سطح دسترسی پروژه:</span>
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPermissionLevel('team')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    permissionLevel === 'team'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  اعضای تیم
                </button>
                <button
                  type="button"
                  onClick={() => setPermissionLevel('public')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    permissionLevel === 'public'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  عمومی
                </button>
                <button
                  type="button"
                  onClick={() => setPermissionLevel('private')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    permissionLevel === 'private'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  اختصاصی
                </button>
              </div>
            </div>

            {/* Collaborators / Owners */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users size={14} className="text-blue-500" />
                <span>مالک و همکاران:</span>
              </label>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                {(asset.owners || ['علی طهمورث', 'سارا رضایی']).map((owner: string, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                        {owner.charAt(0)}
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{owner}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      {idx === 0 ? 'مالک اصلی' : 'ویرایشگر'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Version History Timeline */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <History size={14} className="text-blue-500" />
                <span>تاریخچه تغییرات نسخه‌ها:</span>
              </label>
              <div className="space-y-2 pl-2 border-r-2 border-blue-200 dark:border-blue-900/50 mr-1 pr-3">
                <div className="text-xs space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span>نسخه {toPersianDigits('2.0')} - ویرایش نهایی</span>
                    <span className="text-[10px] text-slate-400 font-mono">۱۰ دقیقه پیش</span>
                  </div>
                  <p className="text-[11px] text-slate-400">اعمال رنگ‌بندی جدید و بهینه‌سازی تایپوگرافی توسط علی طهمورث</p>
                </div>

                <div className="text-xs space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-slate-600 dark:text-slate-400">
                    <span>نسخه {toPersianDigits('1.0')} - ثبت اولیه</span>
                    <span className="text-[10px] text-slate-400 font-mono">دیروز</span>
                  </div>
                  <p className="text-[11px] text-slate-400">آپلود سند اصلی توسط سارا رضایی</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 space-y-2">
          <button
            type="button"
            onClick={() => {
              if (onDownloadAsset) onDownloadAsset(asset);
              else alert(`دانلود فایل ${asset.name || asset.title} آغاز شد.`);
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Download size={16} />
            <span>دانلود مستقیم فایل</span>
          </button>
          
          <button
            type="button"
            onClick={() => onDeleteAsset(asset.id)}
            className="w-full bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-extrabold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-rose-200 dark:border-rose-900/40"
          >
            <Trash2 size={14} />
            <span>حذف دائم از سیستم</span>
          </button>
        </div>

      </div>
    </>
  );
};
