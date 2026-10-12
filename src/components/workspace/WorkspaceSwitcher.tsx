import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Check, 
  ShieldCheck,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { Workspace } from '../../types';

interface WorkspaceSwitcherProps {
  isRtl?: boolean;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({ isRtl = true }) => {
  const { currentUser, locale, activeWorkspaceId, setActiveWorkspaceId, workspaces, setWorkspaces, refreshAllData } = useProject();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load workspaces from server
  const fetchWorkspaces = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/workspaces', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.workspaces || [];
        if (list.length > 0) {
          setWorkspaces(list);
          const stored = localStorage.getItem('activeWorkspaceId');
          const current = list.find((w: Workspace) => w.id === stored) || list[0];
          if (current && current.id !== activeWorkspaceId) {
            setActiveWorkspaceId(current.id);
            localStorage.setItem('activeWorkspaceId', current.id);
          }
        }
      }
    } catch {
      // Fallback local workspace
      if (currentUser && workspaces.length === 0) {
        const defaultWs: Workspace = {
          id: currentUser.personalWorkspaceId || `ws_${currentUser.id}`,
          name: `فضای کاری ${currentUser.name || 'کاربر'}`,
          ownerId: currentUser.id,
          inviteCode: 'WPSPACE1',
          members: [
            {
              userId: currentUser.id,
              role: 'OWNER',
              permissions: ['*'],
              name: currentUser.name,
              username: currentUser.username,
              email: currentUser.email,
              phone: currentUser.phone
            }
          ]
        };
        setWorkspaces([defaultWs]);
        setActiveWorkspaceId(defaultWs.id);
      }
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [currentUser]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0] || {
    id: 'ws_default',
    name: isRtl ? 'فضای کاری اصلی' : 'Main Workspace',
    ownerId: currentUser?.id,
    inviteCode: 'WPMASTER'
  };

  const handleSelectWorkspace = (wsId: string) => {
    setActiveWorkspaceId(wsId);
    localStorage.setItem('activeWorkspaceId', wsId);
    setIsOpen(false);
    refreshAllData();
  };

  return (
    <div className="relative" ref={dropdownRef} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Matched Workspace Switcher Icon Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm relative group"
        title={isRtl ? `فضای کاری فعال: ${activeWorkspace.name}` : `Active Workspace: ${activeWorkspace.name}`}
      >
        <Building2 className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        {/* Active workspace indicator dot */}
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111322]" />
      </button>

      {/* 100% Solid Opaque Background Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-12 z-50 w-72 rounded-2xl bg-white dark:bg-[#121526] border border-slate-200 dark:border-[#22273e] shadow-2xl p-3 space-y-2 ${
              isRtl ? 'left-0 text-right' : 'right-0 text-left'
            }`}
            style={{ backgroundColor: undefined }}
          >
            {/* Popover Header */}
            <div className="px-2 py-1.5 border-b border-slate-100 dark:border-[#1e2338] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Building2 size={14} className="text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-black text-slate-800 dark:text-white">
                  {isRtl ? 'فضاهای کاری من' : 'My Workspaces'}
                </span>
              </div>
              <span className="text-[10px] bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-black px-2 py-0.5 rounded-lg font-mono border border-blue-200/50 dark:border-blue-800/60">
                {workspaces.length} {isRtl ? 'فضا' : 'spaces'}
              </span>
            </div>

            {/* Workspace List */}
            <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-thin py-0.5">
              {workspaces.map((ws) => {
                const isSelected = ws.id === activeWorkspaceId;
                const isOwner = ws.ownerId === currentUser?.id;
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => handleSelectWorkspace(ws.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-300/80 dark:border-blue-700/80 text-blue-700 dark:text-blue-200 font-bold shadow-xs'
                        : 'bg-slate-50 dark:bg-[#16192d] hover:bg-slate-100 dark:hover:bg-[#1c2038] text-slate-700 dark:text-slate-300 border border-slate-150 dark:border-[#1f243d]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        <Building2 size={14} />
                      </div>
                      <div className="min-w-0 text-right">
                        <div className="text-xs truncate font-bold text-slate-800 dark:text-slate-100">{ws.name}</div>
                        <div className="text-[9.5px] text-slate-400 dark:text-slate-400 font-medium">
                          {isOwner ? (isRtl ? 'فضای کاری شما (مالک)' : 'Your Workspace (Owner)') : (isRtl ? 'عضو همکار' : 'Collaborator')}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Popover Footer Info */}
            <div className="pt-2 border-t border-slate-100 dark:border-[#1e2338] px-1 flex items-center justify-between text-[10px] text-slate-400">
              <span className="truncate">
                {isRtl ? 'کارگاه جاری:' : 'Current:'} <b className="text-slate-700 dark:text-slate-200 font-bold">{activeWorkspace.name}</b>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkspaceSwitcher;
