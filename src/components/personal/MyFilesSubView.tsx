import React, { useState } from 'react';
import { FileText, Search, Download, Trash2, Plus, HardDrive } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

const toPersianDigits = (n: string | number): string => {
  if (n === undefined || n === null) return '';
  return n.toString().replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)] || '۰');
};

export const MyFilesSubView: React.FC = () => {
  const { files, projects, deleteFile, locale } = useProject();
  const isRtl = locale === 'fa';
  const [search, setSearch] = useState('');

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" />
            <span>فایل‌های من (My Files)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">
            مدیریت اسناد، فایل‌های آپلود شده و فایل‌های به اشتراک گذاشته شده در پروژه‌ها
          </p>
        </div>

        <button
          type="button"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus size={16} />
          <span>آپلود فایل جدید</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در نام فایل..."
            className="w-full pr-9 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* FILE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                <FileText size={20} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{file.name}</h4>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{toPersianDigits(file.size)} • {file.uploadedAt}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => deleteFile(file.id)}
                className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
