import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Plus } from 'lucide-react';
import { CustomSelect, CustomSelectOption } from '../../common/CustomSelect';

const categoryOptions: CustomSelectOption[] = [
  { value: 'documents', label: 'مستندات (Documents)' },
  { value: 'brand', label: 'طراحی UI/UX (Brand)' },
  { value: 'seo', label: 'محتوا و سئو (SEO)' },
  { value: 'contracts', label: 'قراردادها (Contracts)' },
  { value: 'dev', label: 'کد و فایل توسعه (Dev)' },
  { value: 'images', label: 'تصاویر (Images)' },
];

interface CreateFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fileData: {
    name: string;
    category: 'brand' | 'logo' | 'images' | 'documents' | 'contracts' | 'content' | 'seo' | 'dev';
    size: string;
    tag: string;
  }) => Promise<void>;
}

export const CreateFileModal: React.FC<CreateFileModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState<'brand' | 'logo' | 'images' | 'documents' | 'contracts' | 'content' | 'seo' | 'dev'>('documents');
  const [fileSize, setFileSize] = useState('');
  const [tag, setTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: fileName.trim(),
        category,
        size: fileSize,
        tag
      });
      setFileName('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans"
    >
      {/* 1. Translucent Gradient Backdrop (Background remains bright, sharp & readable) */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-0 bg-gradient-to-t from-black/[0.18] via-black/[0.06] to-transparent dark:from-black/[0.5] dark:via-black/[0.25] dark:to-transparent backdrop-blur-[1.5px] transition-opacity duration-300 animate-in fade-in cursor-pointer"
      />

      {/* 2. Modal Card Container with High-Contrast Elevation */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/90 dark:border-slate-800 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.18),0_10px_30px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 cursor-default"
      >
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
              <UploadCloud size={18} />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
              افزودن سند یا دارایی جدید
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
              نام فایل با پسوند (مثلاً Project_Design.fig)
            </label>
            <input
              type="text"
              required
              placeholder="مثلاً Technical_Architecture_v1.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                دسته‌بندی فایل
              </label>
              <CustomSelect
                options={categoryOptions}
                value={category}
                onChange={(val) => setCategory(val as any)}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                حجم تخمینی
              </label>
              <input
                type="text"
                placeholder="مثلاً ۲.۴ مگابایت"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
              برچسب (Tag)
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="مثلاً خروجی اصلی"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !fileName.trim()}
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>{isSubmitting ? 'در حال ثبت...' : 'ثبت دارایی دیجیتال'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
