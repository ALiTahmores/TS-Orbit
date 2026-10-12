import React, { useState, useMemo, useRef } from 'react';
import { useProject } from '../../context/ProjectContext';
import { ProjectFile } from '../../types';
import { CustomSelect, CustomSelectOption } from '../common/CustomSelect';

const uploadCategoryOptions: CustomSelectOption[] = [
  { value: 'client_brief', label: 'بریف کارفرما' },
  { value: 'contract', label: 'قرارداد رسمی' },
  { value: 'design', label: 'طرح‌های گرافیکی' },
  { value: 'technical', label: 'مستندات فنی' },
  { value: 'general', label: 'سایر / عمومی' },
];
import { 
  UploadCloud, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Link as LinkIcon, 
  Search, 
  Filter, 
  Grid, 
  List, 
  File, 
  Image as ImageIcon, 
  FileCode, 
  Archive, 
  CheckCircle2, 
  Clock, 
  Plus, 
  X, 
  AlertTriangle, 
  Check, 
  Sparkles, 
  ChevronRight, 
  HardDrive, 
  User, 
  Folder, 
  Share2,
  ExternalLink
} from 'lucide-react';

const toPersianDigits = (n: string | number | null | undefined): string => {
  if (n === null || n === undefined) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/[0-9]/g, (x) => farsiDigits[parseInt(x, 10)]);
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '۰.۰ مگابایت';
  const k = 1024;
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedNum = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${toPersianDigits(formattedNum)} ${sizes[i]}`;
};

const getExtensionFromFileName = (fileName: string): ProjectFile['extension'] => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'doc') return 'doc';
  if (ext === 'docx') return 'docx';
  if (ext === 'xls') return 'xls';
  if (ext === 'xlsx') return 'xlsx';
  if (ext === 'txt') return 'txt';
  if (ext === 'fig') return 'fig';
  if (ext === 'zip' || ext === 'rar' || ext === '7z') return 'zip';
  if (ext === 'png') return 'png';
  if (ext === 'jpg' || ext === 'jpeg' || ext === 'webp' || ext === 'svg') return 'jpg';
  return 'pdf';
};

const CATEGORY_LABELS: Record<ProjectFile['category'], { label: string; bg: string; text: string }> = {
  client_brief: { label: 'بریف کارفرما', bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-300' },
  contract: { label: 'قرارداد رسمی', bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-300' },
  design: { label: 'طرح‌های گرافیکی', bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-300' },
  technical: { label: 'مستندات فنی', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300' },
  general: { label: 'سایر / عمومی', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' },
};

const getExtensionBadge = (ext: ProjectFile['extension']) => {
  switch (ext) {
    case 'pdf':
      return { label: 'PDF', bg: 'bg-red-500/10 text-red-600 border-red-200/50 dark:border-red-900/30', icon: FileText };
    case 'png':
    case 'jpg':
      return { label: 'تصویر', bg: 'bg-blue-500/10 text-blue-600 border-blue-200/50 dark:border-blue-900/30', icon: ImageIcon };
    case 'fig':
      return { label: 'Figma', bg: 'bg-blue-500/10 text-blue-600 border-blue-200/50 dark:border-blue-900/30', icon: Sparkles };
    case 'doc':
    case 'docx':
      return { label: 'Word', bg: 'bg-blue-500/10 text-blue-600 border-blue-200/50 dark:border-blue-900/30', icon: FileText };
    case 'xls':
    case 'xlsx':
      return { label: 'Excel', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50 dark:border-emerald-900/30', icon: FileText };
    case 'zip':
      return { label: 'Zip', bg: 'bg-amber-500/10 text-amber-600 border-amber-200/50 dark:border-amber-900/30', icon: Archive };
    case 'txt':
      return { label: 'TXT', bg: 'bg-slate-500/10 text-slate-600 border-slate-200/50 dark:border-slate-800', icon: FileCode };
    default:
      return { label: 'فایل', bg: 'bg-slate-500/10 text-slate-600 border-slate-200/50 dark:border-slate-800', icon: File };
  }
};

export const ProjectFilesTab: React.FC = () => {
  const { selectedProject, projects, teamMembers } = useProject();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentProj = selectedProject || projects[0] || null;

  // Project files state
  const [fileList, setFileList] = useState<ProjectFile[]>([]);

  // Filtering & view state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExt, setSelectedExt] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [uploadCategory, setUploadCategory] = useState<ProjectFile['category']>('general');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Modal / Toast states
  const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null);
  const [deletingFile, setDeletingFile] = useState<ProjectFile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Filter files by active project
  const projectFiles = useMemo(() => {
    if (!currentProj) return fileList;
    return fileList.filter(f => f.projectId === currentProj.id || !f.projectId);
  }, [fileList, currentProj?.id]);

  // Filtered files by search, category and ext
  const filteredFiles = useMemo(() => {
    return projectFiles.filter(file => {
      const matchesSearch = searchQuery.trim() === '' || 
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.uploadedBy.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'all' || file.category === selectedCategory;

      const matchesExt = selectedExt === 'all' ||
        (selectedExt === 'pdf' && file.extension === 'pdf') ||
        (selectedExt === 'image' && (file.extension === 'png' || file.extension === 'jpg')) ||
        (selectedExt === 'doc' && (file.extension === 'doc' || file.extension === 'docx' || file.extension === 'xls' || file.extension === 'xlsx')) ||
        (selectedExt === 'zip' && file.extension === 'zip') ||
        (selectedExt === 'fig' && file.extension === 'fig');

      return matchesSearch && matchesCat && matchesExt;
    });
  }, [projectFiles, searchQuery, selectedCategory, selectedExt]);

  // Total Storage Size Calculation
  const totalStorageSize = useMemo(() => {
    const totalBytes = projectFiles.reduce((acc, curr) => acc + (curr.sizeInBytes || 0), 0);
    return formatBytes(totalBytes);
  }, [projectFiles]);

  // Upload handler
  const handleUploadFiles = (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const newProjectFiles: ProjectFile[] = Array.from(files).map((f, idx) => {
      const ext = getExtensionFromFileName(f.name);
      const url = URL.createObjectURL(f);
      const now = new Date();
      const persianDate = `${toPersianDigits(now.getFullYear())}/${toPersianDigits(now.getMonth() + 1)}/${toPersianDigits(now.getDate())} - ${toPersianDigits(now.getHours())}:${toPersianDigits(now.getMinutes())}`;

      return {
        id: `pf-new-${Date.now()}-${idx}`,
        projectId: currentProj?.id || 'proj-1',
        name: f.name,
        sizeInBytes: f.size,
        formattedSize: formatBytes(f.size),
        extension: ext,
        category: uploadCategory,
        uploadedBy: {
          name: teamMembers?.[0]?.name || 'مدیر سیستم',
          avatar: teamMembers?.[0]?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
        },
        createdAt: persianDate,
        fileUrl: url
      };
    });

    setFileList(prev => [...newProjectFiles, ...prev]);
    showToast(`${toPersianDigits(newProjectFiles.length)} فایل جدید با موفقیت پیوست شد`);
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Direct Download Trigger
  const handleDownload = (file: ProjectFile) => {
    const link = document.createElement('a');
    link.href = file.fileUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`دانلود فایل «${file.name}» آغاز شد`);
  };

  // Copy Link Trigger
  const handleCopyLink = (file: ProjectFile) => {
    const fakeLink = `${window.location.origin}/files/${file.id}/${file.name}`;
    navigator.clipboard.writeText(fakeLink);
    showToast(`لینک اشتراک‌گذاری فایل با موفقیت کپی شد`);
  };

  // Delete Confirm
  const handleDeleteConfirm = () => {
    if (!deletingFile) return;
    setFileList(prev => prev.filter(f => f.id !== deletingFile.id));
    showToast(`فایل «${deletingFile.name}» با موفقیت حذف شد`);
    setDeletingFile(null);
  };

  return (
    <div className="w-full min-w-0 overflow-x-hidden space-y-6 text-right font-sans" style={{ fontFeatureSettings: '"ss01" 1', direction: 'rtl' }}>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 bg-slate-900 text-white dark:bg-blue-950 dark:text-blue-100 px-4 py-3 rounded-2xl shadow-xl border border-blue-500/30 flex items-center gap-2 text-xs font-bold animate-slide-up">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 1. TOP HEADER & METRIC STATS                                           */}
      {/* ====================================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
                <Folder size={20} />
              </span>
              <span>مخزن فایل‌ها و مستندات پروژه</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ذخیره‌سازی، سازماندهی و اشتراک‌گذاری امن اسناد و فایل‌های پروژه با دسترسی همه‌جانبه اعضای تیم.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <HardDrive size={16} className="text-blue-600 dark:text-blue-400" />
              <span>فضای مصرف‌شده: {totalStorageSize}</span>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus size={16} className="stroke-[2.5]" />
              <span>+ آپلود فایل جدید</span>
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              className="hidden" 
              onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
            />
          </div>
        </div>

        {/* ====================================================================== */}
        {/* 2. DRAG AND DROP UPLOAD ZONE                                           */}
        {/* ====================================================================== */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer space-y-3 ${
            isDragOver 
              ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 scale-[1.005]' 
              : 'border-slate-200/90 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:border-blue-300 dark:hover:border-blue-800'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center shadow-2xs">
            <UploadCloud size={24} />
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              فایل‌ها را کشیده و اینجا رها کنید یا برای جستجو کلیک کنید
            </h4>
            <p className="text-[11px] text-slate-400">
              پشتیبانی کامل از فرمت‌های PDF, Word, Excel, Figma, Images, Zip, TXT (تا سقف ۵۰ مگابایت)
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1 w-64 mx-auto" onClick={(e) => e.stopPropagation()}>
            <span className="text-[11px] text-slate-500 font-bold shrink-0">دسته‌بندی آپلود:</span>
            <CustomSelect
              options={uploadCategoryOptions}
              value={uploadCategory}
              onChange={(val) => setUploadCategory(val as any)}
            />
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 3. FILTERS, SEARCH AND VIEW TOGGLE                                     */}
      {/* ====================================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* SEARCH INPUT */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در نام فایل‌ها یا آپلودکننده..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 pr-9 pl-3 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* EXTENSION FILTER CHIPS & VIEW TOGGLE */}
          <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1 shrink-0">
                <Filter size={12} />
                <span>فرمت:</span>
              </span>

              {[
                { key: 'all', label: 'همه' },
                { key: 'pdf', label: 'PDF' },
                { key: 'image', label: 'تصاویر' },
                { key: 'doc', label: 'Word/Excel' },
                { key: 'fig', label: 'Figma' },
                { key: 'zip', label: 'Zip' }
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setSelectedExt(item.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedExt === item.key
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* VIEW MODE TOGGLE */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                title="نمایش شبکه‌ای"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <Grid size={15} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                title="نمایش لیستی"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <List size={15} />
              </button>
            </div>
          </div>

        </div>

        {/* CATEGORY TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800 scrollbar-none">
          {[
            { key: 'all', label: 'همه دسته‌ها', count: projectFiles.length },
            { key: 'client_brief', label: 'بریف کارفرما', count: projectFiles.filter(f => f.category === 'client_brief').length },
            { key: 'contract', label: 'قراردادها', count: projectFiles.filter(f => f.category === 'contract').length },
            { key: 'design', label: 'طرح‌های گرافیکی', count: projectFiles.filter(f => f.category === 'design').length },
            { key: 'technical', label: 'مستندات فنی', count: projectFiles.filter(f => f.category === 'technical').length },
            { key: 'general', label: 'سایر / عمومی', count: projectFiles.filter(f => f.category === 'general').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedCategory(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border ${
                selectedCategory === tab.key
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 text-[10px] rounded-md font-bold ${
                selectedCategory === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {toPersianDigits(tab.count)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 4. FILE ASSETS CONTAINER                                               */}
      {/* ====================================================================== */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <FileText size={24} />
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {projectFiles.length === 0
              ? 'هیچ مستند یا فایلی ثبت نشده است. برای اولین بار، فایل‌های بریف یا قرارداد کارفرما را اینجا آپلود کنید.'
              : 'هیچ فایلی متناسب با فیلتر انتخابی یافت نشد'}
          </h4>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            {projectFiles.length === 0
              ? 'فایل‌های PDF، طرح‌های Figma، قراردادها و مستندات فنی پروژه خود را به صورت امن ذخیره و مدیریت کنید.'
              : 'می‌توانید فیلترهای جستجو را پاک کنید یا فایل جدیدی برای این پروژه آپلود نمایید.'}
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            آپلود اولین فایل
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
          {filteredFiles.map(file => {
            const badge = getExtensionBadge(file.extension);
            const BadgeIcon = badge.icon;
            const categoryInfo = CATEGORY_LABELS[file.category] || CATEGORY_LABELS.general;

            return (
              <div 
                key={file.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5 group min-w-0"
              >
                <div className="space-y-3 min-w-0">
                  {/* TOP BADGE & CATEGORY */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${badge.bg}`}>
                      <BadgeIcon size={12} />
                      <span>{badge.label}</span>
                    </span>

                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${categoryInfo.bg} ${categoryInfo.text}`}>
                      {categoryInfo.label}
                    </span>
                  </div>

                  {/* FILE NAME & SIZE */}
                  <div className="space-y-1 min-w-0">
                    <h4 
                      onClick={() => setPreviewFile(file)}
                      className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer truncate" 
                      title={file.name}
                    >
                      {file.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      حجم: {file.formattedSize}
                    </p>
                  </div>
                </div>

                {/* FOOTER & ACTIONS */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                  {/* UPLOADER INFO */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5 truncate">
                      <img 
                        src={file.uploadedBy.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'} 
                        alt={file.uploadedBy.name}
                        className="w-4 h-4 rounded-full object-cover shrink-0" 
                      />
                      <span className="truncate">{file.uploadedBy.name}</span>
                    </div>
                    <span className="shrink-0">{file.createdAt.split('-')[0]}</span>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    <button
                      onClick={() => setPreviewFile(file)}
                      title="پیش‌نمایش فایل"
                      className="py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                    >
                      <Eye size={14} />
                    </button>

                    <button
                      onClick={() => handleDownload(file)}
                      title="دانلود مستقیم"
                      className="py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                    >
                      <Download size={14} />
                    </button>

                    <button
                      onClick={() => handleCopyLink(file)}
                      title="کپی لینک فایل"
                      className="py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                    >
                      <LinkIcon size={14} />
                    </button>

                    <button
                      onClick={() => setDeletingFile(file)}
                      title="حذف فایل"
                      className="py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          <table className="w-full text-right text-xs min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                <th className="p-3.5">نام فایل</th>
                <th className="p-3.5">دسته‌بندی</th>
                <th className="p-3.5">فرمت</th>
                <th className="p-3.5">حجم</th>
                <th className="p-3.5">آپلودکننده</th>
                <th className="p-3.5">تاریخ ثبت</th>
                <th className="p-3.5 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredFiles.map(file => {
                const badge = getExtensionBadge(file.extension);
                const BadgeIcon = badge.icon;
                const categoryInfo = CATEGORY_LABELS[file.category] || CATEGORY_LABELS.general;

                return (
                  <tr key={file.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 max-w-xs truncate font-bold text-slate-800 dark:text-slate-100">
                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPreviewFile(file)}>
                        <BadgeIcon size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="truncate hover:text-blue-600 transition-colors">{file.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${categoryInfo.bg} ${categoryInfo.text}`}>
                        {categoryInfo.label}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-slate-500 font-medium">
                      {file.formattedSize}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                        <img 
                          src={file.uploadedBy.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'} 
                          alt={file.uploadedBy.name}
                          className="w-5 h-5 rounded-full object-cover shrink-0" 
                        />
                        <span>{file.uploadedBy.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-slate-400 text-[11px] font-medium">
                      {file.createdAt}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setPreviewFile(file)}
                          className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-500 hover:text-blue-600 rounded-lg transition-all cursor-pointer"
                          title="پیش‌نمایش"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDownload(file)}
                          className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-500 hover:text-emerald-600 rounded-lg transition-all cursor-pointer"
                          title="دانلود"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => handleCopyLink(file)}
                          className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-500 hover:text-blue-600 rounded-lg transition-all cursor-pointer"
                          title="کپی لینک"
                        >
                          <LinkIcon size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingFile(file)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950 text-slate-500 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ====================================================================== */}
      {/* PREVIEW MODAL                                                         */}
      {/* ====================================================================== */}
      {previewFile && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-right animate-scale-up" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-xl shrink-0">
                  <FileText size={18} />
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                  پیش‌نمایش: {previewFile.name}
                </h3>
              </div>
              <button 
                onClick={() => setPreviewFile(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* PREVIEW CONTENT */}
            <div className="space-y-4">
              {previewFile.extension === 'png' || previewFile.extension === 'jpg' ? (
                <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center max-h-72 p-2">
                  <img 
                    src={previewFile.fileUrl !== '#' ? previewFile.fileUrl : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'} 
                    alt={previewFile.name} 
                    className="max-h-64 object-contain rounded-lg shadow-sm"
                  />
                </div>
              ) : (
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      فرمت فایل: {previewFile.extension.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {previewFile.formattedSize}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    این فایل به عنوان مستندات رسمی در پروژه ثبت شده است. برای مشاهده کامل محتوا یا ویرایش آنلاین، فایل را دانلود کرده یا از نرم‌افزار تخصصی مربوطه استفاده نمایید.
                  </p>
                </div>
              )}

              {/* METADATA GRID */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">دسته‌بندی:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {CATEGORY_LABELS[previewFile.category]?.label}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">تاریخ آپلود:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {previewFile.createdAt}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">ثبت‌کننده:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {previewFile.uploadedBy.name}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">پروژه مربوطه:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {currentProj?.title || 'پروژه جاری'}
                  </span>
                </div>
              </div>
            </div>

            {/* MODAL ACTIONS */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                بستن
              </button>
              <button
                onClick={() => handleDownload(previewFile)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Download size={14} />
                <span>دانلود مستقیم فایل</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* DELETE CONFIRMATION MODAL                                              */}
      {/* ====================================================================== */}
      {deletingFile && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-right animate-scale-up" dir="rtl">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-2 bg-red-100 dark:bg-red-950 rounded-xl">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                تایید حذف فایل
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              آیا از حذف فایل «<span className="font-bold">{deletingFile.name}</span>» اطمینان دارید؟ این عمل غیرقابل بازگشت است.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingFile(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
              >
                حذف فایل
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
