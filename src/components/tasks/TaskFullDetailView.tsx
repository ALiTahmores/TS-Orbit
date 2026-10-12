import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Clock, 
  Tag, 
  User, 
  MessageSquare, 
  Paperclip, 
  Send, 
  Trash2, 
  Plus, 
  Save, 
  ChevronRight, 
  Briefcase,
  AlertTriangle,
  FileText,
  Sliders,
  Share2,
  MoreHorizontal,
  GripVertical,
  Download,
  UploadCloud,
  FileCode,
  CheckSquare,
  Activity,
  UserPlus
} from 'lucide-react';
import { useProjectContext } from '../../context/ProjectContext';
import { Task, SubTask, TaskPriority, TaskStatus } from '../../types';
import { cn } from '../../lib/utils';

export interface TaskFullDetailViewProps {
  task: Task;
  onBack: () => void;
}

export const TaskFullDetailView: React.FC<TaskFullDetailViewProps> = ({
  task,
  onBack
}) => {
  const { 
    currentUser, 
    projects, 
    teamMembers, 
    updateTask, 
    updateTaskStatus, 
    addTaskComment, 
    language,
    locale 
  } = useProjectContext();

  const isRtl = (language === 'fa' || locale !== 'en');
  const project = projects.find(p => p.id === task.projectId);

  const [activeTab, setActiveTab] = useState<'subtasks' | 'comments' | 'activities'>('subtasks');

  // Subtasks State with initial items matching reference bd6ab052bd64dece1930ea5e.jpg
  const [subtasks, setSubtasks] = useState<SubTask[]>(() => {
    if (task.subtasks && task.subtasks.length > 0) return task.subtasks;
    return [
      { id: 'st_1', title: 'Meeting & Mind Mapping with Tyler', note: 'Some employees have different KPI cases', completed: false },
      { id: 'st_2', title: 'Collect moodboards about KPI programs', note: 'Research modern dashboards', completed: true },
      { id: 'st_3', title: 'Wireframing high-fidelity components', note: 'Create dark & light variants', completed: false }
    ];
  });
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskNote, setNewSubtaskNote] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  // Attachments State
  const [attachments, setAttachments] = useState<{ id: string; name: string; size: string; type: 'pdf' | 'figma' | 'doc' }[]>([
    { id: 'att_1', name: 'Design brief.pdf', size: '1.5 MB', type: 'pdf' },
    { id: 'att_2', name: 'ABC Dashboard.fig', size: '2.5 MB', type: 'figma' }
  ]);

  // Comments State
  const [comments, setComments] = useState<{ id: string; author: string; avatar: string; text: string; time: string }[]>([
    {
      id: 'c1',
      author: 'Kiara Laras',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      text: 'Wireframes are looking great! Let me know when the prototype is ready for feedback.',
      time: '3 hours ago'
    },
    {
      id: 'c2',
      author: currentUser?.name || 'Ali Tahmores',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: 'Working on the KPI interaction cards and micro-animations now.',
      time: '25 min ago'
    }
  ]);
  const [newCommentText, setNewCommentText] = useState('');

  // Activities State
  const [activities] = useState([
    { id: 'a1', action: 'Created task "ABC Dashboard"', user: 'Ali Tahmores', time: 'Yesterday at 10:30 AM' },
    { id: 'a2', action: 'Uploaded Design brief.pdf', user: 'Kiara Laras', time: 'Yesterday at 11:15 AM' },
    { id: 'a3', action: 'Updated status to On Progress', user: 'Ali Tahmores', time: 'Today at 09:00 AM' }
  ]);

  // Dynamic Progress Calculation
  const completedCount = subtasks.filter(s => s.completed).length;
  const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : (task.progress || 25);

  const handleToggleSubtask = (stId: string) => {
    const updated = subtasks.map(s => s.id === stId ? { ...s, completed: !s.completed } : s);
    setSubtasks(updated);
    const newCompCount = updated.filter(s => s.completed).length;
    const newProg = updated.length > 0 ? Math.round((newCompCount / updated.length) * 100) : 0;

    if (updateTask) {
      updateTask(task.id, {
        subtasks: updated,
        progress: newProg
      });
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSt: SubTask = {
      id: `st_${Date.now()}`,
      title: newSubtaskTitle.trim(),
      note: newSubtaskNote.trim() || undefined,
      completed: false
    };
    const updated = [...subtasks, newSt];
    setSubtasks(updated);
    setNewSubtaskTitle('');
    setNewSubtaskNote('');
    setIsAddingSubtask(false);

    const newCompCount = updated.filter(s => s.completed).length;
    const newProg = updated.length > 0 ? Math.round((newCompCount / updated.length) * 100) : 0;

    if (updateTask) {
      updateTask(task.id, {
        subtasks: updated,
        progress: newProg
      });
    }
  };

  const handleRemoveSubtask = (stId: string) => {
    const updated = subtasks.filter(s => s.id !== stId);
    setSubtasks(updated);
    if (updateTask) {
      updateTask(task.id, { subtasks: updated });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const newC = {
      id: `cm_${Date.now()}`,
      author: currentUser?.name || 'Ali Tahmores',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: newCommentText.trim(),
      time: 'Just now'
    };
    setComments(prev => [...prev, newC]);
    if (addTaskComment) {
      addTaskComment(task.id, newCommentText.trim());
    }
    setNewCommentText('');
  };

  const assignees = task.assignees && task.assignees.length > 0
    ? task.assignees
    : [{ id: 'usr_1', name: 'Kiara Laras', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
       { id: 'usr_2', name: currentUser?.name || 'Ali Tahmores', avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }];

  return (
    <div className={`space-y-6 font-sans pb-16 ${isRtl ? 'dir-rtl' : 'dir-ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. TOP BAR (Faithful to bd6ab052bd64dece1930ea5e.jpg) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Back Arrow + Task Title + Timestamp */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <ArrowRight className={`w-5 h-5 ${isRtl ? '' : 'rotate-180'}`}/>
          </button>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                {task.title}
              </h1>
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <Clock className="w-3 h-3" />
                <span>3 min ago</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {project ? (project.title || project.name) : 'ABC Dashboard Project'}
            </p>
          </div>
        </div>

        {/* Right: Team Avatars + New Member Button + Options */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Team Avatars */}
          <div className="flex items-center -space-x-2 space-x-reverse">
            {assignees.map((mem, idx) => (
              <img
                key={idx}
                src={mem.avatar}
                alt={mem.name}
                title={mem.name}
                className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 object-cover shadow-2xs"
              />
            ))}
          </div>

          {/* + New Member Button */}
          <button
            type="button"
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ New member</span>
          </button>

          {/* Options Button */}
          <button
            type="button"
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 2. GRID: Task Properties & Attachments (Left/Right) + Subtask / Comments (Main) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* SIDEBAR: Properties & Attachments */}
        <div className="space-y-6">
          {/* Structured Properties Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3.5 text-xs">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              {isRtl ? 'ویژگی‌های تسک' : 'Task Properties'}
            </h3>

            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status</span>
              <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 text-xs font-bold">
                {task.status || 'On Progress'}
              </span>
            </div>

            {/* Due Date */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
              <span className="text-slate-400">Due date</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {task.dueDate || task.deadline || 'Feb 14, 2027'}
              </span>
            </div>

            {/* Assignees */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
              <span className="text-slate-400">Assignee</span>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {assignees.map((a, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
                    <img src={a.avatar} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                    <span>{a.name}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
              <span className="text-slate-400">Tags</span>
              <div className="flex items-center gap-1 flex-wrap justify-end">
                {['Dashboard', 'UI/UX'].map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
              <span className="text-slate-400">Priority</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {task.priority || 'Urgent'}
              </span>
            </div>

            {/* Description */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
              <span className="block text-slate-400 mb-1">Description</span>
              <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                {task.description || 'Create wireframe for Dashboard page and prepare high-fidelity prototypes for client review.'}
              </p>
            </div>
          </div>

          {/* Attachments Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Attachment ({attachments.length})
              </h3>
              <button
                type="button"
                onClick={() => alert('Downloading attachments...')}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download All</span>
              </button>
            </div>

            <div className="space-y-2">
              {attachments.map(file => (
                <div 
                  key={file.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                      file.type === 'figma' ? "bg-purple-50 text-purple-600 dark:bg-purple-950/60" : "bg-rose-50 text-rose-600 dark:bg-rose-950/60"
                    )}>
                      {file.type === 'figma' ? <FileCode className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{file.name}</h4>
                      <span className="text-[10px] text-slate-400">{file.size}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => alert(`Downloading ${file.name}`)}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold"
                  >
                    Download
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  setAttachments(prev => [...prev, { id: `att_${Date.now()}`, name: `New_asset_${prev.length+1}.fig`, size: '1.8 MB', type: 'figma' }]);
                }}
                className="w-full py-2.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-500 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>+ Upload New Asset</span>
              </button>
            </div>
          </div>
        </div>

        {/* MAIN PANEL: Tabs (Subtasks | Comments | Activities) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs Switcher */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('subtasks')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  activeTab === 'subtasks' 
                    ? "bg-blue-600 text-white shadow-xs" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                Subtasks ({subtasks.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('comments')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  activeTab === 'comments' 
                    ? "bg-blue-600 text-white shadow-xs" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                Comments ({comments.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('activities')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  activeTab === 'activities' 
                    ? "bg-blue-600 text-white shadow-xs" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                Activities
              </button>
            </div>
          </div>

          {/* TAB 1: SUBTASKS ("Our Design Process" + Dynamic Progress Bar) */}
          {activeTab === 'subtasks' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
              
              {/* Header with Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {isRtl ? 'فرآیند طراحی و اجرای پروژه (Our Design Process)' : 'Our Design Process'}
                  </h2>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    Progress : {progressPercent}%
                  </span>
                </div>

                {/* Dynamic Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Subtasks Checklist Items (Faithful to bd6ab052bd64dece1930ea5e.jpg) */}
              <div className="space-y-3">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-2xl border transition-all",
                      st.completed 
                        ? "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-80" 
                        : "bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800 shadow-2xs hover:border-blue-400"
                    )}
                  >
                    {/* Drag Handle Icon */}
                    <div className="text-slate-300 dark:text-slate-600 pt-0.5 cursor-grab">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(st.id)}
                      className={cn(
                        "w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5",
                        st.completed 
                          ? "bg-emerald-600 border-emerald-600 text-white" 
                          : "border-slate-300 dark:border-slate-600 hover:border-blue-500"
                      )}
                    >
                      {st.completed && <CheckSquare className="w-3.5 h-3.5" />}
                    </button>

                    {/* Title & Notes */}
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "text-xs font-bold text-slate-800 dark:text-slate-200",
                        st.completed && "line-through text-slate-400 dark:text-slate-500"
                      )}>
                        {st.title}
                      </h4>
                      {st.note && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {st.note}
                        </p>
                      )}
                    </div>

                    {/* Delete Subtask */}
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-300 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Subtask Form */}
              {isAddingSubtask ? (
                <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/80 space-y-2">
                  <input
                    type="text"
                    autoFocus
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder={isRtl ? "عنوان تسک فرعی جدید..." : "Subtask title..."}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newSubtaskNote}
                    onChange={(e) => setNewSubtaskNote(e.target.value)}
                    placeholder={isRtl ? "یادداشت تکمیلی (اختیاری)..." : "Note / details (optional)..."}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 focus:outline-none"
                  />
                  <div className="flex items-center gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingSubtask(false)}
                      className="px-3 py-1 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200/50 cursor-pointer"
                    >
                      {isRtl ? 'انصراف' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={handleAddSubtask}
                      className="px-4 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      {isRtl ? 'افزودن زیرتسک' : 'Add Item'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingSubtask(true)}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-500 hover:text-blue-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add New Subtask / Process Step</span>
                </button>
              )}

            </div>
          )}

          {/* TAB 2: COMMENTS */}
          {activeTab === 'comments' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isRtl ? 'نظرات و مکاتبات تیم' : 'Team Discussion & Comments'}
              </h3>

              <div className="space-y-3">
                {comments.map(c => (
                  <div key={c.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                    <img src={c.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{c.author}</span>
                        <span className="text-[10px] text-slate-400">{c.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder={isRtl ? "ارسال نظر جدید..." : "Write a comment..."}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'ارسال' : 'Send'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: ACTIVITIES */}
          {activeTab === 'activities' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isRtl ? 'تاریخچه فعالیت‌های تسک' : 'Task Activity Log'}
              </h3>
              <div className="space-y-2.5">
                {activities.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{a.action}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
