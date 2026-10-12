import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  Tag, 
  Paperclip, 
  MessageSquare, 
  User, 
  Maximize2, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  Send,
  FileText,
  Download,
  UploadCloud,
  FileCode,
  LayoutDashboard,
  CheckSquare
} from 'lucide-react';
import { useProjectContext } from '../../context/ProjectContext';
import { Task, SubTask } from '../../types';
import { cn } from '../../lib/utils';

export interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenFull?: () => void;
  onOpenFullManage?: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onOpenFull,
  onOpenFullManage
}) => {
  const { 
    currentUser, 
    projects, 
    teamMembers,
    updateTask, 
    updateTaskStatus, 
    language,
    locale 
  } = useProjectContext();

  const isRtl = (language === 'fa' || locale !== 'en');
  const [attachments, setAttachments] = useState<{ id: string; name: string; size: string; type: 'pdf' | 'figma' | 'doc' }[]>([
    { id: 'att_1', name: 'Design brief.pdf', size: '1.5 MB', type: 'pdf' },
    { id: 'att_2', name: 'ABC Dashboard.fig', size: '2.5 MB', type: 'figma' }
  ]);

  if (!isOpen || !task || typeof document === 'undefined') return null;

  const project = projects.find(p => p.id === task.projectId);

  const handleStatusChange = (newStatus: string) => {
    if (updateTaskStatus) {
      updateTaskStatus(task.id, newStatus as any);
    }
  };

  const handleAddAttachment = () => {
    const newName = `Asset_v${attachments.length + 1}.png`;
    setAttachments(prev => [
      ...prev,
      { id: `att_${Date.now()}`, name: newName, size: '840 KB', type: 'pdf' }
    ]);
  };

  const handleDownloadAll = () => {
    alert(isRtl ? 'در حال آماده‌سازی فایل‌های پیوست برای دانلود...' : 'Preparing all attachments for download...');
  };

  // Status mapping
  const statusDisplay = {
    'TODO': { label: 'To-do', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
    'pending': { label: 'To-do', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
    'IN_PROGRESS': { label: 'On Progress', bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' },
    'inprogress': { label: 'On Progress', bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' },
    'UNDER_REVIEW': { label: 'In Review', bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' },
    'review': { label: 'In Review', bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' },
    'COMPLETED': { label: 'Completed', bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' },
    'completed': { label: 'Completed', bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' }
  }[task.status] || { label: 'To-do', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' };

  // Priority mapping
  const priorityBadge = {
    'Urgent': 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800',
    'critical': 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800',
    'High': 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
    'high': 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
    'Medium': 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
    'medium': 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
    'Low': 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    'low': 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
  }[task.priority || 'Medium'] || 'bg-slate-100 text-slate-600';

  const assignees = task.assignees && task.assignees.length > 0 
    ? task.assignees 
    : [{ id: 'usr_default', name: task.assignedTo || currentUser?.name || 'Ali Tahmores', avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }];

  const tags = (task.tags && task.tags.length > 0) ? task.tags : ['Dashboard', 'UI/UX', 'Frontend'];

  const handleOpenFull = () => {
    if (onOpenFull) {
      onOpenFull();
    } else if (onOpenFullManage) {
      onClose();
      onOpenFullManage(task.id);
    }
  };

  return createPortal(
    <div className={`fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans ${isRtl ? 'dir-rtl' : 'dir-ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in cursor-pointer"
      />

      {/* Modal Card (Faithful to 47ae26cfd3f7958c05dd1c3.jpg) */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 w-full max-w-lg max-h-[92vh] flex flex-col bg-white dark:bg-[#0d121f] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden ${isRtl ? 'text-right' : 'text-left'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 px-6 border-b border-slate-100 dark:border-slate-800/80 shrink-0 bg-white dark:bg-[#0d121f]">
          <div className="flex items-center gap-3">
            {/* Top Icon Box */}
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {task.title}
                </h3>
                <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-black border", priorityBadge)}>
                  {task.priority || 'Urgent'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {project ? (project.title || project.name) : 'ABC Dashboard Project'}
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4"/>
          </button>
        </div>

        {/* Modal Body - Key Value List */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Key Value Table */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Status</span>
              <span className={cn("px-2.5 py-1 rounded-xl text-xs font-bold", statusDisplay.bg)}>
                {statusDisplay.label}
              </span>
            </div>

            {/* Due Date */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Due date</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {task.dueDate || task.deadline || 'Feb 14, 2027'}
              </span>
            </div>

            {/* Assignee */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Assignee</span>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {assignees.map((assignee, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold"
                  >
                    <img src={assignee.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                    <span>{assignee.name}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Tags</span>
              <div className="flex items-center gap-1 flex-wrap justify-end">
                {tags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Priority</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {task.priority || 'Urgent'}
              </span>
            </div>

            {/* Description */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
              <span className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Description</span>
              <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                {task.description || 'Create wireframe for Dashboard page and prepare high-fidelity prototypes.'}
              </p>
            </div>
          </div>

          {/* Attachments Section ("Attachment (2)" + "Download All") */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Attachment ({attachments.length})
              </span>
              <button
                type="button"
                onClick={handleDownloadAll}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download All</span>
              </button>
            </div>

            <div className="space-y-2">
              {/* File Card 1: Word / PDF Icon + Design brief.pdf (1.5 MB) */}
              {attachments.map((file) => (
                <div 
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-blue-400 dark:hover:border-blue-600 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                      file.type === 'figma' 
                        ? "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400" 
                        : "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                    )}>
                      {file.type === 'figma' ? <FileCode className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                        {file.name}
                      </h4>
                      <span className="text-[10px] text-slate-400">{file.size}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => alert(`Downloading ${file.name}...`)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Download file
                  </button>
                </div>
              ))}

              {/* Dashed Box for uploading new assets */}
              <button
                type="button"
                onClick={handleAddAttachment}
                className="w-full p-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50/40 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 hover:text-blue-600 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>+ Upload New Asset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0d121f] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleStatusChange(task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                task.status === 'COMPLETED' 
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400" 
                  : "bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600"
              )}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{task.status === 'COMPLETED' ? 'تکمیل شده' : 'علامت به عنوان تکمیل'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenFull}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{isRtl ? 'مشاهده و مدیریت کامل فرآیند' : 'Open Full Management'}</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
