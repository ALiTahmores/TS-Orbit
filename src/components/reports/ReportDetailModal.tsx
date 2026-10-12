import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Download, CheckCircle2, AlertTriangle, ShieldCheck, 
  TrendingUp, Layers, Sparkles 
} from 'lucide-react';
import { useProjectContext } from '../../context/ProjectContext';
import { cn } from '../../lib/utils';

export interface ReportDetailModalProps {
  report: any;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ report, isOpen, onClose }) => {
  const { projects, tasks, currentUser, activeWorkspaceId } = useProjectContext();

  if (!isOpen || !report || typeof document === 'undefined') return null;

  // Real-time Synchronized Metrics
  const activeProjects = (projects || []).filter(p => !activeWorkspaceId || p.workspaceId === activeWorkspaceId);
  const totalProjects = activeProjects.length;
  
  const workspaceTasks = (tasks || []).filter(t => activeProjects.some(p => p.id === t.projectId) || (!t.projectId && activeProjects.length > 0));
  const totalTasks = workspaceTasks.length;
  const completedTasks = workspaceTasks.filter(t => t.status === 'COMPLETED' || t.status === 'completed').length;
  const overdueTasks = workspaceTasks.filter(t => t.isOverdue || t.priority === 'URGENT' || t.priority === 'HIGH' || t.priority === 'CRITICAL').length;
  
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const avgProgress = totalProjects > 0 
    ? Math.round(activeProjects.reduce((acc, p) => acc + (p.progress || 0), 0) / totalProjects) 
    : 0;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto" dir="rtl">
      {/* 1. Translucent Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 z-0 bg-black/[0.08] dark:bg-black/[0.35] backdrop-blur-[1.5px] transition-opacity animate-in fade-in cursor-pointer" 
      />

      {/* 2. Elevated Modal Surface */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-[#0d121f] rounded-[28px] border border-slate-200/90 dark:border-slate-800 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.18)] animate-in fade-in zoom-in-95 duration-150 overflow-hidden text-right">
        
        {/* Header: Actions (Left) | Title & Icon (Right) */}
        <div className="flex items-center justify-between p-5 px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          
          {/* Left Controls: Close (X) + PDF Download */}
          <div className="flex items-center gap-2.5">
            <button 
              type="button"
              onClick={onClose} 
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4"/>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5"/>
              <span>دانلود نسخه PDF</span>
            </button>
          </div>

          {/* Right Info: Icon & Titles */}
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">
                گزارش استراتژیک و خلاصه مدیریتی سازمان - {report.date || '۱۴۰۵/۰۶/۰۴'}
              </h3>
              <p className="text-[11px] text-slate-400">
                تاریخ صدور: {report.createdAt || report.generatedAt || '۱۴۰۵/۰۶/۰۴ - ۲۰:۰۸'} | صادرکننده: {currentUser?.name || 'علی طهمورث'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5"/>
            </div>
          </div>
        </div>

        {/* Scrollable Report Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* Top Banner */}
          <div className="flex items-center justify-between p-3.5 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              سیستم هوشمند تحلیل و پایش راندمان استراتژیک مدیران ارشد سازمان
            </span>
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              گزارش جامع ۳۶۰ درجه
            </span>
          </div>

          {/* Section 1: KPI Summary Cards */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <Sparkles className="w-4 h-4 text-blue-600"/>
              <span>بخش ۱: شاخص‌های کلیدی عملکرد ارشد (Executive KPI Summary)</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">کل پروژه‌های فعال</span>
                <span className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono">{totalProjects}</span>
                <span className="text-[10px] text-slate-400 block mt-1">({avgProgress}٪ پیشرفت میانگین)</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">وضعیت کلی وظایف</span>
                <span className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono">{totalTasks}</span>
                <span className="text-[10px] text-slate-400 block mt-1">({completedTasks} انجام‌شده)</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">وظایف معوقه / پرریسک</span>
                <span className="text-xl font-black text-rose-600 font-mono">{overdueTasks}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-1">
                  {overdueTasks === 0 ? 'بدون ریسک' : 'نیازمند پیگیری'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">راندمان بسته شدن وظایف</span>
                <span className="text-xl font-black text-blue-600 font-mono">{taskCompletionRate}٪</span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {totalTasks === 0 ? 'در انتظار تعریف وظایف' : `${completedTasks} از ${totalTasks} تسک`}
                </span>
              </div>
            </div>

            {/* Summary Narrative */}
            <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              {totalTasks === 0 ? (
                `گزارش مدیریتی فضای کاری در تاریخ ${report.date || '۱۴۰۵/۰۶/۰۴'}: در حال حاضر تعداد ${totalProjects} پروژه در سامانه تعریف شده است. از آنجا که هنوز وظایف اجرایی ثبت نشده‌اند، شاخص پیشرفت فیزیکی ۰٪ بوده و پروژه‌ها در وضعیت آماده‌سازی اولیه قرار دارند.`
              ) : (
                `گزارش تحلیلی فضای کاری: تعداد ${totalProjects} پروژه فعال با میانگین پیشرفت ${avgProgress}٪ در جریان است. از مجموع ${totalTasks} وظیفه ثبت‌شده، ${completedTasks} مورد تکمیل گردیده و راندمان کلی ${taskCompletionRate}٪ ارزیابی می‌شود.`
              )}
            </div>
          </div>

          {/* Section 2: Projects Matrix */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <Layers className="w-4 h-4 text-indigo-600"/>
              <span>بخش ۲: ماتریس وضعیت پروژه‌ها و پایش پیشرفت (Projects Matrix)</span>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">نام پروژه</th>
                    <th className="p-3">دپارتمان مسئول</th>
                    <th className="p-3">پیشرفت فیزیکی</th>
                    <th className="p-3">وضعیت پروژه</th>
                    <th className="p-3">مدیر پروژه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeProjects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400">پروژه‌ای در این دوره ثبت نشده است.</td>
                    </tr>
                  ) : (
                    activeProjects.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{p.title || p.name}</td>
                        <td className="p-3 text-slate-500">{p.department || (p.departments && p.departments[0]) || 'توسعه فنی'}</td>
                        <td className="p-3 font-mono font-bold text-blue-600">{p.progress || 0}٪</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                            {p.status === 'COMPLETED' ? 'تکمیل شده' : 'در جریان'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{p.teamLead || currentUser?.name || 'علی طهمورث'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Bottlenecks */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4"/>
              <span>بخش ۴: تحلیل گلوگاه‌ها و انباشت کاری اعضای تیم (Workload Bottlenecks)</span>
            </div>

            {overdueTasks === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">وضعیت مطلوب عملیاتی (Zero Bottlenecks)</h5>
                  <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400 mt-0.5">
                    هیچ گلوگاه اجرایی، تاخیر در سررسیدها یا انباشت وظایف معوقه در تیم‌ها شناسایی نشد.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4"/>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40">
                <span className="font-bold text-rose-800 dark:text-rose-200 block mb-1">تعداد {overdueTasks} وظیفه در وضعیت بحرانی یا معوقه</span>
                <p className="text-[11px] text-rose-600 dark:text-rose-400">توصیه می‌شود مدیران پروژه اولویت وظایف معوقه را بازبینی و منابع انسانی لازم را تخصیص دهند.</p>
              </div>
            )}
          </div>

          {/* Section 5: Action Plan */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4"/>
              <span>بخش ۵: توصیه‌های استراتژیک و برنامه اقدام مدیران (Action Plan & Takeaways)</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-2 text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
              {totalTasks === 0 ? (
                <>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>پروژه‌های ثبت‌شده در فاز ابتدایی راه‌اندازی قرار دارند و هنوز وظایف اجرایی برای آنها ثبت نشده است.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>تعداد کل پروژه‌ها: {totalProjects} | وظایف فعال: ۰ | ریسک عملیاتی شناسایی‌شده: ۰٪.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                      توصیه مدیریتی: جهت فعال‌سازی سیستم پایش پیشرفت و سنجش راندمان تیم‌ها، اقدام به ساختار شکست کار (WBS) و تعریف وظایف نمایید.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>میانگین پیشرفت فیزیکی کل پروژه‌ها {avgProgress}٪ و نرخ بسته شدن کلی وظایف {taskCompletionRate}٪ می‌باشد.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>تعداد کل پروژه‌ها: {totalProjects} | کل وظایف: {totalTasks} (انجام‌شده: {completedTasks}، معوقه: {overdueTasks}).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>پایش مداوم تسک‌های دارای سررسید نزدیک جهت جلوگیری از بروز گلوگاه‌های جدید توصیه می‌شود.</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <button 
            type="button"
            onClick={onClose} 
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            بستن پنجره
          </button>
          <span className="text-[10px] text-slate-400 font-mono">شناسه یکتای گزارش: {report.id || 'rep_exec_1787772792551'}</span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReportDetailModal;
